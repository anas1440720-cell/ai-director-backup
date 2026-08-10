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
  scenes,
  imagePrompts = [],
  videoPrompts = [],
  voiceScripts = [],
  musicTimeline = [],
}: MasterProductionPipelineProps) {
  return (
    <div>
      <h3 className="text-xl font-bold text-white">
        🧠 Master Production Pipeline
      </h3>

      <p className="mt-3 text-gray-400">
        Complete AI production plan generated from your idea.
      </p>

      <div className="mt-6 space-y-2 text-gray-300">
        <p><span className="font-semibold text-white">Idea:</span> {idea}</p>
        <p><span className="font-semibold text-white">Video Type:</span> {videoType}</p>
        <p><span className="font-semibold text-white">Audience:</span> {audience}</p>
        <p><span className="font-semibold text-white">Goal:</span> {goal}</p>
        <p><span className="font-semibold text-white">Character:</span> {character}</p>
        <p><span className="font-semibold text-white">Style:</span> {style}</p>

        <p><span className="font-semibold text-white">Scenes:</span> {scenes.length}</p>
        <p><span className="font-semibold text-white">Image Prompts:</span> {imagePrompts.length}</p>
        <p><span className="font-semibold text-white">Video Prompts:</span> {videoPrompts.length}</p>
        <p><span className="font-semibold text-white">Voice Scripts:</span> {voiceScripts.length}</p>
        <p><span className="font-semibold text-white">Music Timeline:</span> {musicTimeline.length}</p>
      </div>

      <div className="mt-8 space-y-5">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <h4 className="font-bold text-cyan-400">
              🎬 {scene.title}
            </h4>

            <p className="mt-2 text-gray-300">
              <span className="font-semibold text-white">Visual:</span>{" "}
              {scene.visual}
            </p>

            <p className="text-gray-300">
              <span className="font-semibold text-white">Camera:</span>{" "}
              {scene.camera}
            </p>

            <p className="text-gray-300">
              <span className="font-semibold text-white">Voice:</span>{" "}
              {scene.voice}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}