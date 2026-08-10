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

  // ================================
  // IMAGE GENERATION
  // ================================

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

      console.log(
        `🖼 Scene ${index + 1} image generated successfully.`
      );

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

  // ================================
  // VIDEO GENERATION - FAL
  // ================================

  const generateVideo = async (index: number) => {
    if (
      loadingImageIndex !== null ||
      loadingVideoIndex !== null
    ) {
      return;
    }

    // Video needs the generated scene image
    if (!images[index]) {
      const message =
        "Please generate the scene image first.";

      setError(message);
      onGenerationError?.(message);

      return;
    }

    if (!videoPrompts[index]) {
      const message =
        "No video prompt available.";

      setError(message);
      onGenerationError?.(message);

      return;
    }

    setLoadingVideoIndex(index);
    setError(null);

    try {
      console.log(
        `🎬 Starting fal video generation for Scene ${
          index + 1
        }...`
      );

      const response = await fetch(
        "/api/generate-video",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            prompt: videoPrompts[index],
            imageUrl: images[index],
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

      if (!data.videoUri) {
        throw new Error(
          "Video was generated but no video URL was returned."
        );
      }

      console.log(
        `✅ Scene ${index + 1} video generated successfully.`
      );

      setVideos((prev) => {
        const updated = [...prev];

        updated[index] = data.videoUri;

        return updated;
      });

      onVideoGenerated?.(index);
    } catch (err) {
      console.error(
        "Video generation error:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Video generation failed.";

      setError(message);

      onGenerationError?.(message);
    } finally {
      setLoadingVideoIndex(null);
    }
  };

  // ================================
  // UI
  // ================================

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-2xl font-bold text-white">
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

      {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          ❌ {error}
        </div>
      )}

      {/* SCENES */}

      <div className="mt-6 space-y-6">
        {imagePrompts.map(
          (prompt, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              {/* SCENE TITLE */}

              <h4 className="text-lg font-bold text-white">
                🎬 Scene {index + 1}
              </h4>

              {/* ================================
                  IMAGE
              ================================= */}

              <p className="mt-4 text-sm text-gray-400">
                🖼 Image Prompt
              </p>

              <p className="mt-2 rounded-xl bg-black/30 p-3 text-gray-200">
                {prompt}
              </p>

              {/* GENERATED IMAGE */}

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

              {/* ================================
                  VIDEO
              ================================= */}

              <p className="mt-6 text-sm text-gray-400">
                🎥 Video Prompt
              </p>

              <p className="mt-2 rounded-xl bg-black/30 p-3 text-gray-200">
                {videoPrompts[index] ||
                  "No video prompt available."}
              </p>

              {/* GENERATED VIDEO */}

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
                    !images[index] ||
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

              {/* VIDEO STATUS */}

              {loadingVideoIndex ===
                index && (
                <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-yellow-400">
                  ⏳ fal is generating Scene{" "}
                  {index + 1}...
                  <br />

                  <span className="text-sm text-yellow-300/70">
                    The video may take some
                    time to complete.
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