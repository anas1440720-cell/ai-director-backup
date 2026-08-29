export type ImageProvider = "fal" | "gemini" | "cloudflare" | "pollinations";

export type ImageResult = {
  prompt: string;
  imageUrl: string;
  status: "generated" | "failed";
  provider: string;
  error?: string;
};

export async function generateImage(
  prompt: string,
  provider: ImageProvider = "cloudflare"
): Promise<ImageResult> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    return {
      prompt: "",
      imageUrl: "",
      status: "failed",
      provider,
      error: "Prompt cannot be empty.",
    };
  }

  try {
    console.log(`🖼️ Requesting image generation with ${provider}...`);

    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: cleanPrompt,
        provider,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || "Image generation failed.");
    }

    const imageUrl = data.imageUrl || data.image || "";

    if (!imageUrl) {
      throw new Error("Image generation completed but no image URL was returned.");
    }

    console.log(`✅ Image ready from ${data.provider || provider}.`);

    return {
      prompt: cleanPrompt,
      imageUrl,
      status: "generated",
      provider: data.provider || provider,
    };
  } catch (error) {
    console.error("❌ Image generation error:", error);

    return {
      prompt: cleanPrompt,
      imageUrl: "",
      status: "failed",
      provider,
      error: error instanceof Error ? error.message : "Image generation failed.",
    };
  }
}