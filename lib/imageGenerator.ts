export type ImageProvider =
  | "gemini"
  | "openai"
  | "claude";

export type ImageResult = {
  prompt: string;
  imageUrl: string;
  status: "generated" | "failed";
  provider: string;
};

export async function generateImage(
  prompt: string,
  provider: ImageProvider = "gemini"
): Promise<ImageResult> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    return {
      prompt: "",
      imageUrl: "",
      status: "failed",
      provider,
    };
  }

  try {
    const response = await fetch(
      "/api/generate-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
          provider,
        }),
      }
    );

    const data = await response.json();

    if (
      response.status === 429 ||
      data.status === "quota_exceeded"
    ) {
      throw new Error(
        data.message ||
          "Image generation quota exceeded."
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Image generation failed."
      );
    }

    const imageUrl =
      data.image ||
      data.imageUrl ||
      "";

    if (!imageUrl) {
      throw new Error(
        "Image generation succeeded but no image was returned."
      );
    }

    return {
      prompt: cleanPrompt,
      imageUrl,
      status: "generated",
      provider:
        data.provider || provider,
    };
  } catch (error) {
    console.error(
      "Image generation error:",
      error
    );

    throw error instanceof Error
      ? error
      : new Error(
          "Image generation failed."
        );
  }
}