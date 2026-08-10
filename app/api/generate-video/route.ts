import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(req: Request) {
  try {
    const { prompt, imageUrl } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Video prompt is required.",
        },
        { status: 400 }
      );
    }

    if (!imageUrl || !imageUrl.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Image URL is required.",
        },
        { status: 400 }
      );
    }

    const falKey = process.env.FAL_KEY;

    if (!falKey) {
      return NextResponse.json(
        {
          success: false,
          message: "FAL_KEY is missing from .env.local",
        },
        { status: 500 }
      );
    }

    fal.config({
      credentials: falKey,
    });

    console.log("🎬 Preparing image for fal...");

    let falImageUrl = imageUrl.trim();

    /*
     * If the image is a Base64 data URL,
     * upload it to fal storage first.
     */
    if (falImageUrl.startsWith("data:image/")) {
      const match = falImageUrl.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
      );

      if (!match) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid Base64 image data.",
          },
          { status: 400 }
        );
      }

      const mimeType = match[1];
      const base64Data = match[2];

      const buffer = Buffer.from(base64Data, "base64");

      const imageBlob = new Blob([buffer], {
        type: mimeType,
      });

      console.log("☁️ Uploading image to fal storage...");

      falImageUrl = await fal.storage.upload(imageBlob);

      console.log(
        "✅ Image uploaded to fal storage."
      );
    }

    console.log(
      "🎬 Starting fal video generation..."
    );

    const result = await fal.subscribe(
      "bytedance/seedance-2.0/image-to-video",
      {
        input: {
          prompt: prompt.trim(),
          image_url: falImageUrl,
          resolution: "720p",
          duration: "4",
          aspect_ratio: "16:9",
          generate_audio: false,
        },

        logs: true,

        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs?.forEach((log) => {
              console.log(
                "🎬 fal:",
                log.message
              );
            });
          }
        },
      }
    );

    const videoUrl = result.data?.video?.url;

    if (!videoUrl) {
      console.error(
        "fal returned no video:",
        result.data
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "fal completed generation but returned no video URL.",
        },
        { status: 500 }
      );
    }

    console.log(
      "✅ fal video generated successfully."
    );

    return NextResponse.json({
      success: true,
      status: "completed",
      provider: "fal",
      model:
        "bytedance/seedance-2.0/image-to-video",
      videoUri: videoUrl,
    });
  } catch (error) {
    console.error(
      "fal Video API Error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "fal video generation failed.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}