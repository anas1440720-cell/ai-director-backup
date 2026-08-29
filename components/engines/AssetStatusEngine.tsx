"use client";

type AssetStatusEngineProps = {
  scenes: {
    title: string;
  }[];
  generatedImages?: string[];
  generatedVideos?: (string | null)[];
  generatedVoiceAudios?: (string | null)[];
  generatedMusicAudios?: (string | null)[];
  generatedSfxAudios?: (string | null)[];
};

type AssetItemProps = {
  icon: string;
  label: string;
  ready: boolean;
};

function AssetItem({ icon, label, ready }: AssetItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>

      <span
        className={`text-xs font-bold ${
          ready ? "text-green-400" : "text-yellow-400/80"
        }`}
      >
        {ready ? "✓ Ready" : "⏳ Pending"}
      </span>
    </div>
  );
}

export default function AssetStatusEngine({
  scenes = [],
  generatedImages = [],
  generatedVideos = [],
  generatedVoiceAudios = [],
  generatedMusicAudios = [],
  generatedSfxAudios = [],
}: AssetStatusEngineProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">📦 Scene Asset Status</h3>
          <p className="mt-1 text-sm text-gray-400">
            Real-time track record of generated assets across all scenes.
          </p>
        </div>

        <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300">
          {scenes.length} Scene{scenes.length === 1 ? "" : "s"}
        </div>
      </div>

      {scenes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <div className="text-3xl">📦</div>
          <p className="mt-2 font-semibold text-white">No production assets yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Assets will appear here live during scene generation.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {scenes.map((scene, index) => {
            const isImgReady = Boolean(generatedImages[index]);
            const isVidReady = Boolean(generatedVideos[index]);
            const isVoiceReady = Boolean(generatedVoiceAudios[index]);
            const isMusicReady = Boolean(generatedMusicAudios[index]);
            const isSfxReady = Boolean(generatedSfxAudios[index]);

            const readyCount = [
              isImgReady,
              isVidReady,
              isVoiceReady,
              isMusicReady,
              isSfxReady,
            ].filter(Boolean).length;

            return (
              <div
                key={`${scene.title}-${index}`}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/10 text-xs font-bold text-cyan-400">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-white">
                      {scene.title || `Scene ${index + 1}`}
                    </h4>
                  </div>

                  <span className="text-xs font-semibold text-gray-400">
                    {readyCount}/5 Assets
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  <AssetItem icon="🖼️" label="Image" ready={isImgReady} />
                  <AssetItem icon="🎥" label="Video" ready={isVidReady} />
                  <AssetItem icon="🎙️" label="Voice" ready={isVoiceReady} />
                  <AssetItem icon="🎵" label="Music" ready={isMusicReady} />
                  <AssetItem icon="🔊" label="SFX" ready={isSfxReady} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}