"use client";

type MasterProductionPipelineProps = {
  idea: string;
  videoType: string;
  audience: string;
  goal: string;
  character: string;
  style: string;
  scenes: {
    title: string;
    visual: string;
    camera: string;
    voice: string;
  }[];
  imagePrompts?: string[];
  videoPrompts?: string[];
  voiceScripts?: string[];
  musicTimeline?: string[];
};

export default function MasterProductionPipeline({
  idea,
  videoType,
  audience,
  goal,
  character,
  style,
  scenes = [],
  imagePrompts = [],
  videoPrompts = [],
  voiceScripts = [],
  musicTimeline = [],
}: MasterProductionPipelineProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl">
        <h3 className="text-2xl font-bold text-white">
          🧠 Master Production Blueprint
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          Complete orchestrator plan synthesized from your story vision.
        </p>

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-black/30 p-3">
            <span className="text-xs text-gray-500">Idea Concept</span>
            <p className="mt-1 font-semibold text-white truncate">{idea || "—"}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-3">
            <span className="text-xs text-gray-500">Format & Style</span>
            <p className="mt-1 font-semibold text-white">{videoType} · {style}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-3">
            <span className="text-xs text-gray-500">Audience & Goal</span>
            <p className="mt-1 font-semibold text-white">{audience} · {goal}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-lg bg-white/10 px-3 py-1.5 text-gray-300">
            🎬 {scenes.length} Scenes
          </span>
          <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-blue-300">
            🖼️ {imagePrompts.length} Image Prompts
          </span>
          <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-purple-300">
            🎥 {videoPrompts.length} Video Prompts
          </span>
          <span className="rounded-lg bg-green-500/10 px-3 py-1.5 text-green-300">
            🎙️ {voiceScripts.length} Voice Scripts
          </span>
          <span className="rounded-lg bg-pink-500/10 px-3 py-1.5 text-pink-300">
            🎵 {musicTimeline.length} Audio Tracks
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/30"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/10 text-xs font-bold text-cyan-400">
                {index + 1}
              </span>
              <h4 className="font-bold text-white">
                {scene.title || `Scene ${index + 1}`}
              </h4>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="font-semibold text-cyan-300">Visual Setup:</span>{" "}
                {scene.visual}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-purple-300">Camera Direction:</span>{" "}
                {scene.camera}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-green-300">Voice Script:</span>{" "}
                {scene.voice}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}