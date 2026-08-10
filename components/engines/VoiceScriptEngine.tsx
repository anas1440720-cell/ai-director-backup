"use client";

type VoiceScriptEngineProps = {
  scenes: {
    title: string;
    visual: string;
    camera: string;
    voice: string;
  }[];
};

export default function VoiceScriptEngine({
  scenes,
}: VoiceScriptEngineProps) {
  return (
    <div
      className="
      mt-8
      rounded-2xl
      border border-yellow-500/30
      bg-yellow-500/10
      p-6
      "
    >
      <h3 className="text-xl font-bold text-white">
        🎙️ Voice Script Engine
      </h3>

      <p className="mt-3 text-gray-400">
        AI prepares narration for every scene.
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
            {scene.voice}
          </p>
        </div>
      ))}
    </div>
  );
}