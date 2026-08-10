"use client";

type ProductionLogEngineProps = {
  logs: string[];
};

export default function ProductionLogEngine({
  logs,
}: ProductionLogEngineProps) {
  return (
    <div className="mt-8 rounded-2xl border border-slate-500/30 bg-slate-900/60 p-6">
      <h3 className="text-2xl font-bold text-white">
        📜 Production Log
      </h3>

      <p className="mt-3 text-gray-400">
        Live production events.
      </p>

      <div className="mt-6 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-4">
        {logs.length === 0 ? (
          <p className="text-gray-500">
            No production events yet.
          </p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="mb-2 border-b border-white/5 pb-2 text-sm text-green-300"
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}