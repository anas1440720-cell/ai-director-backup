"use client";

import { useState } from "react";

type Props = {
  prompt: string;
};

export default function ImageGenerationEngine({ prompt }: Props) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const generateImage = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError("");
    setImage("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          provider: "cloudflare",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.status === "quota_exceeded") {
          throw new Error(
            "Image generation quota has been exceeded. Please try again later."
          );
        }

        throw new Error(result.message || "Image generation failed.");
      }

      const receivedImage = result.imageUrl || result.image || "";
      setImage(receivedImage);
    } catch (err) {
      console.error("Image generation failed:", err);
      setError(
        err instanceof Error ? err.message : "Image generation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="mt-3 text-sm text-gray-400">Prompt:</p>

      <p className="mt-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white">
        {prompt}
      </p>

      {!loading && !image && (
        <button
          type="button"
          onClick={generateImage}
          disabled={!prompt.trim()}
          className="mt-5 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🖼 Generate Image
        </button>
      )}

      {loading && (
        <div className="mt-6 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-yellow-400">
          ⏳ Generating image...
        </div>
      )}

      {!loading && error && (
        <div className="mt-6">
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-5 text-red-400">
            ❌ {error}
          </div>

          <button
            type="button"
            onClick={generateImage}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {!loading && image && (
        <div className="mt-6 space-y-4">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <img
              src={image}
              alt="Generated scene"
              className="h-auto w-full object-cover"
            />
          </div>

          <p className="font-bold text-green-400">✅ Image Generated</p>

          <button
            type="button"
            onClick={generateImage}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
          >
            🔄 Generate Again
          </button>
        </div>
      )}
    </div>
  );
}