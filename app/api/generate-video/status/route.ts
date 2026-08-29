import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env.local");
}

const ai = new GoogleGenAI({ apiKey });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const operationName = searchParams.get("operation");

    if (!operationName) {
      return NextResponse.json(
        { success: false, message: "Operation name is required." },
        { status: 400 }
      );
    }

    const operation = await ai.operations.getVideosOperation({
      operation: { name: operationName } as any,
    });

    if (operation.error) {
      return NextResponse.json({
        success: false,
        status: "failed",
        message: operation.error.message || "Video generation failed.",
      });
    }

    if (!operation.done) {
      return NextResponse.json({
        success: true,
        status: "processing",
        progress: operation.metadata?.progress ?? null,
      });
    }

    const generatedVideo = operation.response?.generatedVideos?.[0]?.video;

    if (!generatedVideo) {
      return NextResponse.json({
        success: false,
        status: "completed_without_video",
        message: "Video generation completed but no video was returned.",
      });
    }

    return NextResponse.json({
      success: true,
      status: "completed",
      videoUri: generatedVideo.uri ?? null,
    });
  } catch (error) {
    console.error("Gemini Video Status Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to check video generation status.";

    return NextResponse.json(
      { success: false, status: "failed", message },
      { status: 500 }
    );
  }
}