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
  jobs,
}: ProductionQueueEngineProps) {
  const [queue, setQueue] = useState<ProductionJob[]>([]);

  useEffect(() => {
    const converted: ProductionJob[] = jobs.map((job) => ({
      id: job.id,
      name: job.name,
      status: "WAITING",
    }));

    setQueue(converted);

    runProductionQueue(converted, setQueue);
  }, [jobs]);

  return (
    <div>

      <h2 className="text-2xl font-bold text-white">
        ⚙️ Production Queue
      </h2>

      <p className="mt-2 text-gray-400">
        AI production pipeline status.
      </p>

      <div className="mt-6 space-y-4">
        {queue.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between rounded-xl bg-black/30 p-4"
          >
            <span className="font-semibold text-white">
              {job.name}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                job.status === "WAITING"
                  ? "bg-gray-600 text-white"
                  : job.status === "PROCESSING"
                  ? "bg-yellow-500 text-black"
                  : "bg-green-600 text-white"
              }`}
            >
              {job.status}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}