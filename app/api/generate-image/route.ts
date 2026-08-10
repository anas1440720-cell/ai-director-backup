import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

    if (!body.prompt || !body.prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Image prompt is required.",
        },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: body.prompt,
      config: {
        responseModalities: ["IMAGE"],
      },
    });

    const parts =
      response.candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        return NextResponse.json({
          success: true,
          image: `data:${
            part.inlineData.mimeType || "image/png"
          };base64,${part.inlineData.data}`,
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gemini did not return an image.",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Gemini Image API Error:", error);

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
            "Gemini image generation quota exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Image generation failed.",
      },
      { status: 500 }
    );
  }
}