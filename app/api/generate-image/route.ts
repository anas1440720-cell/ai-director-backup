import { NextResponse } from "next/server";

type ImageProvider = "cloudflare";

type GenerateImageResult = {
  provider: string;
  success: boolean;
  image?: string;
  message?: string;
  status?: number;
};

const MAX_PROMPT_LENGTH = 2048;

/**
 * Keeps the original visual direction intact while adding
 * technical quality constraints required by the image pipeline.
 *
 * IMPORTANT:
 * We do NOT inject a visual style here.
 * The selected style must already exist in the incoming prompt.
 */
function sanitizeAndEnforceQualityPrompt(
  rawPrompt: string,
  aspectRatio: string = "9:16"
): string {
  const clean = rawPrompt.trim();

  const safeAspectRatio =
    aspectRatio === "16:9" ? "16:9" : "9:16";

  const composition =
    safeAspectRatio === "9:16"
      ? "9:16 vertical full-frame cinematic composition"
      : "16:9 widescreen full-frame cinematic composition";

  const qualityAdditions = [
    composition,
    "edge-to-edge frame",
    "sharp cinematic focus",
    "consistent lighting",
    "natural anatomy",
    "natural hands",
    "five fingers per hand",
    "correct body proportions",
    "no extra fingers",
    "no missing fingers",
    "no deformed hands",
    "no deformed limbs",
    "no black bars",
    "no letterbox",
    "no borders",
    "no text",
    "no subtitles",
    "no captions",
    "no UI",
    "no watermark",
    "clean cinematic frame",
  ].join(", ");

  const combined = `${clean}, ${qualityAdditions}`;

  return combined.slice(0, MAX_PROMPT_LENGTH);
}

/**
 * Development-only fallback.
 *
 * This prevents development work from repeatedly consuming
 * provider quota when the real provider is unavailable.
 */
function createDevelopmentMockImage(): GenerateImageResult {
  const fallbackPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAQCAYAAAAqljcETAAAAElEQVR42mNk+M9QzwAEjAwMDAwM//8z/Gf4/58BSIAMRiQ+igwDEsUwf8BwNkgCWRG6DCIKjDEgY2wugqmHaUAmI9wF2NQDAJ3vO/4A4g5EAAAAAElFTkSuQmCC";

  return {
    provider: "development-mock",
    success: true,
    image: `data:image/png;base64,${fallbackPngBase64}`,
    message:
      "Real image provider unavailable. Development fallback used.",
    status: 200,
  };
}

