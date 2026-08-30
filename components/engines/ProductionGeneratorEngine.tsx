"use client";

import React, {
useEffect,
useRef,
useState,
} from "react";

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
onImageGenerated?: (
index: number,
imageUrl: string
) => void;
onVideoGenerated?: (
index: number,
videoUri: string
) => void;
onVoiceGenerated?: (
index: number,
audioUrl: string
) => void;
onMusicGenerated?: (
index: number,
audioUrl: string
) => void;
onSfxGenerated?: (
index: number,
audioUrl: string
) => void;
onGenerationError?: (
message: string
) => void;
}

const MAX_SCENE_DURATION = 4;

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
/*

* =====================================================
* LOCAL EDITABLE DATA
* =====================================================
  */

const [
editableImagePrompts,
setEditableImagePrompts,
] = useState<string[]>(imagePrompts);

const [
editableVideoPrompts,
setEditableVideoPrompts,
] = useState<string[]>(videoPrompts);

const [
editableVoiceScripts,
setEditableVoiceScripts,
] = useState<string[]>(voiceScripts);

/*

* =====================================================
* GENERATION UI STATE
* =====================================================
  */

const [
generatingImages,
setGeneratingImages,
] = useState<boolean[]>([]);

const [
generatingVideos,
setGeneratingVideos,
] = useState<boolean[]>([]);

const [
generatingVoices,
setGeneratingVoices,
] = useState<boolean[]>([]);

const [
imageErrors,
setImageErrors,
] = useState<(string | null)[]>([]);

const [
videoErrors,
setVideoErrors,
] = useState<(string | null)[]>([]);

const [
voiceErrors,
setVoiceErrors,
] = useState<(string | null)[]>([]);

/*

* =====================================================
* DUPLICATE REQUEST PROTECTION
* =====================================================
*
* A scene is marked BEFORE its provider request starts.
*
* This prevents:
* * React effect reruns
* * prop changes
* * parent re-renders
* * generated asset updates
*
* from causing the same provider request twice.
  */

const imageGenerationStarted =
useRef<Set<number>>(new Set());

const videoGenerationStarted =
useRef<Set<number>>(new Set());

const voiceGenerationStarted =
useRef<Set<number>>(new Set());

/*

* =====================================================
* PROVIDER STOP FLAGS
* =====================================================
*
* Once a provider reports a hard failure such as:
*
* * HTTP 429
* * HTTP 403
* * quota_exceeded
* * suspended account
* * concurrency limit
*
* we stop sending more requests to that provider
* during the current production plan.
*
* This is critical for quota protection.
  */

const imageProviderStopped =
useRef(false);

const videoProviderStopped =
useRef(false);

const voiceProviderStopped =
useRef(false);

/*

* =====================================================
* PLAN IDENTITY
* =====================================================
  */

const parsedDuration = Math.round(
Number(duration) || 0
);

const normalizedSceneDurations =
sceneDurations.map((value) =>
Number(value)
);

const scenesCount =
normalizedSceneDurations.length;

const plannedDuration =
normalizedSceneDurations.reduce(
(total, value) =>
total + value,
0
);

const expectedSceneCount =
parsedDuration > 0
? Math.ceil(
parsedDuration /
MAX_SCENE_DURATION
)
: 0;

const sceneDurationsAreValid =
scenesCount > 0 &&
normalizedSceneDurations.every(
(value) =>
Number.isInteger(value) &&
value >= 1 &&
value <= MAX_SCENE_DURATION
);

const sceneCountIsSynchronized =
scenesCount > 0 &&
scenesCount ===
expectedSceneCount;

const durationIsSynchronized =
sceneDurationsAreValid &&
sceneCountIsSynchronized &&
plannedDuration ===
parsedDuration;

const promptArraysAreSynchronized =
imagePrompts.length ===
scenesCount &&
videoPrompts.length ===
scenesCount &&
voiceScripts.length ===
scenesCount;

