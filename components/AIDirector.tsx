"use client";
import { useEffect, useMemo, useState } from "react";
import Dashboard from "./engines/Dashboard";
import ProductionFlowEngine from "./engines/ProductionFlowEngine";
import ProductionGeneratorEngine from "./engines/ProductionGeneratorEngine";
import GlobalProgressEngine from "./engines/GlobalProgressEngine";
import DirectorTabs from "./director/DirectorTabs";
import DirectorWorkspace from "./director/DirectorWorkspace";
import DirectorProductionWorkspace from "./director/DirectorProductionWorkspace";
import { buildImagePrompt } from "./engines/ImagePromptEngine";
import { calculateSceneDurations } from "@/lib/ai-provider";
import { SceneData, StoryData } from "@/lib/aiBrain";

type Props = {
  idea: string;
  onBackToIdea?: () => void;
};

type GeneratedAudio = (string | null)[];

type EditableScene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

type CharacterLock = {
  characterId: string;
  name: string;
  age: string;
  appearance: string;
  faceStructure: string;
  skinTone: string;
  hair: string;
  eyes: string;
  bodyType: string;
  clothing: string;
  footwear: string;
  accessories: string;
  distinctiveFeatures: string;
  visualIdentity: string;
};

const MAX_SCENE_DURATION = 4;
const MIN_VIDEO_DURATION = 5;
const MAX_VIDEO_DURATION = 1800;

function normalizeSceneDurations(
  scenes: SceneData[],
  requestedDuration: number
): number[] {
  const safeDuration = Math.min(
    MAX_VIDEO_DURATION,
    Math.max(
      MIN_VIDEO_DURATION,
      Math.round(Number(requestedDuration) || MIN_VIDEO_DURATION)
    )
  );

  const count = scenes.length;

  if (count === 0) {
    return [];
  }

  /*
   * The story API is the source of truth for scene durations.
   *
   * We do NOT silently change the number of scenes here.
   * We only normalize invalid/missing durations while
   * preserving the requested total duration as closely
   * as possible.
   */

  const existing = scenes.map((scene) => {
    const value = Math.round(Number(scene.duration) || 0);

    if (value < 1 || value > MAX_SCENE_DURATION) {
      return 0;
    }

    return value;
  });

  const existingTotal = existing.reduce(
    (sum, value) => sum + value,
    0
  );

  if (
    existingTotal === safeDuration &&
    existing.every(
      (value) =>
        value >= 1 &&
        value <= MAX_SCENE_DURATION
    )
  ) {
    return existing;
  }

  /*
   * If the story returned a valid scene count but
   * invalid durations, calculate a deterministic
   * <=4s schedule for that exact scene count.
   *
   * This is intentionally NOT used to add/remove scenes.
   */

  if (count >= Math.ceil(safeDuration / MAX_SCENE_DURATION)) {
    const durations = Array(count).fill(1);

    let remaining =
      safeDuration - count;

    let index = 0;

    while (remaining > 0) {
      if (
        durations[index] <
        MAX_SCENE_DURATION
      ) {
        durations[index] += 1;
        remaining -= 1;
      }

      index =
        (index + 1) % count;
    }

    return durations;
  }

  /*
   * The story returned too few scenes to represent
   * the requested duration under the provider's 4s
   * maximum. In that case the caller should reject
   * the story rather than generate an incorrect timeline.
   */

  return [];
}

function getCharacterLocks(
  scenes: SceneData[]
): CharacterLock[] {
  const locks = new Map<
    string,
    CharacterLock
  >();

  for (const scene of scenes) {
    for (const character of scene.characters || []) {
      const characterId =
        character.characterId ||
        character.name ||
        "character_1";

      if (locks.has(characterId)) {
        continue;
      }

      locks.set(characterId, {
        characterId,

        name:
          character.name ||
          "Unnamed character",

        age:
          character.age ||
          "Not specified",

        appearance:
          character.appearance ||
          "Preserve the established appearance exactly.",

        faceStructure:
          character.faceStructure ||
          "Preserve the exact established face structure.",

        skinTone:
          character.skinTone ||
          "Preserve the exact established skin tone.",

        hair:
          character.hair ||
          "Preserve the exact established hairstyle and hair color.",

        eyes:
          character.eyes ||
          "Preserve the exact established eye color and eye appearance.",

        bodyType:
          character.bodyType ||
          "Preserve the exact established body proportions and body type.",

        clothing:
          character.clothing ||
          "Preserve the exact established clothing and clothing colors.",

        footwear:
          character.footwear ||
          "Preserve the exact established footwear.",

        accessories:
          character.accessories ||
          "Preserve the exact established accessories.",

        distinctiveFeatures:
          character.distinctiveFeatures ||
          "Preserve all established distinctive visual features.",

        visualIdentity:
          character.visualIdentity ||
          "Preserve the exact established visual identity.",
      });
    }
  }

  return Array.from(locks.values());
}

