"use client";

type SceneBuilderProps = {
  scenes: {
    title: string;
    visual: string;
    camera: string;
    voice: string;
  }[];
};

export default function SceneBuilderEngine({
  scenes = [],
}: SceneBuilderProps) {
  return (
    <div className="mt-8 rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            🎬 Scene Builder Engine
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Translates narrative storyboards into actionable cinematic production blueprints.
          </p>
        </div>
        <span className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-bold text-purple-300">
          {scenes.length} Production Blueprints
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-purple-500/30"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-400/20 text-xs font-bold text-purple-300">
                {index + 1}
              </span>
              <h4 className="font-bold text-white">
                {scene.title || `Scene ${index + 1}`}
              </h4>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-white/5 p-3">
                <span className="font-semibold text-cyan-300">📍 Environment / Location:</span>
                <p className="mt-1 text-gray-300">
                  Adaptive setting matching the story world.
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <span className="font-semibold text-yellow-300">💡 Lighting & Atmosphere:</span>
                <p className="mt-1 text-gray-300">
                  Cinematic volumetric lighting with rich dynamic contrast.
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <span className="font-semibold text-purple-300">🎥 Camera Direction:</span>
                <p className="mt-1 text-gray-300">
                  {scene.camera || "Dynamic cinematic camera angle."}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <span className="font-semibold text-emerald-300">🎭 Visual Composition:</span>
                <p className="mt-1 text-gray-300">
                  {scene.visual || "Standard cinematic framing."}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}