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
  scenes,
}: MusicTimelineEngineProps) {
  return (
    <div
      className="
      mt-8
      rounded-2xl
      border border-pink-500/30
      bg-pink-500/10
      p-6
      "
    >
      <h3 className="text-xl font-bold text-white">
        🎵 Music Timeline Engine
      </h3>

      <p className="mt-3 text-gray-400">
        AI selects the perfect music mood for every scene.
      </p>

      {scenes.map((scene, index) => (
        <div
          key={index}
          className="
          mt-5
          rounded-xl
          border border-white/10
          p-4
          "
        >
          <h4 className="font-bold text-white">
            {scene.title}
          </h4>

          <p className="mt-3 text-gray-300">
            🎵 Cinematic orchestral soundtrack with emotional transitions.
          </p>

          <p className="text-gray-400">
            🔊 Ambient sound effects matched to the scene atmosphere.
          </p>
        </div>
      ))}
    </div>
  );
}