const productionPlanIsValid =
durationIsSynchronized &&
promptArraysAreSynchronized;

/*
* IMPORTANT:
* Do NOT use an array reference directly as the
* production identity because sceneDurations.map()
* creates a new array on every render.
  */

const productionPlanKey =
`${parsedDuration}:${normalizedSceneDurations.join(",")}:${imagePrompts.length}:${videoPrompts.length}:${voiceScripts.length}`;

const previousProductionPlanKey =
useRef<string | null>(null);

/*
* =====================================================
* SYNC INPUT DATA
* =====================================================
  */

useEffect(() => {
setEditableImagePrompts(
imagePrompts
);
}, [imagePrompts]);

useEffect(() => {
setEditableVideoPrompts(
videoPrompts
);
}, [videoPrompts]);

useEffect(() => {
setEditableVoiceScripts(
voiceScripts
);
}, [voiceScripts]);

/*
* =====================================================
* RESET GENERATION GUARDS WHEN PLAN CHANGES
* =====================================================
  */

useEffect(() => {
if (
previousProductionPlanKey.current ===
null
) {
previousProductionPlanKey.current =
productionPlanKey;

  return;
}

if (
  previousProductionPlanKey.current !==
  productionPlanKey
) {
  console.log(
    "🔄 Production plan changed. Resetting generation guards."
  );

  imageGenerationStarted.current.clear();
  videoGenerationStarted.current.clear();
  voiceGenerationStarted.current.clear();

  imageProviderStopped.current =
    false;

  videoProviderStopped.current =
    false;

  voiceProviderStopped.current =
    false;

  setGeneratingImages([]);
  setGeneratingVideos([]);
  setGeneratingVoices([]);

  setImageErrors([]);
  setVideoErrors([]);
  setVoiceErrors([]);

  previousProductionPlanKey.current =
    productionPlanKey;
}

}, [productionPlanKey]);

/*
* =====================================================
* INVALID PLAN PROTECTION
* =====================================================
  */

const invalidPlanReported =
useRef<string | null>(null);

useEffect(() => {
if (productionPlanIsValid) {
invalidPlanReported.current =
null;

  return;
}

if (
  scenesCount === 0 &&
  parsedDuration === 0
) {
  return;
}

const message =
  !sceneDurationsAreValid
    ? `Invalid scene duration plan. Every scene must be an integer between 1 and ${MAX_SCENE_DURATION} seconds.`
    : !sceneCountIsSynchronized
    ? `Scene count mismatch. ${parsedDuration}s requires exactly ${expectedSceneCount} scenes, but received ${scenesCount}.`
    : plannedDuration !==
      parsedDuration
    ? `Scene duration mismatch. Planned ${plannedDuration}s but requested ${parsedDuration}s.`
    : !promptArraysAreSynchronized
    ? `Production prompt count mismatch. Images: ${imagePrompts.length}, Videos: ${videoPrompts.length}, Voices: ${voiceScripts.length}, Scenes: ${scenesCount}.`
    : "Invalid production plan.";

if (
  invalidPlanReported.current ===
  message
) {
  return;
}

invalidPlanReported.current =
  message;

console.error(
  "❌ Production plan rejected:",
  message
);

onGenerationError?.(
  message
);

}, [
productionPlanIsValid,
scenesCount,
parsedDuration,
expectedSceneCount,
sceneDurationsAreValid,
sceneCountIsSynchronized,
plannedDuration,
promptArraysAreSynchronized,
imagePrompts.length,
videoPrompts.length,
voiceScripts.length,
onGenerationError,
]);

/*
* =====================================================
* VOICE GENERATION
* =====================================================
*
* The production engine requests voice only through
* /api/generate-voice.
*
* No voice information is ever sent to deAPI.
*
* IMPORTANT:
* We do NOT automatically retry failed requests.
  */

