"use client";

type SceneAsset = {
  title: string;
  visual?: string;
};

type ProductionAssetsGalleryProps = {
  scenes: SceneAsset[];
  generatedImages?: string[];
  generatedVideos?: (string | null)[];
};

export default function ProductionAssetsGallery({
  scenes = [],
  generatedImages = [],
  generatedVideos = [],
}: ProductionAssetsGalleryProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            🖼️ Production Assets Gallery
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Browse all high-resolution visual assets generated across your scenes.
          </p>
        </div>

        <div className="w-fit rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300">
          {scenes.length} Scene Asset{scenes.length === 1 ? "" : "s"}
        </div>
      </div>

      {scenes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center">
          <div className="text-4xl">🖼️</div>
          <p className="mt-3 font-semibold text-white">No assets available</p>
          <p className="mt-1 text-sm text-gray-400">
            Generated scene visuals will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((scene, index) => {
            const imgSrc = generatedImages[index];
            const hasVideo = Boolean(generatedVideos[index]);

            return (
              <div
                key={`${scene.title}-${index}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition hover:border-cyan-400/40"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={scene.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-white/5 text-gray-500">
                      <span className="text-3xl">🎬</span>
                      <span className="mt-2 text-xs">Awaiting Generation</span>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                    Scene {index + 1}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="truncate text-base font-bold text-white">
                    {scene.title || `Scene ${index + 1}`}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                    {scene.visual || "Cinematic scene visual setup."}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-center">
                      <span className="text-sm">🖼️ Image</span>
                      <p
                        className={`text-xs font-bold ${
                          imgSrc ? "text-green-400" : "text-yellow-400/70"
                        }`}
                      >
                        {imgSrc ? "Ready" : "Pending"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-center">
                      <span className="text-sm">🎥 Video</span>
                      <p
                        className={`text-xs font-bold ${
                          hasVideo ? "text-cyan-400" : "text-gray-500"
                        }`}
                      >
                        {hasVideo ? "Rendered" : "Queued"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}