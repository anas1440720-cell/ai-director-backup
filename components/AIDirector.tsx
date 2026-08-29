"use client";

import { useEffect, useMemo, useState } from "react";
import StoryEngine from "./engines/StoryEngine";
import CharacterEngine from "./engines/CharacterEngine";
import ShotPlannerEngine from "./engines/ShotPlannerEngine";
import Dashboard from "./engines/Dashboard";
import CameraEngine from "./engines/CameraEngine";
import MusicEngine from "./engines/MusicEngine";
import VoiceEngine from "./engines/VoiceEngine";
import DirectorBrain from "./engines/DirectorBrain";
import SceneBuilderEngine from "./engines/SceneBuilderEngine";
import { buildImagePrompt } from "./engines/ImagePromptEngine";
import VideoPromptEngine from "./engines/VideoPromptEngine";
import VoiceScriptEngine from "./engines/VoiceScriptEngine";
import MusicTimelineEngine from "./engines/MusicTimelineEngine";
import MasterProductionPipeline from "./engines/MasterProductionPipeline";
import ProductionGeneratorEngine from "./engines/ProductionGeneratorEngine";
import ProductionWorkspace from "./engines/ProductionWorkspace";
import AssetStatusEngine from "./engines/AssetStatusEngine";
import GlobalProgressEngine from "./engines/GlobalProgressEngine";
import ProductionAssetsGallery from "./engines/ProductionAssetsGallery";
import AIJobQueueEngine from "./engines/AIJobQueueEngine";
import ProductionLogEngine from "./engines/ProductionLogEngine";
import ProductionControlCenter from "./engines/ProductionControlCenter";
import SceneControlEngine from "./engines/SceneControlEngine";
import ProjectLibraryEngine from "./engines/ProjectLibraryEngine";
import ProjectManagerEngine from "./engines/ProjectManagerEngine";
import ProjectAnalyticsEngine from "./engines/ProjectAnalyticsEngine";
import DirectorTabs from "./director/DirectorTabs";
import DirectorWorkspace from "./director/DirectorWorkspace";
import ProductionFlowEngine from "./engines/ProductionFlowEngine";
import DirectorProductionWorkspace from "./director/DirectorProductionWorkspace";
import DirectorEditingWorkspace from "./director/DirectorEditingWorkspace";
import { SceneData, StoryData } from "@/lib/aiBrain";

type Props = {
  idea: string;
  onBackToIdea?: () => void;
};

export default function AIDirector({
  idea,
  onBackToIdea,
}: Props) {
  const [step, setStep] = useState(0);

  const [videoType, setVideoType] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [character, setCharacter] = useState("");
  const [style, setStyle] = useState("");

  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<
    "seconds" | "minutes"
  >("seconds");

  const provider = "gemini";

  const [activeTab, setActiveTab] = useState("story");

  const [videoReady, setVideoReady] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const [musicReady, setMusicReady] = useState(false);

  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] =
    useState("Waiting...");

  const [imageReady, setImageReady] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [productionFailed, setProductionFailed] =
    useState(false);

  const [generatedImageCount, setGeneratedImageCount] =
    useState(0);

  const [generatedVideoCount, setGeneratedVideoCount] =
    useState(0);
const [generatedVoiceCount, setGeneratedVoiceCount] =
  useState(0);

const [generatedMusicCount, setGeneratedMusicCount] =
  useState(0);

const [generatedVoiceAudios, setGeneratedVoiceAudios] =
  useState<(string | null)[]>([]);

