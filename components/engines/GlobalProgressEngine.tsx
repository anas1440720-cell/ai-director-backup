"use client";

type GlobalProgressEngineProps = {
  progress: number;
  status: string;
};

export default function GlobalProgressEngine({
  progress,
  status,
}: GlobalProgressEngineProps) {
  return (
    <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">

      <h3 className="text-xl font-bold text-white">
        🚀 AI Global Progress
      </h3>

      <p className="mt-3 text-gray-400">
        Overall production progress.
      </p>

      <div className="mt-6">

        <div className="mb-2 flex justify-between">

          <span className="text-gray-300">
            {status}
          </span>

          <span className="text-white font-bold">
            {progress}%
          </span>

        </div>

        <div className="h-4 overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}