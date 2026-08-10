"use client";

import Image from "next/image";

type SceneAsset = {
  title: string;
  visual?: string;
};

type ProductionAssetsGalleryProps = {
  scenes: SceneAsset[];
};

export default function ProductionAssetsGallery({
  scenes,
}: ProductionAssetsGalleryProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            🖼 Production Assets Gallery
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Browse all visual assets generated for your production.
          </p>
        </div>

        <div className="w-fit rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-400">
          {scenes.length} Scene{scenes.length === 1 ? "" : "s"}
        </div>
      </div>

      {scenes.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 p-10 text-center">
          <div className="text-4xl">🖼️</div>

          <p className="mt-3 font-semibold text-white">
            No assets available
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Generated scene assets will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {scenes.map((scene, index) => (
            <div
              key={`${scene.title}-${index}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20 transition hover:border-cyan-400/30"
            >
              <div className="relative h-56 w-full overflow-hidden bg-black/30">
                <Image
                  src={`/images/scene${index + 1}.jpg`}
                  alt={scene.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  Scene {index + 1}
                </div>
              </div>

              <div className="p-5">
                <h3 className="truncate text-lg font-bold text-white">
                  {scene.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                  {scene.visual || "Cinematic scene asset"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <div className="text-lg">🖼️</div>

                    <p className="mt-1 text-xs text-gray-400">
                      Image
                    </p>

                    <p className="text-xs font-bold text-green-400">
                      Ready
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <div className="text-lg">🎬</div>

                    <p className="mt-1 text-xs text-gray-400">
                      Scene
                    </p>

                    <p className="text-xs font-bold text-cyan-400">
                      Generated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
