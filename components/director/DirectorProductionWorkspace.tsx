"use client";

interface ProductionWorkspaceProps {
  children: React.ReactNode;
  progress: number;
}

export default function DirectorProductionWorkspace({
  children,
  progress,
}: ProductionWorkspaceProps) {
  return (
    <div className="space-y-6">

      <div className="rounded-2xl border border-yellow-500/20 bg-white/5 p-6">

        <h2 className="text-2xl font-bold text-white">
          🚀 AI Production
        </h2>

        <p className="mt-2 text-gray-400">
          Your AI Director is generating the complete cinematic production.
        </p>

        <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full bg-cyan-500 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <p className="mt-3 font-semibold text-cyan-400">
          {progress}% Completed
        </p>

      </div>

      <div className="space-y-6">
        {children}
      </div>

    </div>
  );
}