useEffect(() => {
let cancelled = false;

const generateVoices =
  async () => {
    if (
      voiceProviderStopped.current
    ) {
      console.log(
        "🛑 Voice provider is stopped for this production plan. No additional voice requests."
      );

      return;
    }

    for (
      let index = 0;
      index < scenesCount;
      index++
    ) {
      if (
        cancelled ||
        voiceProviderStopped.current
      ) {
        return;
      }

      const script =
        editableVoiceScripts[
          index
        ]?.trim() || "";

      if (!script) {
        console.log(
          `ℹ️ Scene ${
            index + 1
          } has no voice script. Skipping voice generation.`
        );

        continue;
      }

      if (
        generatedVoiceAudios[
          index
        ]
      ) {
        continue;
      }

      if (
        voiceGenerationStarted.current.has(
          index
        )
      ) {
        continue;
      }

      voiceGenerationStarted.current.add(
        index
      );

      setGeneratingVoices(
        (current) => {
          const updated = [
            ...current,
          ];

          updated[index] =
            true;

          return updated;
        }
      );

      setVoiceErrors(
        (current) => {
          const updated = [
            ...current,
          ];

          updated[index] =
            null;

          return updated;
        }
      );

      console.log(
        `🎙️ Generating voice ${index + 1}/${scenesCount}...`
      );

      console.log(
        `📝 Scene ${
          index + 1
        } voice script length: ${script.length}`
      );

      try {
        const response =
          await fetch(
            "/api/generate-voice",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                text: script,
              }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          const providerMessage =
            String(
              result.error ||
                result.message ||
                ""
            ).toLowerCase();

          /*
           * Hard-stop conditions.
           *
           * We deliberately stop additional voice
           * requests because continuing could waste
           * quota or hit the same provider limit.
           */

          const isHardProviderFailure =
            response.status ===
              429 ||
            response.status ===
              403 ||
            providerMessage.includes(
              "quota_exceeded"
            ) ||
            providerMessage.includes(
              "quota exceeded"
            ) ||
            providerMessage.includes(
              "concurrency"
            ) ||
            providerMessage.includes(
              "trial_exhausted"
            ) ||
            providerMessage.includes(
              "suspended"
            );

          if (
            isHardProviderFailure
          ) {
            voiceProviderStopped.current =
              true;

            console.error(
              "🛑 Voice provider stopped for current production plan:",
              result.error ||
                result.message
            );
          }

          throw new Error(
            result.error ||
              result.message ||
              `Voice generation failed for Scene ${
                index + 1
              }.`
          );
        }

        if (cancelled) {
          return;
        }

        let audioUrl =
          "";

        if (
          typeof result.audioUrl ===
            "string" &&
          result.audioUrl
        ) {
          audioUrl =
            result.audioUrl;
        } else if (
          typeof result.audio ===
          "string"
        ) {
          if (
            result.audio.startsWith(
              "data:"
            ) ||
            result.audio.startsWith(
              "http"
            )
          ) {
            audioUrl =
              result.audio;
          } else {
            const mimeType =
              result.mimeType ||
              "audio/mpeg";

            audioUrl =
              `data:${mimeType};base64,${result.audio}`;
          }
        }

        if (!audioUrl) {
          throw new Error(
            `Scene ${
              index + 1
            }: voice provider returned no audio data.`
          );
        }

        console.log(
          `✅ Scene ${
            index + 1
          } voice generated successfully.`
        );

        onVoiceGenerated?.(
          index,
          audioUrl
        );

        setGeneratingVoices(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              false;

            return updated;
          }
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : `Scene ${
                index + 1
              }: voice generation failed.`;

        console.error(
          `❌ Scene ${
            index + 1
          } voice generation failed:`,
          message
        );

        setVoiceErrors(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              message;

            return updated;
          }
        );

        setGeneratingVoices(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              false;

            return updated;
          }
        );

        onGenerationError?.(
          message
        );

        /*
         * NO automatic retry.
         */
      }
    }
  };

if (
  productionPlanIsValid &&
  scenesCount > 0
) {
  void generateVoices();
}

