"use client";

type AssetStatusEngineProps = {
  scenes: {
    title: string;
  }[];

  imageReady: boolean;
  videoReady: boolean;
  voiceReady: boolean;
  musicReady: boolean;
};

type AssetItemProps = {
  icon: string;
  label: string;
  ready: boolean;
};

function AssetItem({
  icon,
  label,
  ready,
}: AssetItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>

        <span className="text-sm font-medium text-gray-300">
          {label}
        </span>
      </div>

      <span
        className={
          ready
            ? "text-sm font-bold text-green-400"
            : "text-sm font-bold text-yellow-400"
        }
      >
        {ready ? "✓ Ready" : "⏳ Waiting"}
      </span>
    </div>
  );
}

export default function AssetStatusEngine({
  scenes,
  imageReady,
  videoReady,
  voiceReady,
  musicReady,
}: AssetStatusEngineProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
            📦 Asset Status Engine
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Track the generated assets for every scene.
          </p>
        </div>

        <div className="rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-400">
          {scenes.length} Scene{scenes.length === 1 ? "" : "s"}
        </div>
      </div>

      {scenes.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
          <div className="text-4xl">📦</div>

          <p className="mt-3 font-semibold text-white">
            No production assets yet
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Generate scenes first to see their production assets here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {scenes.map((scene, index) => (
            <div
              key={`${scene.title}-${index}`}
              className="rounded-xl border border-white/10 bg-black/10 p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <h4 className="font-bold text-white">
                  🎬 Scene {index + 1}
                </h4>

                <span className="truncate text-sm text-gray-400">
                  {scene.title}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <AssetItem
                  icon="🖼️"
                  label="Image"
                  ready={imageReady}
                />

                <AssetItem
                  icon="🎥"
                  label="Video"
                  ready={videoReady}
                />

                <AssetItem
                  icon="🎙️"
                  label="Voice"
                  ready={voiceReady}
                />

                <AssetItem
                  icon="🎵"
                  label="Music"
                  ready={musicReady}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}