"use client";

type ImagePromptEngineProps = {
  scenes: {
    title: string;
    visual: string;
    camera: string;
    voice: string;
  }[];
};

export default function ImagePromptEngine({
  scenes,
}: ImagePromptEngineProps) {
  return (
    <div
      className="
      mt-8
      rounded-2xl
      border border-cyan-500/30
      bg-cyan-500/10
      p-6
      "
    >
      <h3 className="text-xl font-bold text-white">
        🖼️ Image Prompt Engine
      </h3>

      <p className="mt-3 text-gray-400">
        AI generates cinematic image prompts for every scene.
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

          <p className="mt-3 text-gray-300 whitespace-pre-wrap">
            Ultra realistic cinematic shot, {scene.visual}, {scene.camera},
            volumetric lighting, dramatic atmosphere, Hollywood composition,
            ultra detailed, 8K, masterpiece.
          </p>
        </div>
      ))}
    </div>
  );
}