return () => {
  cancelled = true;
};

}, [
editableVoiceScripts,
generatedVoiceAudios,
scenesCount,
productionPlanIsValid,
onVoiceGenerated,
onGenerationError,
]);

/*
* =====================================================
* IMAGE GENERATION
* =====================================================
*
* One source image per scene.
*
* Existing images are ALWAYS reused.
*
* This component never regenerates an existing image.
  */

useEffect(() => {
let cancelled = false;

const generateMissingImages =
  async () => {
    if (
      imageProviderStopped.current
    ) {
      console.log(
        "🛑 Image provider is stopped for this production plan."
      );

      return;
    }

    for (
      let index = 0;
      index < scenesCount;
      index++
    ) {
      if (
        cancelled ||
        imageProviderStopped.current
      ) {
        return;
      }

      const prompt =
        imagePrompts[
          index
        ]?.trim() ||
        editableImagePrompts[
          index
        ]?.trim() ||
        "";

      if (!prompt) {
        console.warn(
          `⚠️ Scene ${
            index + 1
          }: image prompt is empty.`
        );

        continue;
      }

      if (
        generatedImages[index]
      ) {
        console.log(
          `♻️ Scene ${
            index + 1
          }: existing image reused.`
        );

        continue;
      }

      if (
        imageGenerationStarted.current.has(
          index
        )
      ) {
        continue;
      }

      imageGenerationStarted.current.add(
        index
      );

      setGeneratingImages(
        (current) => {
          const updated = [
            ...current,
          ];

          updated[index] =
            true;

          return updated;
        }
      );

      setImageErrors(
        (current) => {
          const updated = [
            ...current,
          ];

          updated[index] =
            null;

          return updated;
        }
      );

      console.log(
        `🖼️ Generating Cloudflare source image ${
          index + 1
        }/${scenesCount}...`
      );

      console.log(
        `📝 Scene ${
          index + 1
        } image prompt length: ${prompt.length}`
      );

      try {
        const response =
          await fetch(
            "/api/generate-image",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                prompt,
                provider:
                  "cloudflare",
              }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          const providerMessage =
            String(
              result.error ||
                result.message ||
                ""
            ).toLowerCase();

          if (
            response.status ===
              429 ||
            response.status ===
              403 ||
            providerMessage.includes(
              "quota"
            ) ||
            providerMessage.includes(
              "rate limit"
            ) ||
            providerMessage.includes(
              "suspended"
            )
          ) {
            imageProviderStopped.current =
              true;

            console.error(
              "🛑 Image provider stopped for current production plan."
            );
          }

          throw new Error(
            result.message ||
              result.error ||
              `Image generation failed for Scene ${
                index + 1
              }.`
          );
        }

        if (cancelled) {
          return;
        }

        const imageUrl =
          result.imageUrl ||
          result.image ||
          "";

        if (!imageUrl) {
          throw new Error(
            `Scene ${
              index + 1
            }: Cloudflare returned no image.`
          );
        }

        console.log(
          `✅ Scene ${
            index + 1
          } image generated successfully.`
        );

        onImageGenerated?.(
          index,
          imageUrl
        );

        setGeneratingImages(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              false;

            return updated;
          }
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : `Scene ${
                index + 1
              }: image generation failed.`;

        console.error(
          `❌ Scene ${
            index + 1
          } image generation failed:`,
          message
        );

        setImageErrors(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              message;

            return updated;
          }
        );

        setGeneratingImages(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              false;

            return updated;
          }
        );

        onGenerationError?.(
          message
        );

        /*
         * NO automatic retry.
         */
      }
    }
  };

if (
  productionPlanIsValid &&
  scenesCount > 0
) {
  void generateMissingImages();
}

return () => {
  cancelled = true;
};

}, [
editableImagePrompts,
generatedImages,
scenesCount,
productionPlanIsValid,
onImageGenerated,
onGenerationError,
]);

