"use client";

type ProductionWorkspaceProps = {
  scenes: {
    title: string;
    visual: string;
    camera: string;
    voice: string;
  }[];
};

export default function ProductionWorkspace({
  scenes = [],
}: ProductionWorkspaceProps) {
  return (
    <div className="mt-8 rounded-3xl border border-orange-500/30 bg-orange-500/10 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            🎬 AI Production Workspace
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Pre-flight review and scene orchestration before asset generation.
          </p>
        </div>
        <span className="rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-300">
          {scenes.length} Scenes Loaded
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-orange-500/40"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-400/20 text-xs font-bold text-orange-300">
                {index + 1}
              </span>
              <h4 className="font-bold text-white">
                {scene.title || `Scene ${index + 1}`}
              </h4>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <p className="text-gray-300">
                <span className="font-semibold text-cyan-300">Visual:</span>{" "}
                {scene.visual || "Default visual framing"}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-purple-300">Camera:</span>{" "}
                {scene.camera || "Static cinematic shot"}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-emerald-300">Voice:</span>{" "}
                {scene.voice || "No narration script"}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs text-gray-300">
                🖼 Image <span className="block text-[10px] text-cyan-400">Ready</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs text-gray-300">
                🎥 Video <span className="block text-[10px] text-purple-400">Queued</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs text-gray-300">
                🎙 Voice <span className="block text-[10px] text-emerald-400">Synced</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs text-gray-300">
                🎵 Music <span className="block text-[10px] text-pink-400">Mapped</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}