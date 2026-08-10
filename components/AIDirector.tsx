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
import ImagePromptEngine from "./engines/ImagePromptEngine";
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
import { analyzeIdea, SceneData } from "@/lib/aiBrain";
type Props = {
  idea: string;
};

export default function AIDirector({ idea }: Props) {

  const [step, setStep] = useState(0);

  const [videoType, setVideoType] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [character, setCharacter] = useState("");
  const [style, setStyle] = useState("");
const [provider, setProvider] = useState<
  "gemini" | "openai" | "claude"
>("gemini");
  const [activeTab, setActiveTab] = useState("story");
const [videoReady, setVideoReady] = useState(false);
const [voiceReady, setVoiceReady] = useState(false);
const [musicReady, setMusicReady] = useState(false);
const [progress, setProgress] = useState(0);
const [progressStatus, setProgressStatus] = useState("Waiting...");
const [imageReady, setImageReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageCount, setGeneratedImageCount] = useState(0);
  const [generatedVideoCount, setGeneratedVideoCount] = useState(0);
 const [appStage, setAppStage] = useState<
  "prepare" | "production" | "editing"
>("prepare");

const [logs, setLogs] = useState<string[]>([]);

const [generatedImages, setGeneratedImages] = useState<string[]>([]);

const [editableScenes, setEditableScenes] = useState<
  {
    title: string;
    visual: string;
    camera: string;
    voice: string;
  }[]
>([]);

const [storyData, setStoryData] = useState<any>(
  analyzeIdea(idea)
);



useEffect(() => {
  if (!idea.trim()) {
    return;
  }

  let cancelled = false;

  const loadStory = async () => {
    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  idea,
  provider,
}),
      });

      const data = await response.json();

      if (cancelled) {
        return;
      }

      if (
        !response.ok ||
        !data.success ||
        !Array.isArray(data.scenes)
      ) {
        console.error("Story generation failed:", data);
        return;
      }

      setStoryData({
        concept: idea,
        directorVision: data.hook || "",
        mood: "AI Generated",
        scenes: data.scenes,
        status: "Generated",
      });

      setEditableScenes(data.scenes);
    } catch (error) {
      if (!cancelled) {
        console.error("Failed to generate story:", error);
      }
    }
  };

  loadStory();

  return () => {
    cancelled = true;
  };
}, [idea]);


  const brainDecision = useMemo(() => {


    if (goal === "Teach") {

      return {
        emotion: "Curiosity and discovery",
        storyType: "Educational cinematic journey",
      };

    }



    if (goal === "Entertain") {

      return {
        emotion: "Fun and excitement",
        storyType: "Entertainment adventure",
      };

    }



    if (goal === "Get More Views") {

      return {
        emotion: "Shock and excitement",
        storyType: "Viral cinematic content",
      };

    }



    if (goal === "Sell Product") {

      return {
        emotion: "Trust and desire",
        storyType: "Commercial cinematic story",
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
          camera: "Smooth cinematic camera movements",
          music: "Emotional orchestral music",
          colors: "Bright colorful world",
          editing: "Family friendly storytelling",
        };



      case "Realistic":

        return {
          style: "Hollywood Cinematic",
          camera: "Professional film camera movements",
          music: "Epic cinematic score",
          colors: "Movie color grading",
          editing: "Premium cinematic cuts",
        };



      case "Anime":

        return {
          style: "Anime Cinematic Style",
          camera: "Dynamic anime camera angles",
          music: "Emotional anime soundtrack",
          colors: "Stylized vibrant colors",
          editing: "Fast dramatic transitions",
        };



      case "Fantasy":

        return {
          style: "Fantasy Epic Adventure",
          camera: "Wide cinematic fantasy shots",
          music: "Epic fantasy orchestra",
          colors: "Magical cinematic atmosphere",
          editing: "Adventure movie pacing",
        };



      default:

        return {
          style: "Cinematic Storytelling",
          camera: "Dynamic camera movements",
          music: "Emotional cinematic music",
          colors: "Balanced cinematic colors",
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
const providers: [
  string,
  "gemini" | "openai" | "claude",
  boolean
][] = [
  ["Google Gemini", "gemini", true],
  ["OpenAI", "openai", false],
  ["Anthropic Claude", "claude", false],
];


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



  {appStage === "prepare" && step === 0 && (

        <>

          <h2 className="text-3xl font-bold text-white">
            🎬 AI Director
          </h2>
<div className="mt-6">
  <p className="mb-3 text-sm font-semibold text-gray-300">
    AI Provider
  </p>

  <div className="grid gap-3 sm:grid-cols-3">
    {providers.map(([label, providerId, available]) => (
      <button
        key={providerId}
        type="button"
        disabled={!available}
        onClick={() => setProvider(providerId)}
        className={`
          rounded-2xl
          border
          px-4
          py-4
          text-left
          transition
          ${
            provider === providerId
              ? "border-cyan-400 bg-cyan-400/10"
              : "border-white/10 bg-white/5"
          }
          ${
            available
              ? "hover:border-cyan-400/50"
              : "cursor-not-allowed opacity-40"
          }
        `}
      >
        <div className="font-semibold text-white">
          {label}
        </div>

        <div className="mt-1 text-xs text-gray-400">
          {available ? "Available" : "Coming soon"}
        </div>
      </button>
    ))}
  </div>
</div>
          <p className="mt-3 text-gray-400">
            Welcome! I'll direct your movie like a Hollywood director.
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


{appStage === "prepare" && step === 1 && (

        <>
          <h2 className="text-3xl font-bold text-white">
            What are you creating?
          </h2>

          {createButtons(types,(v)=>{
            setVideoType(v);
            setStep(2);
          })}

        </>

      )}




   {appStage === "prepare" && step === 2 && (

        <>
          <h2 className="text-3xl font-bold text-white">
            Who is this video for?
          </h2>

          {createButtons(audiences,(v)=>{
            setAudience(v);
            setStep(3);
          })}

        </>

      )}



    {appStage === "prepare" && step === 3 && (

        <>
          <h2 className="text-3xl font-bold text-white">
            What is your goal?
          </h2>

          {createButtons(goals,(v)=>{
            setGoal(v);
            setStep(4);
          })}

        </>

      )}



{appStage === "prepare" && step === 4 && (

        <>
          <h2 className="text-3xl font-bold text-white">
            🎭 Main Characters
          </h2>

          {createButtons(characters,(v)=>{
            setCharacter(v);
            setStep(5);
          })}

        </>

      )}



    {appStage === "prepare" && step === 5 && (

        <>
          <h2 className="text-3xl font-bold text-white">
            🎨 Choose Visual Style
          </h2>

          {createButtons(styles,(v)=>{
            setStyle(v);
            setStep(6);
          })}

        </>

      )}


{step === 6 && (

  <>

   {appStage === "prepare" && (
  <Dashboard
    idea={idea}
    videoType={videoType}
    audience={audience}
    goal={goal}
    character={character}
    style={style}
    appStage={appStage}
   onGenerate={async () => {
    setGeneratedImageCount(0);
setGeneratedVideoCount(0);
  setAppStage("production");
  setIsGenerating(true);
  setLogs([]);
  setGeneratedImages([]);

  


  setImageReady(false);
  setVideoReady(false);
  setVoiceReady(false);
  setMusicReady(false);

  console.log("🎬 Starting AI Production Pipeline...");

  setLogs((prev) => [
    ...prev,
    "🚀 Production Started",
  ]);

  try {
    // 1. Generate story
    const storyResponse = await fetch("/api/generate-story", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    body: JSON.stringify({
  idea,
  provider,
}),
    });

    const storyData = await storyResponse.json();

    console.log("📖 Story:", storyData);

    if (
      !storyResponse.ok ||
      !storyData.success ||
      !Array.isArray(storyData.scenes)
    ) {
      throw new Error(
        storyData.message || "Story generation failed."
      );
    }

    setLogs((prev) => [
      ...prev,
      "🧠 Story Generated",
    ]);

    setProgress(25);
setProgressStatus("Generating Images...");

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

    setLogs((prev) => [
      ...prev,
      "❌ Production Failed",
    ]);

    setProgressStatus(
      "Production failed."
    );
  }
}}
    />
)}
    <GlobalProgressEngine
      progress={progress}
      status={progressStatus}
   />
{isGenerating && appStage === "production" && (
  <DirectorProductionWorkspace
    progress={progress}
  >
    <ProductionFlowEngine
      progress={progress}
    />

<ProductionGeneratorEngine
  idea={idea}

  imagePrompts={storyData.scenes.map(
    (scene: SceneData) =>
      `Ultra realistic cinematic shot, ${scene.visual}, ${scene.camera}, professional lighting`
  )}

  videoPrompts={storyData.scenes.map(
    (scene: SceneData) =>
      `Cinematic movement, ${scene.visual}, smooth camera motion`
  )}

  voiceScripts={storyData.scenes.map(
    (scene: SceneData) => scene.voice
  )}

  musicTimeline={storyData.scenes.map(
    () => "Cinematic background music"
  )}

 onImageGenerated={(index) => {
  const newCount = generatedImageCount + 1;

  setGeneratedImageCount(newCount);

  console.log(
    `🖼 Scene ${index + 1} image generated`
  );

  if (newCount >= totalScenes) {
    setImageReady(true);
    setProgress(50);
    setProgressStatus(
      "All images generated — ready for video generation."
    );
  }

  setLogs((prev) => [
    ...prev,
    `🖼 Scene ${index + 1} Image Generated`,
  ]);
}}

onVideoGenerated={(index) => {
  const newCount = generatedVideoCount + 1;

  setGeneratedVideoCount(newCount);

  console.log(
    `🎥 Scene ${index + 1} video generated`
  );

if (newCount >= totalScenes) {
  setVideoReady(true);
  setProgress(100);
  setProgressStatus(
    "🎬 All production assets generated successfully."
  );
  setIsGenerating(false);
  setAppStage("editing");
}

  setLogs((prev) => [
    ...prev,
    `🎥 Scene ${index + 1} Video Generated`,
  ]);
}}

 onGenerationError={(message) => {
  console.error("🎬 Generation error:", message);

  setProgressStatus(message);

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
    />
  </>
)}
        </>

      )}

    </div>

  );

}