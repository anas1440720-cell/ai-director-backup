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
      <div className="rounded-3xl border border-yellow-500/30 bg-black/40 p-6 md:p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white">🚀 AI Production Pipeline</h2>
        <p className="mt-1 text-xs text-gray-400">
          Your AI Director is synthesizing the complete cinematic production assets.
        </p>

        <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-bold text-cyan-400">Synthesis Progress</span>
          <span className="font-extrabold text-white">{progress}%</span>
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}