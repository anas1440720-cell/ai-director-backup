"use client";

type ProductionLogEngineProps = {
  logs: string[];
};

export default function ProductionLogEngine({
  logs = [],
}: ProductionLogEngineProps) {
  return (
    <div className="mt-8 rounded-3xl border border-slate-500/30 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">📜 Production Console Log</h3>
          <p className="mt-1 text-xs text-gray-400">
            Real-time streaming pipeline diagnostics and runtime events.
          </p>
        </div>
        <span className="rounded-xl border border-slate-400/20 bg-slate-800/80 px-3 py-1 text-xs font-mono text-slate-300">
          {logs.length} Events
        </span>
      </div>

      <div className="mt-5 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {logs.length === 0 ? (
          <p className="text-gray-500">No production events recorded yet.</p>
        ) : (
          logs.map((log, index) => {
            const isError = log.includes("❌") || log.toLowerCase().includes("error") || log.toLowerCase().includes("failed");
            const isSuccess = log.includes("✅") || log.includes("✓") || log.toLowerCase().includes("success");
            const isWarning = log.includes("⚠️") || log.includes("⏳");

            return (
              <div
                key={index}
                className={`border-b border-white/5 py-1.5 transition-colors ${
                  isError
                    ? "text-red-400"
                    : isSuccess
                    ? "text-emerald-400"
                    : isWarning
                    ? "text-yellow-300"
                    : "text-gray-300"
                }`}
              >
                <span className="mr-2 select-none text-gray-600">[{index + 1}]</span>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}