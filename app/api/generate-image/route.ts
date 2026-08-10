import { NextResponse } from "next/server";

type ImageProvider = "pollinations";

type GenerateImageResult = {
  provider: string;
  success: boolean;
  image?: string;
  message?: string;
};

async function generateWithPollinations(
  prompt: string
): Promise<GenerateImageResult> {
  const apiKey = process.env.POLLINATIONS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "POLLINATIONS_API_KEY is missing from .env.local"
    );
  }

  const encodedPrompt = encodeURIComponent(prompt);

  const url =
    `https://gen.pollinations.ai/image/${encodedPrompt}` +
    `?model=flux` +
    `&width=1024` +
    `&height=1024` +
    `&nologo=true`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "Pollinations Image Error:",
      response.status,
      errorText
    );

    if (response.status === 429) {
      return {
        provider: "Pollinations",
        success: false,
        message:
          "Pollinations image quota or rate limit reached.",
      };
    }

    return {
      provider: "Pollinations",
      success: false,
      message:
        `Pollinations image generation failed (${response.status}).`,
    };
  }

  const contentType =
    response.headers.get("content-type") ||
    "image/png";

  const imageBuffer = await response.arrayBuffer();

  const base64 = Buffer.from(imageBuffer).toString(
    "base64"
  );

  return {
    provider: "Pollinations",
    success: true,
    image: `data:${contentType};base64,${base64}`,
  };
}

async function generateImage(
  provider: ImageProvider,
  prompt: string
): Promise<GenerateImageResult> {
  switch (provider) {
    case "pollinations":
      return generateWithPollinations(prompt);

    default:
      return {
        provider,
        success: false,
        message: "Unknown image provider.",
      };
  }
}

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

    const provider: ImageProvider = "pollinations";

    const result = await generateImage(
      provider,
      body.prompt
    );

    if (!result.success) {
      return NextResponse.json(
        result,
        {
          status:
            result.message?.includes("quota") ||
            result.message?.includes("rate limit")
              ? 429
              : 500,
        }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Pollinations Image Provider Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Image generation failed.",
      },
      { status: 500 }
    );
  }
}