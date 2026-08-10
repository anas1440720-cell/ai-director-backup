"use client";

type AIJobQueueEngineProps = {
  progress: number;
};

export default function AIJobQueueEngine({
  progress,
}: AIJobQueueEngineProps) {

  const jobs = [
    { title: "Creating Story", done: progress >= 15 },
    { title: "Generating Characters", done: progress >= 30 },
    { title: "Generating Images", done: progress >= 50 },
    { title: "Generating Videos", done: progress >= 70 },
    { title: "Generating Voice", done: progress >= 85 },
    { title: "Generating Music", done: progress >= 100 },
  ];

  return (
    <div className="mt-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">

      <h3 className="text-2xl font-bold text-white">
        🧠 AI Job Queue
      </h3>

      <p className="mt-3 text-gray-400">
        Live AI production tasks.
      </p>

      <div className="mt-6 space-y-4">

        {jobs.map((job, index) => (

          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
          >

            <span className="text-white">
              {job.title}
            </span>

            <span
              className={
                job.done
                  ? "text-green-400 font-bold"
                  : "text-yellow-300"
              }
            >
              {job.done ? "✅ Completed" : "⏳ Waiting"}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}