async function generateWithCloudflare(
  prompt: string
): Promise<GenerateImageResult> {
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim();

  const apiToken =
    process.env.CLOUDFLARE_API_TOKEN?.trim();

  if (!accountId || !apiToken) {
    return {
      provider: "cloudflare",
      success: false,
      message:
        "Cloudflare credentials are missing.",
      status: 500,
    };
  }

  const model =
    "@cf/black-forest-labs/flux-1-schnell";

  const url =
    `https://api.cloudflare.com/client/v4/accounts/` +
    `${accountId}/ai/run/${model}`;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 120_000);

  try {
    console.log(
      "☁️ Cloudflare FLUX image generation started."
    );

    console.log(
      `📝 Prompt length: ${prompt.length}/${MAX_PROMPT_LENGTH}`
    );

    const response = await fetch(url, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json, image/*",
      },

      body: JSON.stringify({
        prompt,
      }),

      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        `❌ Cloudflare FLUX failed (${response.status}):`,
        errorText
      );

      return {
        provider: "cloudflare",
        success: false,
        message:
          `Cloudflare failed (${response.status}).`,
        status: response.status,
      };
    }

    const contentType =
      response.headers.get("content-type") || "";

    /**
     * Cloudflare may return the generated image
     * directly as binary image data.
     */
    if (contentType.startsWith("image/")) {
      const buffer =
        await response.arrayBuffer();

      if (!buffer.byteLength) {
        return {
          provider: "cloudflare",
          success: false,
          message:
            "Cloudflare returned an empty image.",
          status: 502,
        };
      }

      const base64 =
        Buffer.from(buffer).toString("base64");

      return {
        provider: "cloudflare",
        success: true,
        image:
          `data:${contentType};base64,${base64}`,
        status: 200,
      };
    }

    /**
     * Some Cloudflare responses return JSON
     * containing the image.
     */
    const data =
      (await response.json()) as {
        success?: boolean;
        result?: {
          image?: string;
        };
        errors?: unknown;
        messages?: unknown;
      };

    const image =
      data?.result?.image;

    if (typeof image === "string" && image) {
      return {
        provider: "cloudflare",
        success: true,
        image:
          image.startsWith("data:")
            ? image
            : `data:image/png;base64,${image}`,
        status: 200,
      };
    }

    console.error(
      "❌ Cloudflare returned no image:",
      JSON.stringify(data)
    );

    return {
      provider: "cloudflare",
      success: false,
      message:
        "Cloudflare returned no image.",
      status: 502,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "❌ Cloudflare image request failed:",
      message
    );

    return {
      provider: "cloudflare",
      success: false,
      message,
      status: 500,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Main image generation function.
 *
 * Cloudflare is intentionally the only real provider here.
 * No extra provider is called automatically.
 *
 * This is important for quota protection.
 */
async function generateImage(
  prompt: string,
  aspectRatio: string
): Promise<GenerateImageResult> {
  const safeAspectRatio =
    aspectRatio === "16:9"
      ? "16:9"
      : "9:16";

  const sanitizedPrompt =
    sanitizeAndEnforceQualityPrompt(
      prompt,
      safeAspectRatio
    );

  console.log(
    "🖼️ Image provider: Cloudflare FLUX.1 Schnell"
  );

  console.log(
    `📐 Image aspect ratio: ${safeAspectRatio}`
  );

  const cloudflareResult =
    await generateWithCloudflare(
      sanitizedPrompt
    );

  if (cloudflareResult.success) {
    console.log(
      "✅ Cloudflare image generated successfully."
    );

    return cloudflareResult;
  }

  console.warn(
    `⚠️ Cloudflare image generation failed: ${
      cloudflareResult.message ||
      "unknown error"
    }`
  );

  /**
   * Development quota protection.
   *
   * Never attempt another paid/limited provider here.
   */
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "🧪 Development mode: using mock image fallback."
    );

    return createDevelopmentMockImage();
  }

  return cloudflareResult;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    if (
      !body ||
      typeof body.prompt !== "string" ||
      !body.prompt.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "IMAGE_PROMPT_REQUIRED",
          message:
            "Image prompt is required.",
        },
        { status: 400 }
      );
    }

    const prompt =
      body.prompt.trim();

    const aspectRatio =
      body.aspectRatio === "16:9"
        ? "16:9"
        : "9:16";

    /**
     * Asset reuse protection.
     *
     * If the frontend already has an image asset,
     * do NOT generate another image.
     *
     * The frontend can send:
     * existingImage / imageUrl / generatedImage
     */
    const existingImage =
      typeof body.existingImage === "string"
        ? body.existingImage.trim()
        : typeof body.imageUrl === "string"
        ? body.imageUrl.trim()
        : typeof body.generatedImage === "string"
        ? body.generatedImage.trim()
        : "";

    if (existingImage) {
      console.log(
        "♻️ Existing image asset supplied. Reusing asset; generation skipped."
      );

      return NextResponse.json({
        success: true,
        skipped: true,
        reused: true,
        provider: "asset-reuse",
        imageUrl: existingImage,
        image: existingImage,
        aspectRatio,
        message:
          "Existing image asset reused.",
      });
    }

    console.log(
      `🎨 Generating image | aspect=${aspectRatio}`
    );

    console.log(
      `📝 Original prompt length=${prompt.length}`
    );

    const result =
      await generateImage(
        prompt,
        aspectRatio
      );

    if (
      !result.success ||
      !result.image
    ) {
      return NextResponse.json(
        {
          success: false,
          code:
            "IMAGE_GENERATION_FAILED",
          provider:
            result.provider,
          message:
            result.message ||
            "Image generation failed.",
          status:
            result.status || 500,
        },
        {
          status:
            result.status &&
            result.status >= 400 &&
            result.status < 600
              ? result.status
              : 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      skipped: false,
      reused: false,

      provider:
        result.provider,

      imageUrl:
        result.image,

      image:
        result.image,

      aspectRatio,

      assetsGenerated: true,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "❌ Image generation route failed:",
      message
    );

    return NextResponse.json(
      {
        success: false,
        code:
          "IMAGE_GENERATION_ROUTE_FAILED",
        message,
      },
      { status: 500 }
    );
  }
}