function buildProductionVideoPrompt(
  scene: SceneData,
  style: string,
  duration: number
): string {
  const characterDescriptions =
    (scene.characters || [])
      .map(
        (character) =>
          `
CHARACTER:
${character.name || character.characterId || "Character"}

IMMUTABLE APPEARANCE:
${character.appearance || "Preserve the exact source-image appearance."}

IMMUTABLE CLOTHING:
${character.clothing || "Preserve the exact source-image clothing."}

CURRENT PHYSICAL ACTION:
${character.action || scene.action || scene.visual || ""}

CURRENT EMOTION:
${character.emotion || scene.emotion || ""}

POSITION IN FRAME:
${character.positionInFrame || ""}
`.trim()
      )
      .join("\n\n");

  return `
IMAGE-TO-VIDEO CINEMATIC MOTION INSTRUCTION

CLIP DURATION:
${duration} seconds

IMPORTANT:
This is a visual-only image-to-video shot.

The video provider MUST NOT generate:
- speech
- dialogue
- narration
- music
- singing
- lyrics
- sound effects
- subtitles
- captions
- text
- watermark

All dialogue is generated separately by ElevenLabs.
All music is generated separately.
All SFX are generated separately.

==================================================
VISUAL STYLE — ABSOLUTE
==================================================

Selected style:
${style || "Realistic"}

Preserve the selected visual style exactly.

Do not reinterpret the style.
Do not switch rendering medium.
Do not turn animation into photorealism.
Do not turn realistic footage into animation.
Do not mix visual styles.

==================================================
SCENE
==================================================

Title:

${scene.title || ""}

Location:

${scene.location || "Maintain the established location exactly."}

ENVIRONMENT:

${scene.environment?.description || ""}

FOREGROUND:

${scene.environment?.foreground || ""}

BACKGROUND:

${scene.environment?.background || ""}

PROPS:

${(scene.environment?.props || []).join(", ")}

LIGHTING:

${scene.lighting?.source || ""}

${scene.lighting?.direction || ""}

${scene.lighting?.quality || ""}

${scene.lighting?.mood || ""}

==================================================
ACTING EVENT
==================================================

${scene.action || scene.visual || ""}

Interaction:
${scene.interaction || ""}

Reaction:
${scene.reaction || scene.emotion || ""}

Movement:
${scene.movement || ""}

Environment Interaction:
${scene.environmentInteraction || ""}

Continuity:
${scene.continuity || ""}

==================================================
CHARACTER CONTINUITY — LOCKED
==================================================

${characterDescriptions}

The source image is the character identity reference.

Preserve exactly:
- face
- facial structure
- age appearance
- skin tone
- hairstyle
- hair color
- eye color
- body proportions
- clothing
- clothing colors
- shoes
- accessories
- distinctive features

Do not redesign the characters.

Do not create replacement characters.

Do not change identity between frames.

==================================================
CINEMATIC ACTING
==================================================

The scene MUST behave like a real cinematic event.

Animate meaningful physical acting only.

The character must:
- perform the described action
- interact with the described object/person/environment
- react naturally to what happens
- create visible cause and effect
- continue the physical state established by the source image

Avoid:
- posing
- idle animation
- character showcase
- beauty shots
- generic walking
- walking toward camera without narrative purpose
- random gestures
- random head movement
- looking at camera
- smiling at camera
- staring without interaction
- decorative movement without story purpose

The camera observes the action.

Acting has priority over camera movement.

==================================================
CAMERA
==================================================

${scene.camera || "Use a controlled cinematic camera that observes the action."}

Camera movement must support the physical event.

Do not use camera movement to hide weak acting.

==================================================
COMPOSITION
==================================================

${scene.composition?.shotType || ""}
${scene.composition?.cameraAngle || ""}
${scene.composition?.lens || ""}

Maintain the source-image composition and spatial relationships unless the described action requires a natural camera adjustment.

==================================================
FINAL VISUAL RULES
==================================================

- Preserve source image identity.
- Preserve source image clothing.
- Preserve environment continuity.
- Preserve props.
- Preserve visual style.
- No new characters.
- No unrelated events.
- No identity changes.
- No clothing changes.
- No face changes.
- No hairstyle changes.
- No age changes.
- No body-proportion changes.
- No speech.
- No music.
- No SFX.
- No subtitles.
- No captions.
- No text.
- No watermark.
- Natural anatomy.
- Natural hands.
- Natural body movement.
- Physically believable motion.
- Cinematic acting.
- The final frame must create the starting condition for the next scene.
`.trim();
}

