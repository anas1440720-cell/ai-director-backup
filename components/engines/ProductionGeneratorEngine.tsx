"use client";

import { useState } from "react";

import { generateImage as generateImageAsset } from "@/lib/imageGenerator";

type ProductionGeneratorProps = {
  idea: string;

  imagePrompts: string[];

  videoPrompts: string[];

  voiceScripts: string[];

  musicTimeline: string[];

  imageProvider?: "gemini" | "openai" | "claude";

  onImageGenerated?: (index: number) => void;

  onVideoGenerated?: (index: number) => void;

  onGenerationError?: (message: string) => void;
};

export default function ProductionGeneratorEngine({
  idea,
  imagePrompts,
  videoPrompts,
  voiceScripts,
  musicTimeline,
  imageProvider = "gemini",
  onImageGenerated,
  onVideoGenerated,
  onGenerationError,
}: ProductionGeneratorProps) {
  const [images, setImages] = useState<(string | null)[]>(
    imagePrompts.map(() => null)
  );

  const [videos, setVideos] = useState<(string | null)[]>(
    videoPrompts.map(() => null)
  );

  const [loadingImageIndex, setLoadingImageIndex] =
    useState<number | null>(null);

  const [loadingVideoIndex, setLoadingVideoIndex] =
    useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  const generateImage = async (index: number) => {
    if (
      loadingImageIndex !== null ||
      loadingVideoIndex !== null
    ) {
      return;
    }

    setLoadingImageIndex(index);
    setError(null);

    try {
      const result = await generateImageAsset(
        imagePrompts[index],
        imageProvider
      );

      setImages((prev) => {
        const updated = [...prev];
        updated[index] = result.imageUrl;
        return updated;
      });

      onImageGenerated?.(index);
    } catch (err) {
      console.error(
        "Image generation error:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Image generation failed.";

      setError(message);
      onGenerationError?.(message);
    } finally {
      setLoadingImageIndex(null);
    }
  };
  const waitForVideo = async (
    operationName: string,
    index: number
  ) => {
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );

      const response = await fetch(
        `/api/generate-video/status?operation=${encodeURIComponent(
          operationName
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to check video status."
        );
      }

      console.log(
        `🎥 Scene ${index + 1} video status:`,
        data.status,
        data.progress
      );

      if (data.status === "completed") {
        if (!data.videoUri) {
          throw new Error(
            "Video completed but no video URL was returned."
          );
        }

   setVideos((prev) => {
  const updated = [...prev];
  updated[index] = data.videoUri;
  return updated;
});

onVideoGenerated?.(index);

        return;
      }

      if (
        data.status === "failed" ||
        data.status ===
          "completed_without_video"
      ) {
        throw new Error(
          data.message ||
            "Video generation failed."
        );
      }
    }

    throw new Error(
      "Video generation timed out."
    );
  };

  const generateVideo = async (index: number) => {
    if (
      loadingImageIndex !== null ||
      loadingVideoIndex !== null
    ) {
      return;
    }

    setLoadingVideoIndex(index);
    setError(null);

    try {
      const response = await fetch(
        "/api/generate-video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: videoPrompts[index],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Video generation failed."
        );
      }

      if (!data.operationName) {
        throw new Error(
          "Video generation started but no operation was returned."
        );
      }

      console.log(
        "🎬 Video operation started:",
        data.operationName
      );

      await waitForVideo(
        data.operationName,
        index
      );
    } catch (err) {
      console.error(
        "Video generation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Video generation failed."
      );
    } finally {
      setLoadingVideoIndex(null);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white">
        🎬 Production Generator Engine
      </h3>

      <p className="mt-3 text-gray-400">
        Generate real AI visual assets for each
        scene.
      </p>

      <p className="mt-3 text-gray-300">
        🎥 Project:
        <span className="ml-2 text-white">
          {idea}
        </span>
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          ❌ {error}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {imagePrompts.map(
          (prompt, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <h4 className="text-lg font-bold text-white">
                🎬 Scene {index + 1}
              </h4>

              {/* IMAGE */}
              <p className="mt-4 text-sm text-gray-400">
                🖼 Image Prompt
              </p>

              <p className="mt-2 rounded-xl bg-black/30 p-3 text-gray-200">
                {prompt}
              </p>

              {images[index] ? (
                <div className="mt-5">
                  <img
                    src={images[index] ?? ""}
                    alt={`Generated Scene ${
                      index + 1
                    }`}
                    className="w-full rounded-xl border border-white/10"
                  />

                  <p className="mt-2 text-sm font-bold text-green-400">
                    ✓ Image Generated
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    generateImage(index)
                  }
                  disabled={
                    loadingImageIndex !== null ||
                    loadingVideoIndex !== null
                  }
                  className="mt-5 rounded-xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingImageIndex ===
                  index
                    ? "⏳ Generating Image..."
                    : "🖼 Generate Image"}
                </button>
              )}

              {/* VIDEO */}
              <p className="mt-6 text-sm text-gray-400">
                🎥 Video Prompt
              </p>

              <p className="mt-2 rounded-xl bg-black/30 p-3 text-gray-200">
                {videoPrompts[index] ||
                  "No video prompt available."}
              </p>

              {videos[index] ? (
                <div className="mt-5">
                  <video
                    src={videos[index] ?? ""}
                    controls
                    className="w-full rounded-xl border border-white/10"
                  />

                  <p className="mt-2 text-sm font-bold text-green-400">
                    ✓ Video Generated
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    generateVideo(index)
                  }
                  disabled={
                    loadingImageIndex !== null ||
                    loadingVideoIndex !== null ||
                    !videoPrompts[index]
                  }
                  className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingVideoIndex ===
                  index
                    ? "⏳ Generating Video..."
                    : "🎥 Generate Video"}
                </button>
              )}

              {loadingVideoIndex ===
                index && (
                <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-yellow-400">
                  ⏳ Veo is generating Scene{" "}
                  {index + 1}...
                  <br />
                  <span className="text-sm text-yellow-300/70">
                    This may take some time.
                  </span>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}