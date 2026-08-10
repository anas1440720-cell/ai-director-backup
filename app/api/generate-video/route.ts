import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env.local");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Video prompt is required.",
        },
        { status: 400 }
      );
    }

    const operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: prompt.trim(),
      config: {
        aspectRatio: "16:9",
        resolution: "720p",
        numberOfVideos: 1,
      },
    });

    return NextResponse.json({
      success: true,
      status: "processing",
      operationName: operation.name,
      message: "Video generation started.",
    });
  } catch (error) {
    console.error("Gemini Video API Error:", error);

    const status =
      error &&
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;

    if (status === 429) {
      return NextResponse.json(
        {
          success: false,
          status: "quota_exceeded",
          message:
            "Gemini video generation quota exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Video generation failed.",
      },
      { status: 500 }
    );
  }
}