
import { NextResponse } from "next/server";

export const maxDuration = 300;

const DEAPI_BASE_URL = "https://api.deapi.ai";
const DEAPI_VIDEO_MODEL = "Ltxv_13B_0_9_8_Distilled_FP8";

function extractDeApiError(payload: unknown): string {
  if (!payload) {
    return "Unknown deAPI error.";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (payload instanceof Error) {
    return payload.message;
  }

  if (typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    if (typeof data.message === "string") {
      return data.message;
    }

    if (typeof data.error === "string") {
      return data.error;
    }

    if (data.data && typeof data.data === "object") {
      const nested = data.data as Record<string, unknown>;

      if (typeof nested.error === "string") {
        return nested.error;
      }

      if (typeof nested.message === "string") {
        return nested.message;
      }
    }

    try {
      return JSON.stringify(payload);
    } catch {
      return "Unknown deAPI error.";
    }
  }

  return String(payload);
}

function normalizeAspectRatio(aspectRatio: unknown): "9:16" | "16:9" {
  return aspectRatio === "9:16" ||
    aspectRatio === "vertical" ||
    aspectRatio === "portrait"
    ? "9:16"
    : "16:9";
}

function getDimensions(aspectRatio: "9:16" | "16:9") {
  if (aspectRatio === "9:16") {
    return {
      width: 432,
      height: 768,
    };
  }

  return {
    width: 768,
    height: 432,
  };
}

function normalizeDuration(duration: unknown): number {
  const parsed = Number(duration);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 4;
  }

  return Math.round(parsed);
}

