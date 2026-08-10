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
  scenes,
}: SceneBuilderProps) {

  return (

    <div
      className="
      mt-8
      rounded-2xl
      border border-purple-500/30
      bg-purple-500/10
      p-6
      "
    >

      <h3 className="text-xl font-bold text-white">
        🎬 Scene Builder Engine
      </h3>

      <p className="mt-3 text-gray-400">
        AI converts every story scene into a cinematic production plan.
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

          <p className="mt-2 text-gray-300">
            📍 Location:
            <span className="text-white">
              {" "}AI chooses the best cinematic location.
            </span>
          </p>

          <p className="text-gray-300">
            💡 Lighting:
            <span className="text-white">
              {" "}Professional movie lighting.
            </span>
          </p>

          <p className="text-gray-300">
            🎥 Camera:
            <span className="text-white">
              {" "}{scene.camera}
            </span>
          </p>

          <p className="text-gray-300">
            🎭 Scene:
            <span className="text-white">
              {" "}{scene.visual}
            </span>
          </p>

        </div>

      ))}

    </div>

  );

}