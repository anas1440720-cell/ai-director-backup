import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env.local");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.scene) {
      return NextResponse.json(
        {
          success: false,
          message: "Scene is required.",
        },
        { status: 400 }
      );
    }

    const scene: Scene = body.scene;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are an AI Hollywood Director.

Regenerate the following cinematic scene.

Improve the visual description, camera direction and voice narration.

Keep the same scene title.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

Use exactly this structure:

{
  "title": "Scene title",
  "visual": "Detailed cinematic visual description",
  "camera": "Professional cinematic camera direction",
  "voice": "Cinematic voice narration"
}

Current scene:

Title: ${scene.title}

Visual:
${scene.visual}

Camera:
${scene.camera}

Voice:
${scene.voice}
`,
    });

    const text = response.text ?? "";

    let regeneratedScene: Scene;

    try {
      regeneratedScene = JSON.parse(text);
    } catch {
      console.error("Gemini returned invalid scene JSON:", text);

      return NextResponse.json({
        success: false,
        message: "Gemini returned invalid scene data.",
      });
    }

    return NextResponse.json({
      success: true,
      provider: "Gemini",
      scene: regeneratedScene,
    });
  } catch (error) {
    console.error("Gemini Scene Regeneration Error:", error);

    return NextResponse.json({
      success: false,
      message: "Scene regeneration failed.",
    });
  }
}