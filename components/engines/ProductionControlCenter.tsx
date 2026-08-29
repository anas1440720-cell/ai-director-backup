"use client";

type ProductionControlCenterProps = {
  idea: string;
  progress: number;
  status: string;
  imageReady: boolean;
  videoReady: boolean;
  voiceReady: boolean;
  musicReady: boolean;
};

export default function ProductionControlCenter({
  idea,
  progress,
  status,
  imageReady,
  videoReady,
  voiceReady,
  musicReady,
}: ProductionControlCenterProps) {
  const assets = [
    { label: "Images", icon: "🖼️", ready: imageReady },
    { label: "Videos", icon: "🎥", ready: videoReady },
    { label: "Voiceovers", icon: "🎙️", ready: voiceReady },
    { label: "Music & SFX", icon: "🎵", ready: musicReady },
  ];

  return (
    <div className="mt-8 rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-xl">
      <h3 className="text-2xl font-bold text-white">
        🎬 AI Director Control Center
      </h3>

      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold text-gray-400">Active Project</p>
          <p className="mt-1 text-lg font-bold text-white truncate">
            {idea || "Untitled Production"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex justify-between text-sm font-semibold text-white">
            <span>Production Progress</span>
            <span className="text-cyan-400">{progress}%</span>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Status: <span className="text-gray-200">{status || "Idle"}</span>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {assets.map((asset, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
                asset.ready
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-white/5 bg-white/5 opacity-70"
              }`}
            >
              <span className="text-sm font-medium text-white">
                {asset.icon} {asset.label}
              </span>
              <span
                className={`text-xs font-bold ${
                  asset.ready ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {asset.ready ? "✅ Ready" : "⏳ Waiting"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}