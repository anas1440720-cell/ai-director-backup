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
  scenes,
}: ProductionWorkspaceProps) {
  return (
    <div
      className="
      mt-8
      rounded-2xl
      border border-orange-500/30
      bg-orange-500/10
      p-6
      "
    >
      <h3 className="text-xl font-bold text-white">
        🎬 AI Production Workspace
      </h3>

      <p className="mt-3 text-gray-400">
        Organize every scene before AI starts generating assets.
      </p>

      {scenes.map((scene, index) => (
        <div
          key={index}
          className="
          mt-6
          rounded-xl
          border border-white/10
          p-5
          "
        >
          <h4 className="font-bold text-white">
            {scene.title}
          </h4>

          <div className="mt-4 grid gap-3 md:grid-cols-2">

            <div className="rounded-lg bg-white/5 p-3">
              🖼 Image
            </div>

            <div className="rounded-lg bg-white/5 p-3">
              🎥 Video
            </div>

            <div className="rounded-lg bg-white/5 p-3">
              🎙 Voice
            </div>

            <div className="rounded-lg bg-white/5 p-3">
              🎵 Music
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}