/*
* =====================================================
* VIDEO GENERATION
* =====================================================
*
* deAPI = VISUAL ONLY.
*
* ONLY:
* * source image
* * visual motion prompt
* * authoritative duration
* * project metadata
*
* NEVER:
* * voice
* * dialogue
* * music
* * SFX
*
* IMPORTANT:
* When deAPI returns 429 or 403, we STOP ALL FUTURE
* deAPI requests for this production plan.
  */

useEffect(() => {
let cancelled = false;

const generateMissingVideos =
  async () => {
    if (
      videoProviderStopped.current
    ) {
      console.log(
        "🛑 deAPI video provider is stopped for this production plan. No additional video requests."
      );

      return;
    }

    for (
      let index = 0;
      index < scenesCount;
      index++
    ) {
      if (
        cancelled ||
        videoProviderStopped.current
      ) {
        return;
      }

      const prompt =
        videoPrompts[
          index
        ]?.trim() ||
        editableVideoPrompts[
          index
        ]?.trim() ||
        "";

      if (!prompt) {
        console.warn(
          `⚠️ Scene ${
            index + 1
          }: video prompt is empty.`
        );

        continue;
      }

      if (
        generatedVideos[index]
      ) {
        console.log(
          `♻️ Scene ${
            index + 1
          }: existing video reused.`
        );

        continue;
      }

      /*
       * deAPI MUST wait for the exact source image.
       */

      const sourceImage =
        generatedImages[index];

      if (!sourceImage) {
        console.log(
          `⏳ Scene ${
            index + 1
          }: waiting for source image before deAPI request.`
        );

        continue;
      }

      /*
       * AUTHORITATIVE SCENE DURATION
       */

      const sceneDuration =
        normalizedSceneDurations[
          index
        ];

      if (
        !Number.isInteger(
          sceneDuration
        ) ||
        sceneDuration < 1 ||
        sceneDuration >
          MAX_SCENE_DURATION
      ) {
        const message =
          `Scene ${
            index + 1
          }: invalid authoritative scene duration ${sceneDuration}.`;

        console.error(
          `❌ ${message}`
        );

        setVideoErrors(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              message;

            return updated;
          }
        );

        onGenerationError?.(
          message
        );

        return;
      }

      if (
        videoGenerationStarted.current.has(
          index
        )
      ) {
        continue;
      }

      videoGenerationStarted.current.add(
        index
      );

      setGeneratingVideos(
        (current) => {
          const updated = [
            ...current,
          ];

          updated[index] =
            true;

          return updated;
        }
      );

      setVideoErrors(
        (current) => {
          const updated = [
            ...current,
          ];

          updated[index] =
            null;

          return updated;
        }
      );

      console.log(
        `🎥 Generating SILENT deAPI video ${
          index + 1
        }/${scenesCount}...`
      );

      console.log(
        `⏱️ Scene ${
          index + 1
        }: exact planned duration = ${sceneDuration}s`
      );

      console.log(
        `♻️ Scene ${
          index + 1
        }: reusing existing source image.`
      );

      console.log(
        "🔇 Audio architecture: deAPI receives NO voice, dialogue, music, or SFX."
      );

      try {
        const response =
          await fetch(
            "/api/generate-video",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                /*
                 * VISUAL PROMPT ONLY
                 */
                prompt,

                /*
                 * EXACT EXISTING SOURCE IMAGE
                 */
                imageUrl:
                  sourceImage,

                /*
                 * EXACT AUTHORITATIVE
                 * SCENE DURATION
                 */
                duration:
                  sceneDuration,

                aspectRatio:
                  "9:16",

                /*
                 * PROJECT VALIDATION
                 */
                projectDuration:
                  parsedDuration,

                sceneIndex:
                  index,

                sceneCount:
                  scenesCount,

                /*
                 * EXPLICIT AUDIO SAFETY
                 *
                 * These values are intentionally
                 * false/empty and contain no audio.
                 */
                silent: true,
                audio: false,
                generateAudio:
                  false,
              }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          const providerMessage =
            String(
              result.error ||
                result.message ||
                ""
            ).toLowerCase();

          /*
           * HARD STOP DEAPI
           *
           * 403 = account suspended / forbidden
           * 429 = rate limit / too many attempts
           *
           * Both MUST stop the current production
           * from making more submissions.
           */

          const isHardDeapiFailure =
            response.status ===
              429 ||
            response.status ===
              403 ||
            providerMessage.includes(
              "too many attempts"
            ) ||
            providerMessage.includes(
              "rate limit"
            ) ||
            providerMessage.includes(
              "suspended"
            ) ||
            providerMessage.includes(
              "concurrency"
            );

          if (
            isHardDeapiFailure
          ) {
            videoProviderStopped.current =
              true;

            console.error(
              "🛑 deAPI provider stopped for current production plan.",
              {
                httpStatus:
                  response.status,
                message:
                  result.error ||
                  result.message,
              }
            );
          }

          throw new Error(
            result.message ||
              result.error ||
              `Video generation failed for Scene ${
                index + 1
              }.`
          );
        }

        if (cancelled) {
          return;
        }

        const videoUrl =
          result.videoUrl ||
          result.videoUri ||
          "";

        if (!videoUrl) {
          throw new Error(
            `Scene ${
              index + 1
            }: deAPI returned no video URL.`
          );
        }

        /*
         * VERIFY EFFECTIVE DURATION
         */

        if (
          result.effectiveDuration !==
            undefined &&
          result.effectiveDuration !==
            null
        ) {
          const effectiveDuration =
            Number(
              result.effectiveDuration
            );

          if (
            !Number.isFinite(
              effectiveDuration
            ) ||
            effectiveDuration !==
              sceneDuration
          ) {
            throw new Error(
              `Scene ${
                index + 1
              }: duration mismatch. Planned ${sceneDuration}s but deAPI returned ${result.effectiveDuration}s.`
            );
          }
        }

        console.log(
          `✅ Scene ${
            index + 1
          } silent deAPI video generated successfully — ${sceneDuration}s.`
        );

        onVideoGenerated?.(
          index,
          videoUrl
        );

        setGeneratingVideos(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              false;

            return updated;
          }
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : `Scene ${
                index + 1
              }: deAPI video generation failed.`;

        console.error(
          `❌ Scene ${
            index + 1
          } deAPI video generation failed:`,
          message
        );

        setVideoErrors(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              message;

            return updated;
          }
        );

        setGeneratingVideos(
          (current) => {
            const updated = [
              ...current,
            ];

            updated[index] =
              false;

            return updated;
          }
        );

        onGenerationError?.(
          message
        );

        /*
         * NO AUTOMATIC RETRY.
         *
         * If deAPI is rate-limited or suspended,
         * the provider flag prevents subsequent
         * scenes from submitting more jobs.
         */
      }
    }
  };

