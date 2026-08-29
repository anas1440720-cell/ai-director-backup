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
    <div className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-xl">
      <h2 className="text-xl font-bold text-white">
        🚀 Asset Pipeline Engine
      </h2>

      <p className="mt-1 text-xs text-gray-400">
        Manage production assets per scene.
      </p>

      <button
        type="button"
        onClick={generateImages}
        className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-black transition hover:bg-cyan-400"
      >
        Generate Scene Images
      </button>

      <div className="mt-6 space-y-4">
        {assets.map((asset) => (
          <div
            key={asset.scene}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <h3 className="font-bold text-white text-sm">
              🎬 Scene {asset.scene}
            </h3>

            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
              <span className={asset.image === "ready" ? "text-green-400" : "text-gray-400"}>
                🖼️ Image: {asset.image === "ready" ? "✅ Ready" : "⏳ Waiting"}
              </span>
              <span className="text-gray-400">
                🎥 Video: ⏳ Waiting
              </span>
              <span className="text-gray-400">
                🎙️ Voice: ⏳ Waiting
              </span>
              <span className="text-gray-400">
                🎵 Music: ⏳ Waiting
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}