const [generatedMusicAudios, setGeneratedMusicAudios] =
  useState<(string | null)[]>([]);
  /*
   * IMPORTANT:
   * Store the actual generated video URL for every scene.
   *
   * generatedVideos[0] = Scene 1 video URL
   * generatedVideos[1] = Scene 2 video URL
   * generatedVideos[2] = Scene 3 video URL
   */
  const [generatedVideos, setGeneratedVideos] = useState<
    (string | null)[]
  >([]);

  const [appStage, setAppStage] = useState<
    "prepare" | "production" | "editing"
  >("prepare");

  const [logs, setLogs] = useState<string[]>([]);

  const [generatedImages, setGeneratedImages] =
    useState<string[]>([]);

  const [editableScenes, setEditableScenes] = useState<
    {
      title: string;
      visual: string;
      camera: string;
      voice: string;
    }[]
  >([]);

  const [storyData, setStoryData] = useState<StoryData>({
    concept: idea,
    hook: "",
    directorVision: "",
    mood: "",
    characters: [],
    scenes: [],
    status: "Waiting for AI story generation...",
  });

  useEffect(() => {
    if (!idea.trim()) {
      return;
    }

    let cancelled = false;



  }, [idea, provider]);

  const brainDecision = useMemo(() => {
    if (goal === "Teach") {
      return {
        emotion: "Curiosity and discovery",
        storyType:
          "Educational cinematic journey",
      };
    }

    if (goal === "Entertain") {
      return {
        emotion: "Fun and excitement",
        storyType:
          "Entertainment adventure",
      };
    }

    if (goal === "Get More Views") {
      return {
        emotion: "Shock and excitement",
        storyType:
          "Viral cinematic content",
      };
    }

    if (goal === "Sell Product") {
      return {
        emotion: "Trust and desire",
        storyType:
          "Commercial cinematic story",
      };
    }

    return {
      emotion: "Emotional cinematic feeling",
      storyType: "Cinematic Story",
    };
  }, [goal]);

  const direction = useMemo(() => {
    switch (style) {
      case "Pixar":
        return {
          style: "Pixar 3D Animation",
          camera:
            "Smooth cinematic camera movements",
          music: "Emotional orchestral music",
          colors: "Bright colorful world",
          editing:
            "Family friendly storytelling",
        };

      case "Realistic":
        return {
          style: "Hollywood Cinematic",
          camera:
            "Professional film camera movements",
          music: "Epic cinematic score",
          colors: "Movie color grading",
          editing: "Premium cinematic cuts",
        };

      case "Anime":
        return {
          style: "Anime Cinematic Style",
          camera:
            "Dynamic anime camera angles",
          music:
            "Emotional anime soundtrack",
          colors: "Stylized vibrant colors",
          editing:
            "Fast dramatic transitions",
        };

      case "Fantasy":
        return {
          style: "Fantasy Epic Adventure",
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
          style: "Cinematic Storytelling",
          camera:
            "Dynamic camera movements",
          music:
            "Emotional cinematic music",
          colors:
            "Balanced cinematic colors",
          editing: "Engaging cuts",
        };
    }
  }, [style]);

  const totalScenes = storyData.scenes.length;

  const createButtons = (
    items: [string, string][],
    callback: (value: string) => void
  ) => (
    <div className="mt-8 grid gap-4">
      {items.map(([label, value]) => (
        <button
          key={value}
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
    ["📚 Documentary", "Documentary"],
  ];

  const audiences: [string, string][] = [
    ["👶 Kids", "Kids"],
    ["🧑 Teenagers", "Teenagers"],
    ["👨 Adults", "Adults"],
    ["🌍 Everyone", "Everyone"],
  ];

  const goals: [string, string][] = [
    ["🎓 Teach", "Teach"],
    ["😂 Entertain", "Entertain"],
    ["💰 Sell Product", "Sell Product"],
    ["🚀 Get More Views", "Get More Views"],
  ];

  const characters: [string, string][] = [
    ["👤 One Main Character", "One Main Character"],
    ["👥 Multiple Characters", "Multiple Characters"],
    ["🐾 Animals", "Animals"],
    ["🤖 Fantasy Characters", "Fantasy Characters"],
  ];

  const styles: [string, string][] = [
    ["🎬 Realistic Cinematic", "Realistic"],
    ["🌈 3D Animation", "3D"],
    ["🎌 Anime Style", "Anime"],
    ["🧸 Pixar Style", "Pixar"],
    ["🖼 Fantasy Epic", "Fantasy"],
  ];

  const productionImagePrompts = useMemo(() => {
    const characterLocks = new Map<
      string,
      any
    >();

    for (const scene of storyData.scenes) {
      for (const character of scene.characters || []) {
        const characterId =
          character.characterId ||
          character.name ||
          "character_1";

        if (!characterLocks.has(characterId)) {
          characterLocks.set(characterId, {
            characterId,
            name:
              character.name ||
              "Unnamed character",
            age:
              character.age ||
              "Not specified",
            appearance:
              character.appearance ||
              "Not specified",
            faceStructure:
              character.faceStructure ||
              "Preserve established face structure.",
            skinTone:
              character.skinTone ||
              "Preserve established skin tone.",
            hair:
              character.hair ||
              "Preserve established hair.",
            eyes:
              character.eyes ||
              "Preserve established eyes.",
            bodyType:
              character.bodyType ||
              "Preserve established body type.",
            clothing:
              character.clothing ||
              "Preserve established clothing.",
            footwear:
              character.footwear ||
              "Preserve established footwear.",
            accessories:
              character.accessories ||
              "Preserve established accessories.",
            distinctiveFeatures:
              character.distinctiveFeatures ||
              "Preserve all established distinctive features.",
            visualIdentity:
              character.visualIdentity ||
              "Preserve the exact established visual identity.",
          });
        }
      }
    }

    const locks = Array.from(
      characterLocks.values()
    );

    return storyData.scenes.map(
      (scene: SceneData) =>
        buildImagePrompt(
          scene,
          style,
          locks
        )
    );
  }, [storyData.scenes, style]);

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
              Welcome! I'll direct your movie
              like a Hollywood director.
            </p>

            <button
              onClick={() => setStep(1)}
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
              (v) => {
                setVideoType(v);
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
              (v) => {
                setAudience(v);
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
              (v) => {
                setGoal(v);
                setStep(4);
              }
            )}
          </>
        )}

      {appStage === "prepare" &&
        step === 4 && (
          <>
            <h2 className="text-3xl font-bold text-white">
              🎭 Main Characters
            </h2>

            {createButtons(
              characters,
              (v) => {
                setCharacter(v);
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
              (v) => {
                setStyle(v);
                setStep(6);
              }
            )}
          </>
        )}

      {appStage === "prepare" &&
        step === 6 && (
          <>
            <h2 className="text-3xl font-bold text-white">
              🎬 How long should the video be?
            </h2>

            <p className="mt-3 text-gray-400">
              AI Director will automatically decide
              the scenes, shots, pacing, and
              timeline.
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
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setDuration(value);
                  }}
                  placeholder="50"
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
                  onChange={(e) =>
                    setDurationUnit(
                      e.target.value as
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
                Choose between 5 seconds and 30
                minutes.
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
                    totalSeconds < 5 ||
                    totalSeconds > 1800
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
                Continue →
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
                setGeneratedImageCount(0);
                setGeneratedVideoCount(0);

                /*
                 * Clear all previous generated video URLs.
                 */
                setGeneratedVideos([]);

                setProductionFailed(false);

                setAppStage("production");
                setIsGenerating(true);

                setLogs([]);
                setGeneratedImages([]);

                setImageReady(false);
                setVideoReady(false);
                setVoiceReady(false);
                setMusicReady(false);

                setProgress(0);
                setProgressStatus(
                  "Starting production..."
                );

                console.log(
                  "🎬 Starting AI Production Pipeline..."
                );

                setLogs((prev) => [
                  ...prev,
                  "🚀 Production Started",
                ]);

                try {
                  // ============================================
                  // 1. GENERATE STORY
                  // ============================================

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
                            Number(duration) || 5,
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
                    "📖 Story:",
                    generatedStory
                  );

                  if (
                    !storyResponse.ok ||
                    !generatedStory.success ||
                    !Array.isArray(
                      generatedStory.scenes
                    )
                  ) {
                    throw new Error(
                      generatedStory.message ||
                        "Story generation failed."
                    );
                  }

                  setStoryData({
                    concept: idea,
                    hook:
                      generatedStory.hook ||
                      "",
                    directorVision:
                      generatedStory.directorVision ||
                      "",
                    mood:
                      generatedStory.mood ||
                      "AI Generated",
                    characters:
                      Array.isArray(
                        generatedStory.characters
                      )
                        ? generatedStory.characters
                        : [],
                    scenes:
                      generatedStory.scenes,
                    status: "Generated",
                  });

                  setEditableScenes(
                    generatedStory.scenes
                  );

                  setLogs((prev) => [
                    ...prev,
                    "🧠 Story Generated",
                  ]);

                  setProgress(25);

                  setProgressStatus(
                    "Generating Images..."
                  );

                  setLogs((prev) => [
                    ...prev,
                    "🖼 Image generation started",
                  ]);

                  setProgressStatus(
                    "Images ready for generation..."
                  );
                } catch (error) {
                  console.error(
                    "🎬 Production Pipeline Error:",
                    error
                  );

                  setIsGenerating(false);
                  setProductionFailed(true);
                  setProgress(0);

                  const message =
                    error instanceof Error
                      ? error.message
                      : "Story generation failed.";

                  setProgressStatus(
                    `Production failed: ${message}`
                  );

                  setLogs((prev) => [
                    ...prev,
                    "❌ Production Failed",
                    message,
                  ]);

                  return;
                }
              }}
            />
          )}

          <GlobalProgressEngine
            progress={progress}
            status={progressStatus}
          />

          {(isGenerating ||
            productionFailed) &&
            appStage === "production" && (
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
                  imagePrompts={
                    productionImagePrompts
                  }

                  videoPrompts={storyData.scenes.map(
                    (scene: SceneData) =>
                      `
VIDEO GENERATION INSTRUCTION

Create a natural cinematic video continuation of this exact scene.

VISUAL STYLE:
${style}

SCENE:
${scene.title}

LOCATION:
${scene.location || "Maintain the established location."}

ACTION:
${scene.action || scene.visual}

CHARACTER CONTINUITY:
${
  scene.continuity ||
  "Preserve the exact established character identity, face, hair, skin tone, body proportions, clothing and distinctive features."
}

CHARACTER MOTION:
Preserve the exact character identity and clothing from the source image.

Animate only natural physical movement appropriate to the described action.

Do not change the character's face, age, body, hairstyle, skin tone or clothing.

CAMERA:
${scene.camera}

COMPOSITION:
${scene.composition?.shotType || ""}
${scene.composition?.cameraAngle || ""}
${scene.composition?.lens || ""}

LIGHTING:
${scene.lighting?.source || ""}
${scene.lighting?.direction || ""}
${scene.lighting?.quality || ""}

ENVIRONMENT:
${scene.environment?.description || ""}

STRICT RULES:
- Preserve the source image character exactly.
- Preserve clothing exactly.
- Preserve the selected visual style.
- Do not introduce new characters.
- Do not change the location.
- Do not create unrelated events.
- Do not change the character's identity.
- Motion must directly continue the described physical action.
- Use natural, believable movement.
- Keep the camera movement consistent with the scene.
- Do not transform the scene into a different visual medium.
`.trim()
                  )}

                  voiceScripts={storyData.scenes.map(
                    (scene: SceneData) =>
                      scene.voice
                  )}

                  musicTimeline={storyData.scenes.map(
                    () =>
                      "Cinematic background music"
                  )}

                  onImageGenerated={(
                    index,
                    imageUrl
                  ) => {
                    setGeneratedImages(
                      (currentImages) => {
                        const updatedImages =
                          [
                            ...currentImages,
                          ];

                        updatedImages[index] =
                          imageUrl;

                        return updatedImages;
                      }
                    );

                    setGeneratedImageCount(
                      (currentCount) => {
                        const newCount =
                          currentCount + 1;

                        console.log(
                          `🖼 Image progress: ${newCount}/${totalScenes}`
                        );

                        if (
                          newCount >=
                          totalScenes
                        ) {
                          setImageReady(
                            true
                          );

                          setProgressStatus(
                            "All scene images generated. Starting video generation..."
                          );

                          setLogs(
                            (prev) => [
                              ...prev,
                              "✅ All scene images generated",
                              "🎬 Starting video generation for all scenes",
                            ]
                          );
                        }

                        return newCount;
                      }
                    );
                  }}

                  /*
                   * IMPORTANT:
                   * Receive BOTH the scene index
                   * AND the actual video URL.
                   */
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

                    /*
                     * Store the real video URL
                     * at the exact scene index.
                     */
                    setGeneratedVideos(
                      (currentVideos) => {
                        const updatedVideos =
                          [
                            ...currentVideos,
                          ];

                        updatedVideos[index] =
                          videoUri;

                        return updatedVideos;
                      }
                    );

                    /*
                     * Functional update prevents
                     * stale generatedVideoCount
                     * values when React batches updates.
                     */
                    setGeneratedVideoCount(
                      (currentCount) => {
                        const newCount =
                          currentCount + 1;

                        console.log(
                          `🎥 Video progress: ${newCount}/${totalScenes}`
                        );

                        if (
  newCount >=
    totalScenes &&
  totalScenes > 0
) {
  setVideoReady(true);

  setProgressStatus(
    "🎥 All videos generated. Starting voice generation..."
  );

  setLogs((prev) => [
    ...prev,
    "✅ All scene videos generated",
    "🎙️ Starting voice generation for all scenes",
  ]);
}
                        return newCount;
                      }
                    );

                    setLogs((prev) => [
                      ...prev,
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
                        } returned an empty voice audio URL.`
                      );

                      return;
                    }

                    setGeneratedVoiceAudios(
                      (currentAudios) => {
                        const updatedAudios = [
                          ...currentAudios,
                        ];

                        updatedAudios[index] =
                          audioUrl;

                        return updatedAudios;
                      }
                    );

                    setGeneratedVoiceCount(
                      (currentCount) => {
                        const newCount =
                          currentCount + 1;

                        console.log(
                          `🎙️ Voice progress: ${newCount}/${totalScenes}`
                        );

                        if (
                          newCount >=
                            totalScenes &&
                          totalScenes > 0
                        ) {
                          setVoiceReady(true);

                          setProgressStatus(
                            "All scene voices generated. Starting music generation..."
                          );

                          setLogs((prev) => [
                            ...prev,
                            "✅ All scene voices generated",
                            "🎵 Starting music generation for all scenes",
                          ]);
                        }

                        return newCount;
                      }
                    );

                    setLogs((prev) => [
                      ...prev,
                      `🎙️ Scene ${
                        index + 1
                      } Voice Generated`,
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
      `Scene ${index + 1} returned an empty music audio URL.`
    );

    return;
  }

  setGeneratedMusicAudios(
    (currentAudios) => {
      const updatedAudios = [
        ...currentAudios,
      ];

      updatedAudios[index] =
        audioUrl;

      return updatedAudios;
    }
  );

  setGeneratedMusicCount(
    (currentCount) => {
      const newCount =
        currentCount + 1;

      console.log(
        `🎵 Music progress: ${newCount}/${totalScenes}`
      );

      if (
        newCount >= totalScenes &&
        totalScenes > 0
      ) {
        setMusicReady(true);

        setProgressStatus(
          "All scene music generated. Production complete."
        );

        setLogs((prev) => [
          ...prev,
          "✅ All scene music generated",
          "🎬 Production audio complete",
        ]);

        setIsGenerating(false);
      }

      return newCount;
    }
  );

  setLogs((prev) => [
    ...prev,
    `🎵 Scene ${index + 1} Music Generated`,
  ]);

  console.log(
    `🎵 Scene ${index + 1} music generated:`,
    audioUrl
  );
}}

                  onGenerationError={(
                    message
                  ) => {
                    console.error(
                      "🎬 Generation error:",
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

                    setLogs((prev) => [
                      ...prev,
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
                  generatedImages
                }
                generatedVideos={
                  generatedVideos
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