export default function AIDirector({
  idea,
  onBackToIdea,
}: Props) {
  const [step, setStep] = useState(0);

  const [videoType, setVideoType] =
    useState("");

  const [audience, setAudience] =
    useState("");

  const [goal, setGoal] =
    useState("");

  const [character, setCharacter] =
    useState("");

  const [style, setStyle] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [durationUnit, setDurationUnit] =
    useState<"seconds" | "minutes">(
      "seconds"
    );

  /*
   * Gemini remains the story provider.
   * The API route decides the configured fallback.
   */
  const provider = "gemini";

  const [activeTab, setActiveTab] =
    useState("story");

  const [videoReady, setVideoReady] =
    useState(false);

  const [voiceReady, setVoiceReady] =
    useState(false);

  const [musicReady, setMusicReady] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [progressStatus, setProgressStatus] =
    useState("Waiting...");

  const [imageReady, setImageReady] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [productionFailed, setProductionFailed] =
    useState(false);

  const [
    generatedVoiceAudios,
    setGeneratedVoiceAudios,
  ] = useState<GeneratedAudio>([]);

  const [
    generatedMusicAudios,
    setGeneratedMusicAudios,
  ] = useState<GeneratedAudio>([]);

  const [
    generatedVideos,
    setGeneratedVideos,
  ] = useState<(string | null)[]>([]);

  const [
    generatedImages,
    setGeneratedImages,
  ] = useState<(string | null)[]>([]);

  const [
    editableScenes,
    setEditableScenes,
  ] = useState<EditableScene[]>([]);

  const [appStage, setAppStage] =
    useState<
      "prepare" | "production" | "editing"
    >("prepare");

  const [logs, setLogs] =
    useState<string[]>([]);

  const [storyData, setStoryData] =
    useState<StoryData>({
      concept: idea,
      hook: "",
      directorVision: "",
      mood: "",
      characters: [],
      scenes: [],
      status:
        "Waiting for AI story generation...",
    });

  /*
   * Keep the component synchronized with the
   * current idea without automatically generating
   * a story and consuming API quota.
   */
  useEffect(() => {
    setStoryData((current) => ({
      ...current,
      concept: idea,
    }));
  }, [idea]);

  const brainDecision = useMemo(() => {
    if (goal === "Teach") {
      return {
        emotion:
          "Curiosity and discovery",
        storyType:
          "Educational cinematic journey",
      };
    }

    if (goal === "Entertain") {
      return {
        emotion:
          "Fun and excitement",
        storyType:
          "Entertainment adventure",
      };
    }

    if (goal === "Get More Views") {
      return {
        emotion:
          "Shock and excitement",
        storyType:
          "Viral cinematic content",
      };
    }

    if (goal === "Sell Product") {
      return {
        emotion:
          "Trust and desire",
        storyType:
          "Commercial cinematic story",
      };
    }

    return {
      emotion:
        "Emotional cinematic feeling",
      storyType:
        "Cinematic Story",
    };
  }, [goal]);

  const direction = useMemo(() => {
    switch (style) {
      case "Pixar":
        return {
          style: "Pixar 3D Animation",
          camera:
            "Smooth cinematic camera movements",
          music:
            "Emotional orchestral music",
          colors:
            "Bright colorful world",
          editing:
            "Family friendly storytelling",
        };

      case "3D":
        return {
          style:
            "High-quality 3D cinematic animation",
          camera:
            "Controlled cinematic 3D camera",
          music:
            "Cinematic orchestral music",
          colors:
            "Polished cinematic colors",
          editing:
            "Professional cinematic cuts",
        };

      case "Realistic":
        return {
          style:
            "Hollywood Cinematic Realism",
          camera:
            "Professional film camera movement",
          music:
            "Epic cinematic score",
          colors:
            "Movie color grading",
          editing:
            "Premium cinematic cuts",
        };

      case "Anime":
        return {
          style:
            "Anime Cinematic Style",
          camera:
            "Dynamic anime camera angles",
          music:
            "Emotional anime soundtrack",
          colors:
            "Stylized vibrant colors",
          editing:
            "Fast dramatic transitions",
        };

      case "Fantasy":
        return {
          style:
            "Fantasy Epic Adventure",
          camera:
            "Wide cinematic fantasy shots",
          music:
            "Epic fantasy orchestra",
          colors:
            "Magical cinematic atmosphere",
          editing:
            "Adventure movie pacing",
        };

      default:
        return {
          style:
            "Cinematic Storytelling",
          camera:
            "Controlled cinematic camera",
          music:
            "Emotional cinematic music",
          colors:
            "Balanced cinematic colors",
          editing:
            "Engaging cinematic cuts",
        };
    }
  }, [style]);

  const totalScenes =
    storyData.scenes.length;

  const scenesCount =
    totalScenes;

  const allImagesReady =
    scenesCount > 0 &&
    generatedImages.length >= scenesCount &&
    generatedImages
      .slice(0, scenesCount)
      .every(Boolean);

  const allVideosReady =
    scenesCount > 0 &&
    generatedVideos.length >= scenesCount &&
    generatedVideos
      .slice(0, scenesCount)
      .every(Boolean);

  const requiredVoiceSceneIndexes =
  storyData.scenes
    .slice(0, scenesCount)
    .map((scene: SceneData, index: number) =>
      scene.voice?.trim()
        ? index
        : -1
    )
    .filter(
      (index: number) => index >= 0
    );

const allVoicesReady =
  scenesCount > 0 &&
  requiredVoiceSceneIndexes.every(
    (index: number) =>
      Boolean(
        generatedVoiceAudios[index]
      )
  );

  /*
   * Music is intentionally NOT a production gate.
   *
   * Final editing can proceed once every visual clip
   * and every required ElevenLabs voice track exists.
   */
  useEffect(() => {
    if (
      appStage !== "production" ||
      totalScenes <= 0 ||
      productionFailed
    ) {
      return;
    }

    if (
      !allVideosReady ||
      !allVoicesReady
    ) {
      return;
    }

    console.log(
      "🎬 Production complete: all videos and ElevenLabs voices are ready."
    );

    setVideoReady(true);
    setVoiceReady(true);
    setProgress(100);

    setProgressStatus(
      "Production complete. Ready for editing."
    );

    setLogs((previous) => [
      ...previous,
      "✅ All scene videos verified",
      "✅ All ElevenLabs voice tracks verified",
      "🎬 Production complete",
      "✂️ Opening Editing Workspace",
    ]);

    setIsGenerating(false);
    setAppStage("editing");
  }, [
    appStage,
    totalScenes,
    productionFailed,
    allVideosReady,
    allVoicesReady,
  ]);

  const createButtons = (
    items: [string, string][],
    callback: (value: string) => void
  ) => (
    <div className="mt-8 grid gap-4">
      {items.map(([label, value]) => (
        <button
          key={value}
          type="button"
          onClick={() => callback(value)}
          className="
            rounded-xl
            border border-white/10
            bg-white/5
            p-4
            text-left
            text-white
            transition
            hover:border-cyan-400
            hover:bg-white/10
          "
        >
          {label}
        </button>
      ))}
    </div>
  );

  const types: [string, string][] = [
    ["📺 YouTube Video", "YouTube Video"],
    ["🎬 Short Film", "Short Film"],
    ["📢 Advertisement", "Advertisement"],
    ["🎥 Documentary", "Documentary"],
  ];

  const audiences: [string, string][] = [
    ["👶 Kids", "Kids"],
    ["🎓 Teenagers", "Teenagers"],
    ["💼 Adults", "Adults"],
    ["🌍 Everyone", "Everyone"],
  ];

  const goals: [string, string][] = [
    ["📚 Teach", "Teach"],
    ["🎭 Entertain", "Entertain"],
    ["🛍️ Sell Product", "Sell Product"],
    ["👀 Get More Views", "Get More Views"],
  ];

  const characters: [string, string][] = [
    [
      "👤 One Main Character",
      "One Main Character",
    ],
    [
      "👥 Multiple Characters",
      "Multiple Characters",
    ],
    ["🐾 Animals", "Animals"],
    [
      "🧙 Fantasy Characters",
      "Fantasy Characters",
    ],
  ];

  const styles: [string, string][] = [
    [
      "🎥 Realistic Cinematic",
      "Realistic",
    ],
    ["🧊 3D Animation", "3D"],
    ["🌸 Anime Style", "Anime"],
    ["✨ Pixar Style", "Pixar"],
    ["🐉 Fantasy Epic", "Fantasy"],
  ];

  /*
   * Build immutable character locks once per story.
   *
   * The exact same locks are sent into every image
   * prompt so later scenes cannot invent a new face,
   * hair, clothes or body.
   */
  const characterLocks = useMemo(
    () =>
      getCharacterLocks(
        storyData.scenes
      ),
    [storyData.scenes]
  );

  const productionImagePrompts =
    useMemo(() => {
      if (
        storyData.scenes.length === 0
      ) {
        return [];
      }

      return storyData.scenes.map(
        (scene: SceneData) =>
          buildImagePrompt(
            scene,
            style,
            characterLocks
          )
      );
    }, [
      storyData.scenes,
      style,
      characterLocks,
    ]);

  const productionVideoPrompts =
    useMemo(() => {
      return storyData.scenes.map(
        (scene: SceneData) => {
          const duration =
            Math.round(
              Number(scene.duration) || 0
            );

          return buildProductionVideoPrompt(
            scene,
            style,
            duration
          );
        }
      );
    }, [
      storyData.scenes,
      style,
    ]);

  const resetProductionState = () => {
    setGeneratedImages([]);
    setGeneratedVideos([]);
    setGeneratedVoiceAudios([]);
    setGeneratedMusicAudios([]);

    setEditableScenes([]);

    setImageReady(false);
    setVideoReady(false);
    setVoiceReady(false);
    setMusicReady(false);

    setProductionFailed(false);

    setProgress(0);
    setProgressStatus(
      "Starting production..."
    );

    setLogs([]);
  };

 const validateGeneratedStory = (
  generatedStory: any,
  requestedDuration: number
) => {
  if (
    !Array.isArray(
      generatedStory?.scenes
    )
  ) {
    throw new Error(
      "Story generation returned no valid scenes."
    );
  }

  if (
    generatedStory.scenes.length === 0
  ) {
    throw new Error(
      "Story generation returned zero scenes."
    );
  }

  const safeRequestedDuration = Math.round(
    Number(requestedDuration) || 0
  );

  if (
    safeRequestedDuration < MIN_VIDEO_DURATION ||
    safeRequestedDuration > MAX_VIDEO_DURATION
  ) {
    throw new Error(
      `Invalid requested video duration: ${safeRequestedDuration}s.`
    );
  }

  const expectedSceneCount = Math.ceil(
    safeRequestedDuration / MAX_SCENE_DURATION
  );

  /*
   * The story must contain exactly the number
   * of scenes required by the requested duration.
   *
   * We intentionally do NOT validate Gemini's
   * individual scene durations here.
   *
   * normalizeSceneDurations() is responsible for
   * creating the authoritative <=4s timeline.
   */
  if (
    generatedStory.scenes.length !==
    expectedSceneCount
  ) {
    throw new Error(
      `Scene count mismatch: requested ${safeRequestedDuration}s requires exactly ${expectedSceneCount} scenes at a maximum of ${MAX_SCENE_DURATION}s per scene, but story returned ${generatedStory.scenes.length} scenes.`
    );
  }
};

  return (
    <div
      className="
        mt-12
        rounded-3xl
        border border-white/10
        bg-white/5
        p-8
        backdrop-blur-xl
      "
    >
      {appStage === "prepare" &&
        step === 0 && (
          <>
            <h2 className="text-3xl font-bold text-white">
              🎬 AI Director
            </h2>

            <p className="mt-3 text-gray-400">
              Welcome! I&apos;ll direct your
              movie like a Hollywood director.
            </p>

            <button
              type="button"
              onClick={() =>
                setStep(1)
              }
              className="
                mt-8
                rounded-2xl
                bg-gradient-to-r
                from-blue-500
                to-cyan-400
                px-8
                py-3
                font-semibold
                text-white
              "
            >
              Start
            </button>
          </>
        )}

      {appStage === "prepare" &&
        step === 1 && (
          <>
            <h2 className="text-3xl font-bold text-white">
              What are you creating?
            </h2>

            {createButtons(
              types,
              (value) => {
                setVideoType(value);
                setStep(2);
              }
            )}
          </>
        )}

      {appStage === "prepare" &&
        step === 2 && (
          <>
            <h2 className="text-3xl font-bold text-white">
              Who is this video for?
            </h2>

            {createButtons(
              audiences,
              (value) => {
                setAudience(value);
                setStep(3);
              }
            )}
          </>
        )}

      {appStage === "prepare" &&
        step === 3 && (
          <>
            <h2 className="text-3xl font-bold text-white">
              What is your goal?
            </h2>

            {createButtons(
              goals,
              (value) => {
                setGoal(value);
                setStep(4);
              }
            )}
          </>
        )}

      {appStage === "prepare" &&
        step === 4 && (
          <>
            <h2 className="text-3xl font-bold text-white">
              👤 Main Characters
            </h2>

            {createButtons(
              characters,
              (value) => {
                setCharacter(value);
                setStep(5);
              }
            )}
          </>
        )}

      {appStage === "prepare" &&
        step === 5 && (
          <>
            <h2 className="text-3xl font-bold text-white">
              🎨 Choose Visual Style
            </h2>

            {createButtons(
              styles,
              (value) => {
                setStyle(value);
                setStep(6);
              }
            )}
          </>
        )}

      {appStage === "prepare" &&
        step === 6 && (
          <>
            <h2 className="text-3xl font-bold text-white">
              ⏱️ How long should the
              video be?
            </h2>

            <p className="mt-3 text-gray-400">
              AI Director will calculate
              the exact scene plan while
              respecting the 4-second
              maximum clip duration.
            </p>

            <div className="mt-8 flex w-full flex-col items-center">
              <label className="mb-3 block text-sm font-medium text-gray-300">
                Video Duration
              </label>

              <div className="flex w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={duration}
                  onChange={(event) => {
                    const value =
                      event.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setDuration(value);
                  }}
                  placeholder="10"
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-5
                    py-4
                    text-center
                    text-2xl
                    font-semibold
                    text-white
                    outline-none
                  "
                />

                <select
                  value={durationUnit}
                  onChange={(event) =>
                    setDurationUnit(
                      event.target.value as
                        | "seconds"
                        | "minutes"
                    )
                  }
                  className="
                    border-l
                    border-white/10
                    bg-gray-900
                    px-4
                    text-white
                    outline-none
                  "
                  dir="ltr"
                >
                  <option value="seconds">
                    Seconds
                  </option>

                  <option value="minutes">
                    Minutes
                  </option>
                </select>
              </div>

              <p className="mt-3 text-center text-sm text-gray-500">
                Choose between 5 seconds
                and 30 minutes.
              </p>

              <button
                type="button"
                onClick={() => {
                  const value =
                    Number(duration);

                  if (
                    !Number.isInteger(value)
                  ) {
                    return;
                  }

                  const totalSeconds =
                    durationUnit ===
                    "minutes"
                      ? value * 60
                      : value;

                  if (
                    totalSeconds <
                      MIN_VIDEO_DURATION ||
                    totalSeconds >
                      MAX_VIDEO_DURATION
                  ) {
                    return;
                  }

                  setDuration(
                    String(totalSeconds)
                  );

                  setStep(7);
                }}
                className="
                  mt-6
                  w-full
                  max-w-sm
                  rounded-2xl
                  bg-cyan-500
                  px-6
                  py-4
                  font-bold
                  text-white
                  transition
                  hover:bg-cyan-400
                "
              >
                ▶️ Continue
              </button>
            </div>
          </>
        )}

      {step === 7 && (
        <>
          {appStage === "prepare" && (
            <Dashboard
              idea={idea}
              videoType={videoType}
              audience={audience}
              goal={goal}
              character={character}
              style={style}
              duration={duration}
              appStage={appStage}
              onGenerate={async () => {
                const requestedDuration =
                  Number(duration);

                if (
                  !Number.isInteger(
                    requestedDuration
                  ) ||
                  requestedDuration <
                    MIN_VIDEO_DURATION ||
                  requestedDuration >
                    MAX_VIDEO_DURATION
                ) {
                  setProgressStatus(
                    "Invalid video duration."
                  );

                  return;
                }

                resetProductionState();

                setAppStage(
                  "production"
                );

                setIsGenerating(true);

                setLogs([
                  "🎬 Production Started",
                ]);

                try {
                  /*
                   * ==========================================
                   * 1. STORY
                   * ==========================================
                   */

                  setProgress(5);

                  setProgressStatus(
                    "Generating cinematic story..."
                  );

                  const storyResponse =
                    await fetch(
                      "/api/generate-story",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type":
                            "application/json",
                        },
                        body: JSON.stringify({
                          idea,
                          provider,
                          duration:
                            requestedDuration,
                          videoType,
                          audience,
                          goal,
                          character,
                          style,
                        }),
                      }
                    );

                  const generatedStory =
                    await storyResponse.json();

                  console.log(
                    "🎬 Story response:",
                    generatedStory
                  );

                  if (
                    !storyResponse.ok ||
                    !generatedStory?.success
                  ) {
                    throw new Error(
                      generatedStory?.message ||
                        "Story generation failed."
                    );
                  }

                  /*
                   * CRITICAL:
                   *
                   * Do not repair the story silently.
                   *
                   * If the story API returns scene
                   * durations that do not equal the
                   * requested duration, stop here.
                   *
                   * This prevents image/video/audio
                   * generation from running with an
                   * incorrect timeline.
                   */

                  validateGeneratedStory(
                    generatedStory,
                    requestedDuration
                  );

                  /*
                   * Normalize the story only after
                   * validation. The API's scene count
                   * and duration plan remain authoritative.
                   */

                  const normalizedScenes =
                    generatedStory.scenes.map(
                      (
                        scene: SceneData
                      ) => ({
                        ...scene,
                        duration:
                          Math.round(
                            Number(
                              scene.duration
                            )
                          ),
                      })
                    );

                  /*
                   * Safety check after normalization.
                   */

                  const normalizedDurations =
                    normalizeSceneDurations(
                      normalizedScenes,
                      requestedDuration
                    );

                  if (
                    normalizedDurations.length !==
                    normalizedScenes.length
                  ) {
                    throw new Error(
                      "Unable to establish a valid scene duration plan without changing the generated scene count."
                    );
                  }

                  if (
                    normalizedDurations.some(
                      (value) =>
                        value < 1 ||
                        value >
                          MAX_SCENE_DURATION
                    )
                  ) {
                    throw new Error(
                      "Invalid normalized scene duration plan."
                    );
                  }

                  const normalizedTotal =
                    normalizedDurations.reduce(
                      (sum, value) =>
                        sum + value,
                      0
                    );

                  if (
                    normalizedTotal !==
                    requestedDuration
                  ) {
                    throw new Error(
                      `Final scene duration plan does not equal requested duration. Requested ${requestedDuration}s, got ${normalizedTotal}s.`
                    );
                  }

                  const finalScenes =
  normalizedScenes.map(
    (
      scene: SceneData,
      index: number
    ) => ({
      ...scene,
      duration: Number(
        normalizedDurations[index]
      ),
    })
  );

                  const finalStory = {
                    ...generatedStory,
                    scenes:
                      finalScenes,
                  };

                  setStoryData({
                    concept: idea,
                    hook:
                      finalStory.hook ||
                      "",
                    directorVision:
                      finalStory.directorVision ||
                      "",
                    mood:
                      finalStory.mood ||
                      brainDecision.emotion ||
                      "AI Generated",
                    characters:
                      Array.isArray(
                        finalStory.characters
                      )
                        ? finalStory.characters
                        : [],
                    scenes:
                      finalScenes,
                    status:
                      "Generated",
                  });

                  setEditableScenes(
                    finalScenes.map(
                      (
                        scene: SceneData
                      ) => ({
                        title:
                          scene.title ||
                          "",
                        visual:
                          scene.visual ||
                          "",
                        camera:
                          scene.camera ||
                          "",
                        voice:
                          scene.voice ||
                          "",
                      })
                    )
                  );

                  setLogs((previous) => [
                    ...previous,
                    `✅ Story Generated — ${finalScenes.length} scenes`,
                    `⏱️ Timeline verified — ${requestedDuration}s total`,
                    `🎬 Scene durations verified — max ${MAX_SCENE_DURATION}s`,
                  ]);

                  setProgress(20);

                  setProgressStatus(
                    "Story verified. Preparing scene assets..."
                  );

                  /*
                   * Do NOT call image/video/voice APIs
                   * here.
                   *
                   * ProductionGeneratorEngine owns
                   * actual generation.
                   *
                   * This prevents duplicate requests
                   * and protects provider quota.
                   */

                  setImageReady(false);
                  setVideoReady(false);
                  setVoiceReady(false);
                  setMusicReady(false);

                  setLogs((previous) => [
                    ...previous,
                    "🖼️ Image generation queued",
                    "🎥 Video generation queued",
                    "🎙️ ElevenLabs voice generation queued",
                  ]);
                } catch (error) {
                  console.error(
                    "❌ Production Pipeline Error:",
                    error
                  );

                  const message =
                    error instanceof Error
                      ? error.message
                      : "Production failed.";

                  setProductionFailed(
                    true
                  );

                  setIsGenerating(false);
                  setProgress(0);

                  setProgressStatus(
                    `Production failed: ${message}`
                  );

                  setLogs((previous) => [
                    ...previous,
                    `❌ Production Failed`,
                    message,
                  ]);
                }
              }}
            />
          )}

          <GlobalProgressEngine
            progress={progress}
            status={progressStatus}
          />

         {appStage === "production" &&
  (isGenerating ||
    productionFailed) &&
  productionImagePrompts.length === storyData.scenes.length &&
  productionVideoPrompts.length === storyData.scenes.length &&
  storyData.scenes.length > 0 && (
              <DirectorProductionWorkspace
                progress={progress}
              >
                <ProductionFlowEngine
                  progress={progress}
                />

                <ProductionGeneratorEngine
  idea={idea}
  imageProvider="cloudflare"
  duration={duration}
  sceneDurations={calculateSceneDurations(
  Math.round(Number(duration) || 0)
)}
  imagePrompts={
    productionImagePrompts
  }
  videoPrompts={
    productionVideoPrompts
  }
  voiceScripts={storyData.scenes.map(
    (
      scene: SceneData
    ) =>
      scene.voice || ""
  )}

  generatedImages={
    generatedImages
  }

  generatedVideos={
    generatedVideos
  }

  generatedVoiceAudios={
    generatedVoiceAudios
  }

  musicTimeline={storyData.scenes.map(
    (
      scene: SceneData
    ) =>
      scene.musicMood ||
      "Cinematic background music"
  )}
                  onImageGenerated={(
                    index,
                    imageUrl
                  ) => {
                    if (!imageUrl) {
                      console.error(
                        `Scene ${
                          index + 1
                        } returned an empty image URL.`
                      );

                      return;
                    }

                    setGeneratedImages(
                      (current) => {
                        const updated = [
                          ...current,
                        ];

                        updated[index] =
                          imageUrl;

                        return updated;
                      }
                    );

                    setImageReady(
                      () => {
                        const next =
                          generatedImages.length >=
                          scenesCount &&
                          generatedImages
                            .slice(
                              0,
                              scenesCount
                            )
                            .every(Boolean);

                        return next;
                      }
                    );

                    setLogs((previous) => [
                      ...previous,
                      `🖼️ Scene ${
                        index + 1
                      } Image Generated`,
                    ]);

                    console.log(
                      `🖼️ Scene ${
                        index + 1
                      } image generated:`,
                      imageUrl
                    );
                  }}
                  onVideoGenerated={(
                    index,
                    videoUri
                  ) => {
                    if (!videoUri) {
                      console.error(
                        `Scene ${
                          index + 1
                        } returned an empty video URL.`
                      );

                      return;
                    }

                    setGeneratedVideos(
                      (current) => {
                        const updated = [
                          ...current,
                        ];

                        updated[index] =
                          videoUri;

                        return updated;
                      }
                    );

                    setLogs((previous) => [
                      ...previous,
                      `🎥 Scene ${
                        index + 1
                      } Video Generated`,
                    ]);

                    console.log(
                      `🎥 Scene ${
                        index + 1
                      } video generated:`,
                      videoUri
                    );
                  }}
                  onVoiceGenerated={(
                    index,
                    audioUrl
                  ) => {
                    if (!audioUrl) {
                      console.error(
                        `Scene ${
                          index + 1
                        } returned an empty ElevenLabs voice URL.`
                      );

                      return;
                    }

                    setGeneratedVoiceAudios(
                      (current) => {
                        const updated = [
                          ...current,
                        ];

                        updated[index] =
                          audioUrl;

                        return updated;
                      }
                    );

                    setLogs((previous) => [
                      ...previous,
                      `🎙️ Scene ${
                        index + 1
                      } ElevenLabs Voice Generated`,
                    ]);

                    console.log(
                      `🎙️ Scene ${
                        index + 1
                      } voice generated:`,
                      audioUrl
                    );
                  }}
                  onMusicGenerated={(
                    index,
                    audioUrl
                  ) => {
                    if (!audioUrl) {
                      console.error(
                        `Scene ${
                          index + 1
                        } returned an empty music URL.`
                      );

                      return;
                    }

                    setGeneratedMusicAudios(
                      (current) => {
                        const updated = [
                          ...current,
                        ];

                        updated[index] =
                          audioUrl;

                        return updated;
                      }
                    );

                    setMusicReady(
                      true
                    );

                    setLogs((previous) => [
                      ...previous,
                      `🎵 Scene ${
                        index + 1
                      } Music Generated`,
                    ]);

                    console.log(
                      `🎵 Scene ${
                        index + 1
                      } music generated:`,
                      audioUrl
                    );
                  }}
                  onGenerationError={(
                    message
                  ) => {
                    console.error(
                      "❌ Generation error:",
                      message
                    );

                    setProductionFailed(
                      true
                    );

                    setProgressStatus(
                      message
                    );

                    setIsGenerating(
                      false
                    );

                    setLogs((previous) => [
                      ...previous,
                      `❌ ${message}`,
                    ]);
                  }}
                />
              </DirectorProductionWorkspace>
            )}

          {appStage === "editing" && (
            <>
              <DirectorTabs
                activeTab={activeTab}
                onChange={setActiveTab}
              />

              <DirectorWorkspace
                activeTab={activeTab}
                idea={idea}
                storyData={storyData}
                generatedImages={
                  generatedImages.filter(
                    Boolean
                  ) as string[]
                }
                generatedVideos={
                  generatedVideos.filter(
                    Boolean
                  ) as string[]
                }
                style={style}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}