if (
  productionPlanIsValid &&
  scenesCount > 0
) {
  void generateMissingVideos();
}

return () => {
  cancelled = true;
};

}, [
editableVideoPrompts,
generatedImages,
generatedVideos,
scenesCount,
productionPlanIsValid,
parsedDuration,
onVideoGenerated,
onGenerationError,
]);

/*
* =====================================================
* PRODUCTION COUNTS
* =====================================================
  */

const generatedImageCount =
generatedImages
.slice(0, scenesCount)
.filter(Boolean)
.length;

const generatedVideoCount =
generatedVideos
.slice(0, scenesCount)
.filter(Boolean)
.length;

const generatedVoiceCount =
generatedVoiceAudios
.slice(0, scenesCount)
.filter(Boolean)
.length;

const requiredVoiceSceneIndexes =
editableVoiceScripts
.slice(0, scenesCount)
.map(
(
script,
index
) =>
script?.trim()
? index
: -1
)
.filter(
(index) =>
index >= 0
);

const requiredVoiceCount =
requiredVoiceSceneIndexes.length;

const allImagesReady =
productionPlanIsValid &&
scenesCount > 0 &&
Array.from(
{
length:
scenesCount,
},
(_, index) =>
Boolean(
generatedImages[
index
]
)
).every(Boolean);

