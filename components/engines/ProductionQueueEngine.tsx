"use client";

import { useEffect, useState } from "react";
import { QueueJob } from "@/lib/productionQueue";
import {
  runProductionQueue,
  ProductionJob,
} from "@/lib/productionRunner";

type ProductionQueueEngineProps = {
  jobs: QueueJob[];
};

export default function ProductionQueueEngine({
  jobs = [],
}: ProductionQueueEngineProps) {
  const [queue, setQueue] = useState<ProductionJob[]>([]);

  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    
    const converted: ProductionJob[] = jobs.map((job) => ({
      id: job.id,
      name: job.name,
      status: "WAITING",
    }));

    setQueue(converted);
    runProductionQueue(converted, setQueue);
  }, [jobs]);

  return (
    <div className="mt-8 rounded-3xl border border-blue-500/30 bg-blue-500/10 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">⚙️ Production Task Queue</h3>
          <p className="mt-1 text-xs text-gray-400">
            Autonomous pipeline execution queue and worker status.
          </p>
        </div>
        <span className="rounded-xl border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-300">
          {queue.length} Tasks
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {queue.length === 0 ? (
          <p className="text-sm text-gray-500">No tasks currently queued.</p>
        ) : (
          queue.map((job) => {
            const isWaiting = job.status === "WAITING";
            const isProcessing = job.status === "PROCESSING";

            return (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-blue-500/30"
              >
                <span className="text-sm font-semibold text-white">
                  {job.name}
                </span>

                <span
                  className={`rounded-xl px-3 py-1 text-xs font-bold ${
                    isWaiting
                      ? "border border-gray-500/30 bg-gray-500/10 text-gray-300"
                      : isProcessing
                      ? "border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 animate-pulse"
                      : "border border-green-500/30 bg-green-500/10 text-green-300"
                  }`}
                >
                  {isWaiting ? "⏳ WAITING" : isProcessing ? "⚡ PROCESSING" : "✅ COMPLETED"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}