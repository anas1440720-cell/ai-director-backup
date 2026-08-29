"use client";

type MusicTimelineEngineProps = {
  scenes: {
    title: string;
    visual: string;
    camera: string;
    voice: string;
  }[];
};

export default function MusicTimelineEngine({
  scenes = [],
}: MusicTimelineEngineProps) {
  return (
    <div className="mt-8 rounded-3xl border border-pink-500/30 bg-pink-500/10 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
            🎵 Music Timeline Engine
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Dynamic soundtrack orchestration mapped to each story scene.
          </p>
        </div>
        <span className="rounded-xl border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-xs font-bold text-pink-300">
          {scenes.length} Scene Cue{scenes.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-pink-500/30"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-pink-400/10 text-xs font-bold text-pink-300">
                {index + 1}
              </span>
              <h4 className="font-bold text-white">
                {scene.title || `Scene ${index + 1}`}
              </h4>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              <p className="text-gray-300">
                <span className="font-semibold text-pink-300">🎵 Score:</span>{" "}
                Cinematic orchestral soundtrack with smooth scene transitions.
              </p>
              <p className="text-gray-400">
                <span className="font-semibold text-cyan-300">🔊 Foley/SFX:</span>{" "}
                Synchronized ambient effects matching scene context and camera motion.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}