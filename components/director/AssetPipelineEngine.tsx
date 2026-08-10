"use client";

import { useState } from "react";

type SceneAsset = {
  id?: number;
  title?: string;
  visual?: string;
};

type Props = {
  scenes: SceneAsset[];
};

export default function AssetPipelineEngine({ scenes }: Props) {
  const [assets, setAssets] = useState(
    scenes.map((scene, index) => ({
      scene: index + 1,
      image: "waiting",
      video: "waiting",
      voice: "waiting",
      music: "waiting",
    }))
  );

  function generateImages() {
    setAssets((prev) =>
      prev.map((asset) => ({
        ...asset,
        image: "ready",
      }))
    );
  }

  return (
    <div className="mt-8 border rounded-xl p-6">
      <h2 className="text-xl font-bold">
        🚀 Asset Pipeline Engine
      </h2>

      <p className="mt-2">
        Manage production assets per scene.
      </p>

      <button
        onClick={generateImages}
        className="mt-4 px-4 py-2 rounded bg-black text-white"
      >
        Generate Scene Images
      </button>

      <div className="mt-6 space-y-4">
        {assets.map((asset) => (
          <div
            key={asset.scene}
            className="border p-4 rounded"
          >
            <h3>
              🎬 Scene {asset.scene}
            </h3>

            <p>
              🖼 Image:{" "}
              {asset.image === "ready"
                ? "✅ Ready"
                : "⏳ Waiting"}
            </p>

            <p>
              🎥 Video: ⏳ Waiting
            </p>

            <p>
              🎙 Voice: ⏳ Waiting
            </p>

            <p>
              🎵 Music: ⏳ Waiting
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}