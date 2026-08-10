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

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Image generation failed."
    );
  }

  return {
    prompt: cleanPrompt,
    imageUrl: data.imageUrl,
    status: "generated",
  };
}