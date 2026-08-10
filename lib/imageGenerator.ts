export type ImageResult = {
  prompt: string;
  imageUrl: string;
  status: "generated" | "failed";
};

export async function generateImage(
  prompt: string
): Promise<ImageResult> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    return {
      prompt: "",
      imageUrl: "",
      status: "failed",
    };
  }

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: cleanPrompt,
      }),
    });

    const data = await response.json();

    if (
      response.status === 429 ||
      data.status === "quota_exceeded"
    ) {
      throw new Error(
        "Image generation quota exceeded."
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Image generation failed."
      );
    }

    const imageUrl = data.image || data.imageUrl || "";

    if (!imageUrl) {
      throw new Error(
        "Image generation succeeded but no image was returned."
      );
    }

    return {
      prompt: cleanPrompt,
      imageUrl,
      status: "generated",
    };
  } catch (error) {
    console.error("Image generation error:", error);

    throw error instanceof Error
      ? error
      : new Error("Image generation failed.");
  }
}