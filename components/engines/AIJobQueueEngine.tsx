"use client";

type AIJobQueueEngineProps = {
  progress: number;
};

export default function AIJobQueueEngine({ progress }: AIJobQueueEngineProps) {
  const jobs = [
    { title: "Creating Structured Story", min: 0, max: 20, done: progress >= 20 },
    { title: "Character & Visual Consistency", min: 20, max: 35, done: progress >= 35 },
    { title: "Generating Scene Images", min: 35, max: 55, done: progress >= 55 },
    { title: "Generating Video Motion", min: 55, max: 75, done: progress >= 75 },
    { title: "Synthesizing Voiceovers & SFX", min: 75, max: 90, done: progress >= 90 },
    { title: "Final Editing & Assembly", min: 90, max: 100, done: progress >= 100 },
  ];

  return (
    <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">⚙️ AI Production Pipeline</h3>
          <p className="mt-1 text-sm text-gray-400">Real-time asset orchestration queue.</p>
        </div>
        <span className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-bold text-cyan-300">
          {progress}%
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {jobs.map((job, index) => {
          const inProgress = progress >= job.min && progress < job.max;

          return (
            <div
              key={index}
              className={`flex items-center justify-between rounded-xl border p-4 transition ${
                job.done
                  ? "border-green-500/30 bg-green-500/10"
                  : inProgress
                  ? "border-cyan-500/40 bg-cyan-500/10 shadow-sm shadow-cyan-500/20"
                  : "border-white/5 bg-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-xs font-bold text-gray-300">
                  {index + 1}
                </span>
                <span className="font-medium text-white">{job.title}</span>
              </div>

              <span
                className={`text-xs font-bold ${
                  job.done
                    ? "text-green-400"
                    : inProgress
                    ? "animate-pulse text-cyan-300"
                    : "text-gray-500"
                }`}
              >
                {job.done ? "✅ Completed" : inProgress ? "⚡ Processing..." : "⏳ Queued"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}