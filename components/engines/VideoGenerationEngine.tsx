"use client";

import { useState } from "react";

type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
  imageUrl?: string;
  duration?: number;
  action?: string;
  interaction?: string;
  reaction?: string;
  movement?: string;
  emotion?: string;
  environmentInteraction?: string;
  continuity?: string;
};

type VideoGenerationEngineProps = {
  scenes: Scene[];
  aspectRatio?: string;
  onVideoGenerated?: (index: number, videoUrl: string) => void;
};

export default function VideoGenerationEngine({
  scenes = [],
  aspectRatio = "9:16",
  onVideoGenerated,
}: VideoGenerationEngineProps) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [videoUrls, setVideoUrls] = useState<{ [key: number]: string }>({});
  const [errorMessages, setErrorMessages] = useState<{ [key: number]: string }>({});

const handleGenerateVideo = async (scene: Scene, index: number) => {
  setLoadingIndex(index);
  setErrorMessages((prev) => ({ ...prev, [index]: "" }));

  const sceneDuration = Math.max(
    1,
    Math.round(Number(scene.duration) || 1)
  );

  const prompt = [
    "CINEMATIC SCENE ACTING.",
    `SCENE EVENT: ${scene.visual || ""}`,
    `ACTION: ${scene.action || ""}`,
    `INTERACTION: ${scene.interaction || ""}`,
    `REACTION: ${scene.reaction || ""}`,
    `MOVEMENT: ${scene.movement || ""}`,
    `EMOTION: ${scene.emotion || ""}`,
    `ENVIRONMENT INTERACTION: ${scene.environmentInteraction || ""}`,
    `CAMERA: ${scene.camera || ""}`,

    "The scene must show a real event unfolding continuously over time.",
    "Characters must physically perform the described actions.",
    "Show clear cause-and-effect between actions, reactions and interactions.",
    "Use natural body movement, eye direction, facial reactions, gestures and environmental interaction.",
    "Characters must interact with each other when the scene describes interaction.",
    "Do not simply animate or zoom the source image.",
    "Do not use a static image with artificial camera movement.",
    "Do not create continuous meaningless lip movement.",
    "Do not invent unrelated actions.",
    "Do not freeze the characters in a pose.",
    "Maintain believable physical motion throughout the shot.",

    "Preserve the exact character identity, face, hair, skin tone, body proportions and clothing from the source image.",
    "Preserve the exact environment and visual style from the source image.",

    "VISUAL MOTION ONLY.",
    "NO DIALOGUE.",
    "NO VOICE.",
    "NO NARRATION.",
    "NO MUSIC.",
    "NO SOUND EFFECTS.",
    "NO SUBTITLES.",
    "NO CAPTIONS.",
    "NO TEXT.",
    "NO WATERMARK."
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("/api/generate-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        imageUrl: scene.imageUrl,
        duration: sceneDuration,
        aspectRatio,
        sceneIndex: index,
        sceneCount: scenes.length,
      }),
    });

    const data = await response.json();

    const generatedUrl = data.videoUrl || data.videoUri;

    if (!response.ok || !data.success || !generatedUrl) {
      throw new Error(
        data.message ||
          data.error ||
          "Video generation failed."
      );
    }

    setVideoUrls((prev) => ({
      ...prev,
      [index]: generatedUrl,
    }));

    onVideoGenerated?.(index, generatedUrl);
  } catch (err) {
    console.error("Video generation failed:", err);

    const msg =
      err instanceof Error
        ? err.message
        : "Video generation failed.";

    setErrorMessages((prev) => ({
      ...prev,
      [index]: msg,
    }));
  } finally {
    setLoadingIndex(null);
  }
};

  return (
    <div className="mt-8 rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-xl md:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            🎬 Video Generation Engine
          </h3>

          <p className="mt-1 text-xs text-gray-300">
            Cinematic image-to-video acting with physical action,
            interaction, reaction and strict character continuity.
          </p>
        </div>

        <span className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-bold text-purple-300">
          {scenes.length} Scenes
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-white/5 pb-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-400/20 text-xs font-bold text-purple-300">
                  {index + 1}
                </span>

                <h4 className="font-bold text-white">
                  {scene.title || `Scene ${index + 1}`}
                </h4>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400">
                  {Math.round(Number(scene.duration) || 5)}s
                </span>

                <button
                  type="button"
                  onClick={() => handleGenerateVideo(scene, index)}
                  disabled={
                    loadingIndex === index ||
                    !scene.imageUrl
                  }
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingIndex === index
                    ? "Generating..."
                    : videoUrls[index]
                    ? "Regenerate Video"
                    : "Generate Video"}
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs text-gray-300">
              <p>
                <span className="font-semibold text-purple-300">
                  Camera:
                </span>{" "}
                {scene.camera || "Cinematic movement"}
              </p>

              <p>
                <span className="font-semibold text-cyan-300">
                  Action:
                </span>{" "}
                {scene.action || scene.visual || "—"}
              </p>

              <p>
                <span className="font-semibold text-amber-300">
                  Interaction:
                </span>{" "}
                {scene.interaction || "—"}
              </p>
            </div>

            {errorMessages[index] && (
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {errorMessages[index]}
              </div>
            )}

            {videoUrls[index] && (
              <video
                className="mt-4 w-full rounded-xl"
                controls
                playsInline
                src={videoUrls[index]}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}