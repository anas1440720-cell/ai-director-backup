"use client";

type StoryEngineProps = {
  idea: string;
  style: string;
  goal: string;
  emotion?: string;
  storyType?: string;
  storyData?: {
    hook?: string;
    scenes?: {
      title: string;
      visual: string;
      camera: string;
      voice: string;
    }[];
  };
};

export default function StoryEngine({
  idea,
  storyData,
  storyType = "Narrative Drama",
}: StoryEngineProps) {
  const story = storyData || {
    hook: `An exciting story begins about ${idea || "the journey"}...`,
    scenes: [
      {
        title: "Scene 1",
        visual: `Opening cinematic scene introducing ${idea || "the world"}`,
        camera: "Establishing cinematic shot",
        voice: "The story begins...",
      },
      {
        title: "Scene 2",
        visual: `The central narrative conflict and dramatic turning point`,
        camera: "Dynamic tracking camera",
        voice: "The journey continues...",
      },
      {
        title: "Scene 3",
        visual: `The climactic resolution and final impactful takeaway`,
        camera: "Emotional cinematic close-up",
        voice: "The story leaves a lasting impression...",
      },
    ],
  };

  return (
    <div className="mt-8 rounded-3xl border border-green-500/30 bg-green-500/10 p-6 md:p-8 backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-bold text-white">📖 AI Story Blueprint</h3>
          <p className="mt-1 text-xs text-gray-300">
            Structured narrative breakdown and sequential storytelling framework.
          </p>
        </div>

        <span className="rounded-xl border border-green-400/30 bg-green-400/10 px-3 py-1.5 text-xs font-bold text-green-300">
          Archetype: {storyType}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-green-400">
          ⚡ Narrative Hook
        </span>
        <p className="mt-1 text-sm font-medium text-white">
          "{story.hook}"
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {story.scenes?.map((scene, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-green-500/30"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-400/20 text-xs font-bold text-green-300">
                {index + 1}
              </span>
              <h4 className="font-bold text-white">{scene.title || `Scene ${index + 1}`}</h4>
            </div>

            <div className="mt-3 space-y-2 text-xs text-gray-300">
              <p>
                <span className="font-semibold text-cyan-300">🎥 Visual Cue:</span>{" "}
                {scene.visual}
              </p>
              <p>
                <span className="font-semibold text-purple-300">📸 Camera Direction:</span>{" "}
                {scene.camera}
              </p>
              <p>
                <span className="font-semibold text-emerald-300">🎙 Narration / Voice:</span>{" "}
                "{scene.voice}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}