"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface ProductionGeneratorProps {
  idea?: string;
  sceneDurations?: number[];
  imageProvider?: string;
  duration?: string | number;
  imagePrompts?: string[];
  videoPrompts?: string[];
  voiceScripts?: string[];
  musicTimeline?: string[];
  sfxPrompts?: string[];
  generatedImages?: (string | null)[];
  generatedVideos?: (string | null)[];
  generatedVoiceAudios?: (string | null)[];
  generatedMusicAudios?: (string | null)[];
  generatedSfxAudios?: (string | null)[];
  onImageGenerated?: (index: number, imageUrl: string) => void;
  onVideoGenerated?: (index: number, videoUri: string) => void;
  onVoiceGenerated?: (index: number, audioUrl: string) => void;
  onMusicGenerated?: (index: number, audioUrl: string) => void;
  onSfxGenerated?: (index: number, audioUrl: string) => void;
  onGenerationError?: (message: string) => void;
}

const MAX_SCENE_DURATION = 4;

function getError(result: any, fallback: string) {
  return String(result?.message || result?.error || fallback);
}

function hashPlanKey(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

type NavigatorWithLocks = Navigator & {
  locks?: {
    request: (
      name: string,
      options: { ifAvailable: true },
      callback: (lock: unknown | null) => Promise<void> | void
    ) => Promise<void>;
  };
};

export default function ProductionGeneratorEngine({
  duration = 30,
  sceneDurations = [],
  imagePrompts = [],
  videoPrompts = [],
  voiceScripts = [],
  generatedImages = [],
  generatedVideos = [],
  generatedVoiceAudios = [],
  onImageGenerated,
  onVideoGenerated,
  onVoiceGenerated,
  onGenerationError,
}: ProductionGeneratorProps) {
  const [running, setRunning] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [voiceCount, setVoiceCount] = useState(0);
  const [error, setError] = useState("");

  const runningRef = useRef(false);
  const finishedPlanRef = useRef<string | null>(null);
  const failedPlanRef = useRef<string | null>(null);
  const generationTokenRef = useRef(0);
  const activePlanRef = useRef<string | null>(null);

  const onImageGeneratedRef = useRef(onImageGenerated);
  const onVideoGeneratedRef = useRef(onVideoGenerated);
  const onVoiceGeneratedRef = useRef(onVoiceGenerated);
  const onGenerationErrorRef = useRef(onGenerationError);

  useEffect(() => {
    onImageGeneratedRef.current = onImageGenerated;
    onVideoGeneratedRef.current = onVideoGenerated;
    onVoiceGeneratedRef.current = onVoiceGenerated;
    onGenerationErrorRef.current = onGenerationError;
  });

  const assetsRef = useRef({
    images: generatedImages,
    videos: generatedVideos,
    voices: generatedVoiceAudios,
  });

  useEffect(() => {
    assetsRef.current = {
      images: generatedImages,
      videos: generatedVideos,
      voices: generatedVoiceAudios,
    };
  }, [generatedImages, generatedVideos, generatedVoiceAudios]);

  const requestedDuration = Math.round(Number(duration) || 0);
  const durations = useMemo(
    () => sceneDurations.map(Number),
    [sceneDurations]
  );
  const scenesCount = durations.length;
  const expectedSceneCount =
    requestedDuration > 0
      ? Math.ceil(requestedDuration / MAX_SCENE_DURATION)
      : 0;

  const planKey = useMemo(
    () =>
      JSON.stringify({
        requestedDuration,
        durations,
        imagePrompts,
        videoPrompts,
        voiceScripts,
      }),
    [requestedDuration, durations, imagePrompts, videoPrompts, voiceScripts]
  );

  const planValid =
    requestedDuration >= 5 &&
    scenesCount === expectedSceneCount &&
    durations.every(
      (value) =>
        Number.isInteger(value) &&
        value >= 1 &&
        value <= MAX_SCENE_DURATION
    ) &&
    durations.reduce((sum, value) => sum + value, 0) === requestedDuration &&
    imagePrompts.length === scenesCount &&
    videoPrompts.length === scenesCount &&
    voiceScripts.length <= scenesCount;

  useEffect(() => {
    if (
      finishedPlanRef.current !== planKey &&
      failedPlanRef.current !== planKey
    ) {
      setError("");
      setCurrentScene(0);
      setImageCount(generatedImages.filter(Boolean).length);
      setVideoCount(generatedVideos.filter(Boolean).length);
      setVoiceCount(generatedVoiceAudios.filter(Boolean).length);
    }
  }, [planKey]);

  useEffect(() => {
    if (!planValid || scenesCount === 0) return;
    if (finishedPlanRef.current === planKey) return;
    if (failedPlanRef.current === planKey) return;
    if (runningRef.current) return;

    const token = ++generationTokenRef.current;
    let cancelled = false;

    setError("");

    const isCancelled = () =>
      cancelled || generationTokenRef.current !== token;

    const fail = (message: string) => {
      if (isCancelled()) return;
      failedPlanRef.current = planKey;
      setError(message);
      onGenerationErrorRef.current?.(message);
    };

    const run = async () => {
      runningRef.current = true;
      activePlanRef.current = planKey;
      setRunning(true);

      try {
        for (let index = 0; index < scenesCount; index++) {
          if (isCancelled()) return;

          setCurrentScene(index + 1);

          let imageUrl = assetsRef.current.images[index] || "";

          if (!imageUrl) {
            const prompt = imagePrompts[index]?.trim();
            if (!prompt) {
              throw new Error(`Scene ${index + 1}: image prompt is empty.`);
            }

            console.log(
              `🖼️ Scene ${index + 1}/${scenesCount}: Cloudflare image`
            );

            const response = await fetch("/api/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt,
                provider: "cloudflare",
              }),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
              throw new Error(
                getError(
                  result,
                  `Image generation failed for Scene ${index + 1}.`
                )
              );
            }

            imageUrl = result.imageUrl || result.image || "";
            if (!imageUrl) {
              throw new Error(
                `Scene ${index + 1}: Cloudflare returned no image.`
              );
            }

            assetsRef.current.images[index] = imageUrl;
            onImageGeneratedRef.current?.(index, imageUrl);
          } else {
            console.log(`♻️ Scene ${index + 1}: existing image reused.`);
          }

          setImageCount((current) => Math.max(current, index + 1));

          if (isCancelled()) return;

          let videoUrl = assetsRef.current.videos[index] || "";

          if (!videoUrl) {
            const sceneDuration = durations[index];
            const prompt = videoPrompts[index]?.trim();

            if (!prompt) {
              throw new Error(`Scene ${index + 1}: video prompt is empty.`);
            }

            console.log(
              `🎥 Scene ${index + 1}/${scenesCount}: deAPI silent video ${sceneDuration}s`
            );

            const response = await fetch("/api/generate-video", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt,
                imageUrl,
                duration: sceneDuration,
                projectDuration: requestedDuration,
                sceneIndex: index,
                sceneCount: scenesCount,
                aspectRatio: "9:16",
                silent: true,
                audio: false,
                generateAudio: false,
              }),
            });

            const result = await response.json();
            const message = getError(
              result,
              `Video generation failed for Scene ${index + 1}.`
            );

            if (!response.ok || !result.success) {
              throw new Error(message);
            }

            videoUrl = result.videoUrl || result.videoUri || "";
            if (!videoUrl) {
              throw new Error(
                `Scene ${index + 1}: deAPI returned no video URL.`
              );
            }

            if (result.effectiveDuration != null) {
              const effective = Number(result.effectiveDuration);
              if (
                !Number.isFinite(effective) ||
                effective !== sceneDuration
              ) {
                throw new Error(
                  `Scene ${index + 1}: duration mismatch. Planned ${sceneDuration}s, received ${result.effectiveDuration}s.`
                );
              }
            }

            assetsRef.current.videos[index] = videoUrl;
            onVideoGeneratedRef.current?.(index, videoUrl);
          } else {
            console.log(`♻️ Scene ${index + 1}: existing video reused.`);
          }

          setVideoCount((current) => Math.max(current, index + 1));

          if (isCancelled()) return;

          const script = voiceScripts[index]?.trim() || "";

          if (script) {
            let audioUrl = assetsRef.current.voices[index] || "";

            if (!audioUrl) {
              console.log(
                `🎙️ Scene ${index + 1}/${scenesCount}: ElevenLabs voice`
              );

              const response = await fetch("/api/generate-voice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: script,
                  language: /[\u0600-\u06FF]/.test(script) ? "ar" : "en",
                }),
              });

              const result = await response.json();
              if (!response.ok || !result.success) {
                throw new Error(
                  getError(
                    result,
                    `Voice generation failed for Scene ${index + 1}.`
                  )
                );
              }

              audioUrl = result.audioUrl || result.audio || "";
              if (!audioUrl) {
                throw new Error(
                  `Scene ${index + 1}: ElevenLabs returned no audio.`
                );
              }

              assetsRef.current.voices[index] = audioUrl;
              onVoiceGeneratedRef.current?.(index, audioUrl);
            } else {
              console.log(`♻️ Scene ${index + 1}: existing voice reused.`);
            }
          }

          setVoiceCount(
            assetsRef.current.voices.filter(Boolean).length
          );
        }

        if (!isCancelled()) {
          finishedPlanRef.current = planKey;
          console.log(
            "✅ ONE-CLICK PRODUCTION COMPLETE: all visual clips and required voice tracks are ready."
          );
        }
      } catch (caught) {
        if (!isCancelled()) {
          const message =
            caught instanceof Error ? caught.message : String(caught);
          fail(message);
        }
      } finally {
        if (!isCancelled()) {
          runningRef.current = false;
          setRunning(false);
          activePlanRef.current = null;
        }
      }
    };

    const startProduction = async () => {
      if (typeof window === "undefined") {
        await run();
        return;
      }

      const navigatorWithLocks = navigator as NavigatorWithLocks;

      if (!navigatorWithLocks.locks?.request) {
        await run();
        return;
      }

      const lockName =
        `ai-director-production-${hashPlanKey(planKey)}`;

      await navigatorWithLocks.locks.request(
        lockName,
        { ifAvailable: true },
        async (lock) => {
          if (!lock) {
            console.log(
              "⏭️ Production already running for this plan; duplicate start prevented."
            );
            return;
          }

          await run();
        }
      );
    };

    void startProduction();

    return () => {
      cancelled = true;

      if (activePlanRef.current === planKey) {
        runningRef.current = false;
        activePlanRef.current = null;
      }
    };
  }, [planKey, planValid]);

  const requiredVoices = voiceScripts.filter(
    (script) => script?.trim()
  ).length;
  const readyImages = Math.min(imageCount, scenesCount);
  const readyVideos = Math.min(videoCount, scenesCount);
  const readyVoices = Math.min(voiceCount, requiredVoices);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-base font-bold text-white">
            🎬 One-Click Production Engine
          </h3>
          <p className="text-xs text-gray-400">
            Story → images → silent deAPI video → ElevenLabs voice.
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400">
          {running
            ? `Scene ${currentScene}/${scenesCount}`
            : finishedPlanRef.current === planKey
              ? "100% complete"
              : "Ready"}
        </div>
      </div>

      {!planValid && scenesCount > 0 && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-xs text-red-300">
          ❌ Production plan invalid. Requested {requestedDuration}s requires {expectedSceneCount} scenes, but received {scenesCount}.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-xs text-red-300">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center text-xs text-gray-300">
          🖼️ Images: {readyImages}/{scenesCount}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center text-xs text-gray-300">
          🎥 Videos: {readyVideos}/{scenesCount}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center text-xs text-gray-300">
          🎙️ Voice: {readyVoices}/{requiredVoices}
        </div>
      </div>

      <div className="space-y-2">
        {durations.map((sceneDuration, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-gray-300"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">
                Scene {index + 1}
              </span>
              <span className="font-mono text-gray-500">
                {sceneDuration}s
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <span
                className={
                  index < readyImages
                    ? "text-emerald-300"
                    : "text-gray-500"
                }
              >
                {index < readyImages ? "✅" : "⏳"} Image
              </span>
              <span
                className={
                  index < readyVideos
                    ? "text-emerald-300"
                    : "text-gray-500"
                }
              >
                {index < readyVideos ? "✅" : "⏳"} Silent Video
              </span>
              {voiceScripts[index]?.trim() && (
                <span
                  className={
                    assetsRef.current.voices[index]
                      ? "text-emerald-300"
                      : "text-gray-500"
                  }
                >
                  {assetsRef.current.voices[index] ? "✅" : "⏳"} ElevenLabs Voice
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
