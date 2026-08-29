"use client";

import { useState } from "react";
import { getStyleProfile } from "./ImagePromptEngine";

type Scene = {
title: string;
visual: string;
camera: string;
voice: string;
imageUrl?: string;
style?: string;
location?: string;
action?: string;
emotion?: string;
continuity?: string;
composition?: {
shotType?: string;
cameraAngle?: string;
lens?: string;
};
lighting?: {
source?: string;
direction?: string;
quality?: string;
};
};

type VideoPromptEngineProps = {
scenes: Scene[];
style?: string;
onVideoGenerated?: (index: number, videoUrl: string) => void;
};

/*

* ============================================================
* VIDEO PROMPT BUILDER
* ============================================================
*
* The prompt must describe a STORY EVENT, not a character
* showcase. The supplied image is the starting visual state.
  */

export function buildVideoPrompt(
scene: Scene,
style: string = "Pixar"
): string {
const selectedStyle = style || scene.style || "Pixar";
const styleProfile = getStyleProfile(selectedStyle);

const action =
scene.action?.trim() ||
scene.visual?.trim() ||
"The characters perform a clear physical action inside the environment.";

const camera =
scene.camera?.trim() ||
"A controlled cinematic camera observes the action without hiding the acting.";

const emotion =
scene.emotion?.trim() ||
"Natural facial expression and body language motivated by the story event.";

const location =
scene.location?.trim() ||
"The existing environment from the supplied image.";

const continuity =
scene.continuity?.trim() ||
"Maintain the exact character and environment continuity from the supplied image.";

const shotType =
scene.composition?.shotType?.trim() || "";

const cameraAngle =
scene.composition?.cameraAngle?.trim() || "";

const lens =
scene.composition?.lens?.trim() || "";

const lightingSource =
scene.lighting?.source?.trim() || "";

const lightingDirection =
scene.lighting?.direction?.trim() || "";

const lightingQuality =
scene.lighting?.quality?.trim() || "";

return [
`CINEMATIC IMAGE-TO-VIDEO STORY SCENE.`,

`Use the supplied image as the exact first-frame visual state.`,

`STORY EVENT — HIGHEST PRIORITY:`,

`This shot must portray a real story event with visible cause-and-effect action.`,
`It is NOT a character showcase, portrait, pose, photoshoot, or idle animation.`,

`PRIMARY ACTION: ${action}`,

`The action must have a clear beginning, continuous physical progression, a motivated reaction, and a natural visual ending within the shot.`,

`Every movement must be caused by the story event.`,

`ACTING:`,

`Prioritize believable physical acting and interaction over camera movement.`,

`Use natural body movement, weight shifts, posture changes, head movement, eye direction, facial reactions, hand gestures, arm movement, and environmental interaction.`,

`If the character interacts with an object, visibly show the approach, hand movement, contact, manipulation, and reaction to the result.`,

`If the character looks at something, make the gaze direction meaningful and visually connected to the object or event.`,

`If multiple characters are present, preserve their spatial relationship and show reciprocal reactions and interaction.`,

`EMOTIONAL PERFORMANCE: ${emotion}`,

`LOCATION / ENVIRONMENT: ${location}`,

`The environment must remain physically present and participate naturally in the action.`,

`CAMERA:`,

`${camera}`,

shotType
  ? `Shot type: ${shotType}.`
  : "",

cameraAngle
  ? `Camera angle: ${cameraAngle}.`
  : "",

lens
  ? `Lens: ${lens}.`
  : "",

`Camera movement must support the story event and must never replace or hide the acting.`,

`CONTINUITY:`,

continuity,

`Preserve exactly from the supplied image: character identity, face, facial structure, hairstyle, hair color, clothing, accessories, body proportions, environment, lighting, spatial relationships, and visual style.`,

`No identity drift.`,
`No face change.`,
`No hairstyle change.`,
`No clothing change.`,
`No accessory change.`,
`No character substitution.`,
`No environmental reset.`,
`No unexplained object changes.`,

`LIGHTING:`,

lightingSource
  ? `Existing lighting source: ${lightingSource}.`
  : "",

lightingDirection
  ? `Existing lighting direction: ${lightingDirection}.`
  : "",

lightingQuality
  ? `Existing lighting quality: ${lightingQuality}.`
  : "",

`Maintain the lighting continuity of the supplied image.`,

`STYLE:`,

`Selected visual style: ${styleProfile.name}.`,

`Maintain the selected visual medium exactly.`,
`Do not reinterpret the visual style.`,
`Do not mix visual styles.`,
`Do not turn an animated style into photorealism.`,
`Do not turn a realistic style into animation.`,
`Do not introduce a different artistic medium.`,

`PHYSICAL REALISM:`,

`Believable motion, believable weight, natural acceleration and deceleration, stable anatomy, coherent object interaction, and consistent spatial relationships.`,

`NEGATIVE — DO NOT:`,

`Do not pose.`,
`Do not stand still.`,
`Do not stare at the camera.`,
`Do not smile at the camera.`,
`Do not behave like a photoshoot.`,
`Do not perform generic walking unless walking is explicitly the story action.`,
`Do not replace the described action with idle movement.`,
`Do not replace the described action with waving.`,
`Do not use random hand movement.`,
`Do not use random camera movement.`,
`Do not create mannequin-like movement.`,
`Do not create floating objects.`,
`Do not create impossible body movement.`,
`Do not hide the main action behind camera motion.`,

`AUDIO:`,

`NO AUDIO.`,
`NO SPEECH.`,
`NO DIALOGUE.`,
`NO VOICE.`,
`NO NARRATION.`,
`NO MUSIC.`,
`NO SOUND EFFECTS.`,

`External production audio will be added separately.`,

`TEXT:`,

`NO TEXT.`,
`NO SUBTITLES.`,
`NO CAPTIONS.`,
`NO LOGOS.`,
`NO WATERMARK.`,

`FINAL DIRECTIVE:`,

`Generate a continuous cinematic story event from the supplied first frame. The viewer must be able to understand what the characters are doing, what causes the movement, how they react, and how the event progresses.`,

]
.filter(Boolean)
.join(" ");
}

