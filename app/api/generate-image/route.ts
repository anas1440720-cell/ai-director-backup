import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type ImageProvider = "gemini" | "openai" | "claude";

type GenerateImageResult = {
  provider: string;
  success: boolean;
  image?: string;
  message?: string;
};

const IMAGE_PROVIDERS: {
  id: ImageProvider;
  name: string;
  available: boolean;
}[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    available: true,
  },
  {
    id: "openai",
    name: "OpenAI",
    available: false,
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    available: false,
  },
];

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing from .env.local"
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

function getImageProvider(
  provider: ImageProvider
) {
  return IMAGE_PROVIDERS.find(
    (item) => item.id === provider
  );
}

async function generateWithGemini(
  prompt: string
): Promise<GenerateImageResult> {
  const ai = getGeminiClient();

  const response =
    await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["IMAGE"],
      },
    });

  const parts =
    response.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        provider: "Gemini",
        success: true,
        image: `data:${
          part.inlineData.mimeType ||
          "image/png"
        };base64,${part.inlineData.data}`,
      };
    }
  }

  return {
    provider: "Gemini",
    success: false,
    message:
      "Gemini did not return an image.",
  };
}

async function generateImage(
  provider: ImageProvider,
  prompt: string
): Promise<GenerateImageResult> {
  const config = getImageProvider(provider);

  if (!config) {
    return {
      provider,
      success: false,
      message: "Unknown image provider.",
    };
  }

  if (!config.available) {
    return {
      provider: config.name,
      success: false,
      message:
        `${config.name} image generation is not connected yet.`,
    };
  }

  switch (provider) {
    case "gemini":
      return generateWithGemini(prompt);

    case "openai":
      return {
        provider: "OpenAI",
        success: false,
        message:
          "OpenAI image generation is not connected yet.",
      };

    case "claude":
      return {
        provider: "Claude",
        success: false,
        message:
          "Claude image generation is not connected yet.",
      };

    default:
      return {
        provider,
        success: false,
        message: "Unknown image provider.",
      };
  }
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    if (
      !body.prompt ||
      !body.prompt.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image prompt is required.",
        },
        { status: 400 }
      );
    }

    const provider: ImageProvider =
      body.provider || "gemini";

    const result = await generateImage(
      provider,
      body.prompt
    );

    if (!result.success) {
      return NextResponse.json(
        result,
        {
          status:
            result.message?.includes(
              "quota"
            )
              ? 429
              : 500,
        }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Image Provider Error:",
      error
    );

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
          provider: "Gemini",
          success: false,
          status: "quota_exceeded",
          message:
            "Gemini image generation quota exceeded. Please try another image provider.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Image generation failed.",
      },
      { status: 500 }
    );
  }
}