function buildSilentVideoPrompt(
  prompt: string,
  sceneIndex: unknown,
  sceneCount: unknown
): string {
  const sceneNumber =
    typeof sceneIndex === "number" ? sceneIndex + 1 : null;

  const totalScenes =
    typeof sceneCount === "number" ? sceneCount : null;

  const sceneContext =
    sceneNumber && totalScenes
      ? `This is Scene ${sceneNumber} of ${totalScenes}.`
      : "";

  return [
    prompt.trim(),

    sceneContext,

    "VISUAL MOTION ONLY.",
    "Generate a silent cinematic image-to-video shot from the supplied first-frame image.",

    "CINEMATIC SCENE ACTING.",
    "The shot must depict a real event unfolding over time.",
    "Characters must actively perform the action described by the scene.",
    "Do not merely display or showcase the characters.",
    "Show clear cause-and-effect between the characters, their actions and the environment.",

    "CHARACTER PERFORMANCE.",
    "Use natural body movement.",
    "Use believable gestures.",
    "Use motivated head movement.",
    "Use appropriate eye direction and gaze.",
    "Use natural facial reactions.",
    "Use realistic weight, balance and body mechanics.",
    "Characters should react to what is happening in the scene.",
    "If multiple characters are present, they should visibly interact with one another or with the environment when the scene requires it.",

    "ACTION PRIORITY.",
    "The described scene event is the primary focus.",
    "Every major movement must support the described event.",
    "Do not invent unrelated actions.",
    "Do not add random character movement.",
    "Do not create exaggerated dancing, waving or posing unless explicitly required by the scene.",
    "Do not freeze characters in place.",

    "CAMERA.",
    "Use subtle cinematic camera movement when appropriate.",
    "Camera movement must support the action rather than distract from it.",
    "Avoid unnecessary camera shake.",
    "Avoid aggressive zooming.",
    "Maintain clear visibility of the important action.",

    "CONTINUITY.",
    "Preserve the exact identity of every character from the supplied image.",
    "Preserve face shape, facial features, hairstyle, hair color, skin appearance, body proportions and age.",
    "Preserve clothing, colors, accessories and wardrobe details.",
    "Preserve the environment, architecture, objects and spatial relationships.",
    "Preserve lighting direction and overall visual style.",
    "Do not redesign the characters.",
    "Do not change clothing during the shot.",
    "Do not transform one character into another.",
    "Maintain temporal consistency from the first frame through the final frame.",

    "VISUAL QUALITY.",
    "Natural realistic motion.",
    "Stable anatomy.",
    "Stable hands and fingers.",
    "No duplicated body parts.",
    "No morphing faces.",
    "No identity drift.",
    "No sudden object transformations.",

    "ABSOLUTELY NO AUDIO.",
    "ABSOLUTELY NO SPOKEN DIALOGUE.",
    "ABSOLUTELY NO VOICE.",
    "ABSOLUTELY NO NARRATION.",
    "ABSOLUTELY NO SINGING.",
    "ABSOLUTELY NO MUSIC.",
    "ABSOLUTELY NO SOUND EFFECTS.",
    "GENERATE SILENT VIDEO ONLY.",

    "NO SUBTITLES.",
    "NO CAPTIONS.",
    "NO ON-SCREEN TEXT.",
    "NO LOGOS.",
    "NO WATERMARKS.",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildNegativePrompt(): string {
  return [
    "speech",
    "talking",
    "speaking",
    "dialogue",
    "voice",
    "narration",
    "singing",
    "music",
    "audio",
    "sound",
    "sound effects",
    "subtitles",
    "captions",
    "text",
    "logo",
    "watermark",

    "character showcase",
    "static character",
    "frozen pose",
    "standing and posing",
    "random movement",
    "unmotivated movement",
    "unrelated action",

    "identity change",
    "face change",
    "face morphing",
    "hair change",
    "clothing change",
    "wardrobe change",
    "age change",

    "extra limbs",
    "extra arms",
    "extra legs",
    "extra fingers",
    "missing fingers",
    "deformed hands",
    "mutated hands",
    "distorted anatomy",

    "body morphing",
    "object morphing",
    "environment morphing",
    "flicker",
    "frame flicker",
    "temporal instability",
    "camera shake",
    "violent camera movement",
  ].join(", ");
}

async function pollDeApiJob(
  apiKey: string,
  requestId: string
) {
  const maxAttempts = 150;
  const pollIntervalMs = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(
      `${DEAPI_BASE_URL}/api/v2/jobs/${encodeURIComponent(requestId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const text = await response.text();

    let payload: unknown = null;

    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!response.ok) {
      throw new Error(
        `deAPI job status request failed (${response.status}): ${extractDeApiError(
          payload
        )}`
      );
    }

    const data =
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      payload.data &&
      typeof payload.data === "object"
        ? (payload.data as Record<string, unknown>)
        : {};

    const status =
      typeof data.status === "string"
        ? data.status.toLowerCase()
        : "";

    const progress =
      typeof data.progress === "number"
        ? data.progress
        : undefined;

    console.log(
      `🎬 deAPI job ${requestId} status: ${
        status || "unknown"
      }${
        progress !== undefined
          ? ` (${progress}%)`
          : ""
      }`
    );

    if (status === "done" || status === "completed") {
      const resultUrl =
        typeof data.result_url === "string"
          ? data.result_url
          : typeof data.result === "string"
          ? data.result
          : null;

      if (!resultUrl) {
        throw new Error(
          `deAPI job completed but returned no result URL: ${JSON.stringify(
            payload
          )}`
        );
      }

      return {
        resultUrl,
        payload,
      };
    }

    if (
      status === "error" ||
      status === "failed" ||
      status === "cancelled"
    ) {
      throw new Error(
        `deAPI video job failed: ${extractDeApiError(
          data.error ?? payload
        )}`
      );
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) =>
        setTimeout(resolve, pollIntervalMs)
      );
    }
  }

  throw new Error(
    `deAPI video job timed out while waiting for request ${requestId}.`
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      prompt,
      imageUrl,
      duration,
      aspectRatio,
      projectDuration,
      sceneIndex,
      sceneCount,
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          code: "VIDEO_PROMPT_REQUIRED",
          message: "Video prompt is required.",
        },
        { status: 400 }
      );
    }

    if (
      !imageUrl ||
      typeof imageUrl !== "string" ||
      !imageUrl.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "VIDEO_IMAGE_REQUIRED",
          message: "Image URL is required.",
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.DEAPI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          code: "DEAPI_API_KEY_MISSING",
          message: "DEAPI_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const cleanPrompt = prompt.trim();
    const cleanImageUrl = imageUrl.trim();

    const requestedDuration =
      normalizeDuration(duration);

    /*
     * LTX-Video 0.9.8 Distilled
     *
     * deAPI constraints:
     * FPS = 30
     * Steps = 1
     * Frames = 30 -> 120
     *
     * Therefore:
     * minimum = 1 second
     * maximum = 4 seconds
     */

    const fps = 30;

    const requestedFrames =
      Math.round(requestedDuration * fps);

    const numFrames = Math.max(
      30,
      Math.min(120, requestedFrames)
    );

    const effectiveDuration =
      numFrames / fps;

    const normalizedAspectRatio =
      normalizeAspectRatio(aspectRatio);

    const dimensions =
      getDimensions(normalizedAspectRatio);

    const silentVideoPrompt =
      buildSilentVideoPrompt(
        cleanPrompt,
        sceneIndex,
        sceneCount
      );

    const negativePrompt =
      buildNegativePrompt();

    console.log(
      "🎬 Starting deAPI SILENT cinematic video generation..."
    );

    console.log(
      `🎬 Scene: ${
        typeof sceneIndex === "number"
          ? sceneIndex + 1
          : "?"
      }/${typeof sceneCount === "number" ? sceneCount : "?"}`
    );

    console.log(
      `🎬 Model: ${DEAPI_VIDEO_MODEL}`
    );

    console.log(
      `⏱ Requested duration: ${requestedDuration}s`
    );

    console.log(
      `⏱ Effective duration: ${effectiveDuration}s`
    );

    console.log(
      `🎞 Frames: ${numFrames}`
    );

    console.log(
      `🎞 FPS: ${fps}`
    );

    console.log(
      `🎞 Steps: 1`
    );

    console.log(
      `📐 Aspect ratio: ${normalizedAspectRatio}`
    );

    console.log(
      `📐 Dimensions: ${dimensions.width}x${dimensions.height}`
    );

    console.log(
      `🎬 Project duration: ${
        projectDuration ?? "unknown"
      }s`
    );

    console.log(
      `🔇 Silent architecture: ENABLED`
    );

    console.log(
      `📝 Original prompt length: ${cleanPrompt.length}`
    );

    console.log(
      `📝 Final video prompt length: ${silentVideoPrompt.length}`
    );

    try {
      /*
       * Fetch the already-generated image.
       *
       * IMPORTANT:
       * No new image generation happens here.
       * The existing scene image is reused directly.
       */

      console.log(
        "🖼️ Fetching existing scene image for deAPI..."
      );

      const imageResponse =
        await fetch(cleanImageUrl, {
          method: "GET",
          cache: "no-store",
        });

      if (!imageResponse.ok) {
        throw new Error(
          `Failed to fetch source image (${imageResponse.status}).`
        );
      }

      const imageContentType =
        imageResponse.headers.get(
          "content-type"
        ) || "image/png";

      const imageBuffer =
        await imageResponse.arrayBuffer();

      if (!imageBuffer.byteLength) {
        throw new Error(
          "Source image is empty."
        );
      }

      const maxImageBytes =
        10 * 1024 * 1024;

      if (
        imageBuffer.byteLength >
        maxImageBytes
      ) {
        throw new Error(
          `Source image exceeds deAPI 10 MB limit (${imageBuffer.byteLength} bytes).`
        );
      }

      console.log(
        `🖼️ Source image size: ${imageBuffer.byteLength} bytes`
      );

      console.log(
        `🖼️ Source image type: ${imageContentType}`
      );

      const imageBlob = new Blob(
        [imageBuffer],
        {
          type: imageContentType,
        }
      );

      const formData =
        new FormData();

      formData.append(
        "prompt",
        silentVideoPrompt
      );

      formData.append(
        "negative_prompt",
        negativePrompt
      );

      formData.append(
        "first_frame_image",
        imageBlob,
        "first-frame.png"
      );

      formData.append(
        "width",
        String(dimensions.width)
      );

      formData.append(
        "height",
        String(dimensions.height)
      );

      /*
       * LTX-Video 0.9.8 Distilled:
       * guidance is intentionally omitted.
       */

      formData.append(
        "steps",
        "1"
      );

      formData.append(
        "seed",
        "-1"
      );

      formData.append(
        "frames",
        String(numFrames)
      );

      formData.append(
        "fps",
        String(fps)
      );

      formData.append(
        "model",
        DEAPI_VIDEO_MODEL
      );

      console.log(
        "🔇 Audio policy: video provider MUST generate no audio."
      );

      console.log(
        "🎬 Submitting image-to-video job to deAPI..."
      );

      const createResponse =
        await fetch(
          `${DEAPI_BASE_URL}/api/v2/videos/animations`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json",
            },
            body: formData,
            cache: "no-store",
          }
        );

      const createText =
        await createResponse.text();

      let createPayload: unknown =
        null;

      try {
        createPayload =
          createText
            ? JSON.parse(createText)
            : null;
      } catch {
        createPayload =
          createText;
      }

      if (!createResponse.ok) {
        const message =
          extractDeApiError(
            createPayload
          );

        const retryAfter =
          createResponse.headers.get(
            "retry-after"
          );

        const rateLimit =
          createResponse.headers.get(
            "x-ratelimit-limit"
          );

        const rateLimitRemaining =
          createResponse.headers.get(
            "x-ratelimit-remaining"
          );

        const rateLimitReset =
          createResponse.headers.get(
            "x-ratelimit-reset"
          );

        const dailyLimit =
          createResponse.headers.get(
            "x-ratelimit-daily-limit"
          );

        const dailyRemaining =
          createResponse.headers.get(
            "x-ratelimit-daily-remaining"
          );

        console.error(
          "🚨 deAPI rate-limit / submission headers:",
          {
            retryAfter,
            rateLimit,
            rateLimitRemaining,
            rateLimitReset,
            dailyLimit,
            dailyRemaining,
          }
        );

        console.error(
          `❌ deAPI video submission failed (${createResponse.status}):`,
          message
        );

        return NextResponse.json(
          {
            success: false,

            code:
              createResponse.status === 401
                ? "DEAPI_UNAUTHORIZED"
                : createResponse.status === 429
                ? "DEAPI_RATE_LIMITED"
                : "DEAPI_VIDEO_SUBMISSION_FAILED",

            message,

            provider: "deapi",

            model:
              DEAPI_VIDEO_MODEL,

            statusCode:
              createResponse.status,

            sceneIndex:
              sceneIndex ?? null,

            sceneCount:
              sceneCount ?? null,

            retryAfter,
            rateLimit,
            rateLimitRemaining,
            rateLimitReset,
            dailyLimit,
            dailyRemaining,

            /*
             * Explicitly tell the frontend this request
             * must not be retried blindly on a rate limit.
             */
            retryable:
              createResponse.status === 429,
          },
          {
            status:
              createResponse.status === 429
                ? 429
                : createResponse.status >= 400 &&
                  createResponse.status < 500
                ? createResponse.status
                : 502,
          }
        );
      }

      const requestId =
        createPayload &&
        typeof createPayload === "object" &&
        "data" in createPayload &&
        createPayload.data &&
        typeof createPayload.data === "object" &&
        "request_id" in createPayload.data &&
        typeof (
          createPayload.data as Record<
            string,
            unknown
          >
        ).request_id === "string"
          ? (
              createPayload.data as Record<
                string,
                unknown
              >
            ).request_id as string
          : null;

      if (!requestId) {
        throw new Error(
          `deAPI did not return request_id: ${JSON.stringify(
            createPayload
          )}`
        );
      }

      console.log(
        `🆔 deAPI request_id: ${requestId}`
      );

      console.log(
        "⏳ Waiting for deAPI video job..."
      );

      const result =
        await pollDeApiJob(
          apiKey,
          requestId
        );

      console.log(
        "✅ deAPI silent video generated successfully."
      );

      console.log(
        `🎬 Scene ${
          typeof sceneIndex === "number"
            ? sceneIndex + 1
            : "?"
        } completed.`
      );

      return NextResponse.json({
        success: true,

        status: "completed",

        provider: "deapi",

        model:
          DEAPI_VIDEO_MODEL,

        videoUri:
          result.resultUrl,

        videoUrl:
          result.resultUrl,

        requestId,

        requestedDuration,

        effectiveDuration,

        numFrames,

        fps,

        steps: 1,

        width:
          dimensions.width,

        height:
          dimensions.height,

        aspectRatio:
          normalizedAspectRatio,

        /*
         * Explicit silent-video contract.
         */
        hasAudio: false,

        silent: true,

        audioSource:
          "none",

        audioGeneratedByVideoProvider:
          false,

        /*
         * Existing generated image was reused.
         */
        sourceImageReused: true,

        projectDuration:
          projectDuration ?? null,

        sceneIndex:
          sceneIndex ?? null,

        sceneCount:
          sceneCount ?? null,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        "❌ deAPI video generation failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,

          code:
            "DEAPI_VIDEO_GENERATION_FAILED",

          message,

          provider: "deapi",

          model:
            DEAPI_VIDEO_MODEL,

          sceneIndex:
            sceneIndex ?? null,

          sceneCount:
            sceneCount ?? null,
        },
        { status: 502 }
      );
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "❌ Invalid generate-video request:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        code: "INVALID_VIDEO_REQUEST",
        message,
      },
      { status: 400 }
    );
  }
}