/*

* ============================================================
* COMPONENT
* ============================================================
  */

export default function VideoPromptEngine({
scenes = [],
style = "Pixar",
onVideoGenerated,
}: VideoPromptEngineProps) {
const [loadingIndex, setLoadingIndex] =
useState<number | null>(null);

const [videoUrls, setVideoUrls] =
useState<{ [key: number]: string }>({});

const [progress, setProgress] =
useState<{ [key: number]: number }>({});

const [errors, setErrors] =
useState<{ [key: number]: string }>({});

const [openIndex, setOpenIndex] =
useState<number | null>(null);

const [copiedIndex, setCopiedIndex] =
useState<number | null>(null);

const handleCopyPrompt = async (
promptText: string,
index: number
) => {
try {
await navigator.clipboard.writeText(promptText);

  setCopiedIndex(index);

  setTimeout(() => {
    setCopiedIndex(null);
  }, 2000);
} catch {
  // Clipboard may be unavailable in some browsers.
}

};

const handleGenerateVideo = async (
  scene: Scene,
  index: number
) => {
  if (loadingIndex !== null) return;

  if (!scene.imageUrl) {
    setErrors((prev) => ({
      ...prev,
      [index]: "Scene image is missing.",
    }));

    return;
  }

  setLoadingIndex(index);

  setErrors((prev) => ({
    ...prev,
    [index]: "",
  }));

  setProgress((prev) => ({
    ...prev,
    [index]: 10,
  }));

  const prompt = buildVideoPrompt(
    scene,
    style
  );

  const sceneDuration = 4;

  try {
    const response = await fetch(
      "/api/generate-video",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          imageUrl: scene.imageUrl,
          style,
          aspectRatio: "9:16",

          // deAPI LTX-Video 0.9.8 currently supports
          // a maximum effective duration of 4 seconds.
          duration: sceneDuration,

          // Explicit silent-video architecture.
          silent: true,

          sceneIndex: index,
          sceneCount: scenes.length,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          data.error ||
          "Video generation failed."
      );
    }

    const finalUrl =
      data.videoUri ||
      data.videoUrl;

    if (!finalUrl) {
      throw new Error(
        "Video generation completed but no video URL was returned."
      );
    }

    setVideoUrls((prev) => ({
      ...prev,
      [index]: finalUrl,
    }));

    setProgress((prev) => ({
      ...prev,
      [index]: 100,
    }));

    onVideoGenerated?.(
      index,
      finalUrl
    );
  } catch (err) {
    console.error(
      `Scene ${index + 1} video generation failed:`,
      err
    );

    setErrors((prev) => ({
      ...prev,
      [index]:
        err instanceof Error
          ? err.message
          : "Video generation failed.",
    }));
  } finally {
    setLoadingIndex(null);
  }
};

return ( <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8"> <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center"> <div> <h3 className="text-xl font-bold text-white">
🎥 Video Motion Director </h3>

      <p className="mt-1 text-xs text-gray-300">
        Cinematic image-to-video direction focused on
        physical acting, story events, character
        interaction, and visual continuity.
      </p>
    </div>
  </div>

  <div className="mt-6 space-y-6">
    {scenes.map((scene, index) => {
      const prompt =
        buildVideoPrompt(
          scene,
          style
        );

      const preview =
        prompt.length > 160
          ? `${prompt.slice(0, 160)}...`
          : prompt;

      const isOpen =
        openIndex === index;

      const videoUrl =
        videoUrls[index];

      const error =
        errors[index];

      const sceneProgress =
        progress[index] ?? 0;

      return (
        <div
          key={index}
          className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-purple-500/30"
        >
          <div className="flex flex-col justify-between gap-3 border-b border-white/5 pb-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-400/20 text-xs font-bold text-purple-300">
                {index + 1}
              </span>

              <h4 className="font-bold text-white">
                Scene {index + 1} —{" "}
                {scene.title ||
                  `Cut ${index + 1}`}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleCopyPrompt(
                    prompt,
                    index
                  )
                }
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300"
              >
                {copiedIndex === index
                  ? "✅ Copied"
                  : "📋 Copy Prompt"}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleGenerateVideo(
                    scene,
                    index
                  )
                }
                disabled={
                  loadingIndex !== null
                }
                className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-purple-500 disabled:opacity-50"
              >
                {loadingIndex === index
                  ? "⏳ Synthesizing..."
                  : "🎥 Generate Video"}
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            {preview}
          </p>

          {loadingIndex === index && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] text-gray-400">
                <span>
                  Generating cinematic motion...
                </span>

                <span>
                  {sceneProgress}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{
                    width: `${sceneProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              ❌ {error}
            </div>
          )}

          {videoUrl && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video
                src={videoUrl}
                controls
                playsInline
                className="w-full"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setOpenIndex(
                isOpen ? null : index
              )
            }
            className="mt-3 text-xs font-semibold text-cyan-400"
          >
            {isOpen
              ? "Hide Directive ↑"
              : "View Full Directive ↓"}
          </button>

          {isOpen && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-300">
                {prompt}
              </pre>
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>
);
}