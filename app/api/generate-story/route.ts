import { NextResponse } from "next/server";
import { generateStory } from "@/lib/ai-provider";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.idea || !body.idea.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Idea is required.",
        },
        { status: 400 }
      );
    }

    const result = await generateStory(
      "gemini",
      body.idea
    );

    if (!result.success || !("text" in result)) {
      return NextResponse.json(result);
    }

    let json;

    try {
      json = JSON.parse(result.text);
    } catch {
      console.error(
        "Gemini returned invalid JSON:",
        result.text
      );

      return NextResponse.json(
        {
          success: false,
          message: "Gemini returned invalid story data.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      hook: json.hook || "",
      scenes: Array.isArray(json.scenes)
        ? json.scenes
        : [],
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

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
            "Gemini API quota exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gemini generation failed.",
      },
      { status: 500 }
    );
  }
}