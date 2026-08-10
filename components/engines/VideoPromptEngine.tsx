"use client";

import { useState } from "react";

type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

type VideoPromptEngineProps = {
  scenes: Scene[];
};

export default function VideoPromptEngine({
  scenes,
}: VideoPromptEngineProps) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [videoUrls, setVideoUrls] = useState<{ [key: number]: string }>({});
  const [progress, setProgress] = useState<{ [key: number]: number }>({});
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleGenerateVideo = async (
    scene: Scene,
    index: number
  ) => {
    if (loadingIndex !== null) {
      return;
    }

    setLoadingIndex(index);

    setErrors((prev) => ({
      ...prev,
      [index]: "",
    }));

    setProgress((prev) => ({
      ...prev,
      [index]: 0,
    }));

    const prompt = `
Cinematic camera movement,
${scene.camera},
${scene.visual},
realistic character motion,
smooth animation,
dramatic lighting,
depth of field,
movie quality,
ultra realistic,
4K.
`;

    try {
      // --------------------------------------------------
      // STEP 1 — START VIDEO GENERATION
      // --------------------------------------------------

      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

     const data = await response.json();

if (!response.ok || !data.success) {
  if (
    response.status === 429 ||
    data.status === "quota_exceeded"
  ) {
    throw new Error(
      "⚠️ Video generation is temporarily unavailable because the AI video quota has been reached."
    );
  }

  throw new Error(
    data.message || "Video generation failed."
  );
}

      const operationName = data.operationName;

      if (!operationName) {
        throw new Error(
          "Video generation started but no operation name was returned."
        );
      }

      // --------------------------------------------------
      // STEP 2 — CHECK VIDEO STATUS
      // --------------------------------------------------

      let completed = false;

      while (!completed) {
        await sleep(5000);

        const statusResponse = await fetch(
          `/api/generate-video/status?operation=${encodeURIComponent(
            operationName
          )}`
        );

        const statusData = await statusResponse.json();

        if (!statusResponse.ok || !statusData.success) {
          throw new Error(
            statusData.message ||
              "Failed to check video status."
          );
        }

        // Update progress if Gemini returns it
        if (
          typeof statusData.progress === "number"
        ) {
          setProgress((prev) => ({
            ...prev,
            [index]: statusData.progress,
          }));
        }

        // Still processing
        if (statusData.status === "processing") {
          continue;
        }

        // Generation failed
        if (statusData.status === "failed") {
          throw new Error(
            statusData.message ||
              "Video generation failed."
          );
        }

        // Completed
        if (
          statusData.status === "completed"
        ) {
          if (!statusData.videoUri) {
            throw new Error(
              "Video generation completed but no video URL was returned."
            );
          }

          setVideoUrls((prev) => ({
            ...prev,
            [index]: statusData.videoUri,
          }));

          setProgress((prev) => ({
            ...prev,
            [index]: 100,
          }));

          completed = true;
          continue;
        }

        if (
          statusData.status ===
          "completed_without_video"
        ) {
          throw new Error(
            "Video generation completed but no video was returned."
          );
        }
      }
    } catch (error) {
      console.error(
        "Video generation failed:",
        error
      );

      setErrors((prev) => ({
        ...prev,
        [index]:
          error instanceof Error
            ? error.message
            : "Video generation failed.",
      }));
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-xl font-bold text-white">
        🎥 Video Prompt & Generation Engine
      </h3>

      <p className="mt-3 text-gray-400">
        AI generates cinematic video prompts and
        controls real video generation for every
        scene.
      </p>

      {scenes.map((scene, index) => (
        <div
          key={index}
          className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <h4 className="font-bold text-white">
              {scene.title}
            </h4>

            <button
              type="button"
              onClick={() =>
                handleGenerateVideo(
                  scene,
                  index
                )
              }
              disabled={loadingIndex !== null}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingIndex === index
                ? "جاري التوليد..."
                : videoUrls[index]
                ? "توليد مرة أخرى 🎥"
                : "توليد الفيديو 🎥"}
            </button>
          </div>

          <p className="mt-3 text-gray-300 whitespace-pre-wrap">
            Cinematic camera movement,{" "}
            {scene.camera},{" "}
            {scene.visual},
            realistic character motion,
            smooth animation,
            dramatic lighting,
            depth of field,
            movie quality,
            ultra realistic,
            4K.
          </p>

          {loadingIndex === index && (
            <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
              <p className="font-semibold text-yellow-400">
                ⏳ Generating video...
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Veo is processing this scene.
                Please wait.
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      progress[index] || 0,
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-sm text-gray-400">
                {progress[index] || 0}%
              </p>
            </div>
          )}

          {errors[index] && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4">
              <p className="font-semibold text-red-400">
                ❌ {errors[index]}
              </p>

              <button
                type="button"
                onClick={() =>
                  handleGenerateVideo(
                    scene,
                    index
                  )
                }
                disabled={loadingIndex !== null}
                className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                🔄 Try Again
              </button>
            </div>
          )}

          {videoUrls[index] && (
            <div className="mt-5">
              <video
                src={videoUrls[index]}
                controls
                playsInline
                className="w-full rounded-xl border border-white/10"
              />

              <p className="mt-3 font-bold text-green-400">
                ✅ Video Generated Successfully
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