const allVideosReady =
productionPlanIsValid &&
scenesCount > 0 &&
Array.from(
{
length:
scenesCount,
},
(_, index) =>
Boolean(
generatedVideos[
index
]
)
).every(Boolean);

const allVoicesReady =
productionPlanIsValid &&
scenesCount > 0 &&
requiredVoiceSceneIndexes.every(
(index) =>
Boolean(
generatedVoiceAudios[
index
]
)
);

/*
* =====================================================
* RENDER
* =====================================================
  */

return ( <div className="space-y-6"> <div className="flex items-center justify-between border-b border-white/10 pb-3"> <div> <h3 className="flex items-center gap-2 text-base font-bold text-white">
🎬 Production Generator Engine </h3>

      <p className="text-xs text-gray-400">
        Autonomous multi-modal
        orchestration engine in live
        production.
      </p>
    </div>

    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
      <span>
        ⏱️ Total: {parsedDuration}s
      </span>

      <span>•</span>

      <span>
        🎞️ {scenesCount} Scenes
      </span>

      <span>•</span>

      <span>
        🖼️ {generatedImageCount}/
        {scenesCount}
      </span>

      <span>•</span>

      <span>
        🎥 {generatedVideoCount}/
        {scenesCount}
      </span>

      <span>•</span>

      <span>
        🎙️ {generatedVoiceCount}/
        {requiredVoiceCount}
      </span>
    </div>
  </div>

  {!productionPlanIsValid &&
    scenesCount > 0 && (
      <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-xs text-red-300">
        ❌ Production plan rejected.

        <div className="mt-2 space-y-1">
          <div>
            Requested:{" "}
            {parsedDuration}s
          </div>

          <div>
            Expected scenes:{" "}
            {expectedSceneCount}
          </div>

          <div>
            Received scenes:{" "}
            {scenesCount}
          </div>

          <div>
            Planned duration:{" "}
            {plannedDuration}s
          </div>

          <div>
            Image prompts:{" "}
            {imagePrompts.length}
          </div>

          <div>
            Video prompts:{" "}
            {videoPrompts.length}
          </div>

          <div>
            Voice scripts:{" "}
            {voiceScripts.length}
          </div>
        </div>

        <p className="mt-2">
          No image, video, or voice
          provider request will be
          started until the production
          plan is synchronized.
        </p>
      </div>
    )}

  {imageProviderStopped.current && (
    <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
      🛑 Image provider stopped for
      this production plan after a
      provider limit/error. No
      additional image requests will
      be sent automatically.
    </div>
  )}

  {videoProviderStopped.current && (
    <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
      🛑 deAPI video generation is
      stopped for this production
      plan. No additional deAPI
      submissions will be attempted.
    </div>
  )}

  {voiceProviderStopped.current && (
    <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
      🛑 Voice generation is stopped
      for this production plan after
      a provider limit/quota error.
      No automatic retries will be
      performed.
    </div>
  )}

  {allImagesReady && (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
      ✅ All source images are ready.
      deAPI will reuse these exact
      saved source images.
    </div>
  )}

  {allVoicesReady && (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
      ✅ All required voice tracks
      are ready.
    </div>
  )}

  {allVideosReady && (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
      ✅ All silent scene videos are
      ready.
    </div>
  )}

  <div className="space-y-6">
    {Array.from({
      length: scenesCount,
    }).map(
      (_, index) => {
        const currentImage =
          generatedImages[
            index
          ];

        const currentVideo =
          generatedVideos[
            index
          ];

        const isImageGenerating =
          Boolean(
            generatingImages[
              index
            ]
          );

        const isVideoGenerating =
          Boolean(
            generatingVideos[
              index
            ]
          );

        const isVoiceGenerating =
          Boolean(
            generatingVoices[
              index
            ]
          );

        const imageError =
          imageErrors[index];

        const videoError =
          videoErrors[index];

        const voiceError =
          voiceErrors[index];

        const sceneDuration =
          normalizedSceneDurations[
            index
          ];

        return (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-black/40 p-4 transition-all"
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-sm font-bold text-cyan-300">
                🎬 Scene{" "}
                {index + 1}
              </span>

              <span className="text-xs font-mono text-gray-400">
                {sceneDuration}s
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {/* SOURCE IMAGE */}

              <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/60 md:col-span-5">
                {currentImage ? (
                  <img
                    src={
                      currentImage
                    }
                    alt={`Scene ${
                      index + 1
                    }`}
                    className="aspect-[9/16] h-full w-full rounded-lg object-cover"
                  />
                ) : isImageGenerating ? (
                  <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

                    <span className="text-xs font-semibold text-gray-400">
                      Generating source
                      image...
                    </span>

                    <span className="text-[10px] text-gray-500">
                      Cloudflare FLUX
                    </span>
                  </div>
                ) : imageError ? (
                  <div className="p-6 text-center">
                    <div className="mb-2 text-2xl">
                      ❌
                    </div>

                    <p className="text-xs text-red-400">
                      {
                        imageError
                      }
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="mb-2 text-2xl">
                      ⏳
                    </div>

                    <span className="text-xs text-gray-500">
                      Waiting for image
                      generation...
                    </span>
                  </div>
                )}
              </div>

              {/* DIRECTIVES */}

              <div className="space-y-3 md:col-span-7">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    🎨 Image Prompt
                  </label>

                  <textarea
                    readOnly
                    rows={5}
                    value={
                      editableImagePrompts[
                        index
                      ] ||
                      ""
                    }
                    className="w-full resize-none rounded-lg border border-white/10 bg-black/50 p-2 text-xs font-mono text-gray-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-purple-400">
                    🎥 Video Motion Prompt
                  </label>

                  <textarea
                    readOnly
                    rows={5}
                    value={
                      editableVideoPrompts[
                        index
                      ] ||
                      ""
                    }
                    className="w-full resize-none rounded-lg border border-white/10 bg-black/50 p-2 text-xs font-mono text-gray-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    🎙️ Voiceover Script
                  </label>

                  <textarea
                    readOnly
                    rows={3}
                    value={
                      editableVoiceScripts[
                        index
                      ] ||
                      ""
                    }
                    className="w-full resize-none rounded-lg border border-white/10 bg-black/50 p-2 text-xs text-gray-200 focus:outline-none"
                  />
                </div>

                {isVoiceGenerating && (
                  <div className="rounded-lg border border-emerald-400/10 bg-emerald-400/5 p-2 text-[11px] text-emerald-300">
                    🎙️ Generating voice...
                  </div>
                )}

                {voiceError && (
                  <div className="rounded-lg border border-red-400/10 bg-red-400/5 p-2 text-[11px] text-red-400">
                    ❌ Voice:{" "}
                    {
                      voiceError
                    }
                  </div>
                )}

                {isVideoGenerating && (
                  <div className="rounded-lg border border-purple-400/10 bg-purple-400/5 p-2 text-[11px] text-purple-300">
                    🎥 Generating silent
                    deAPI video (
                    {
                      sceneDuration
                    }
                    s)...
                  </div>
                )}

                {videoError && (
                  <div className="rounded-lg border border-red-400/10 bg-red-400/5 p-2 text-[11px] text-red-400">
                    ❌ Video:{" "}
                    {
                      videoError
                    }
                  </div>
                )}

                {currentVideo && (
                  <div className="rounded-lg border border-purple-400/10 bg-purple-400/5 p-2 text-[11px] text-purple-300">
                    ✅ Silent video
                    ready —{" "}
                    {
                      sceneDuration
                    }
                    s
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
    )}
  </div>
</div>
);
}