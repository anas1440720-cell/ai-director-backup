"use client";

interface ProductionFlowEngineProps {
  progress: number;
}

const stages = [
  { id: 0, title: "🧠 Story Director", description: "Crafting structured narrative blueprint..." },
  { id: 1, title: "🎭 Character Designer", description: "Locking identity and appearance consistency..." },
  { id: 2, title: "📸 Cinematographer", description: "Planning camera movements, angles & lighting..." },
  { id: 3, title: "🎙 Voice Director", description: "Synthesizing character voiceovers & narration..." },
  { id: 4, title: "🎵 Music Composer", description: "Composing dynamic soundtrack & Foley effects..." },
  { id: 5, title: "🖼 Image Director", description: "Rendering master scene keyframes..." },
  { id: 6, title: "🎥 Video Director", description: "Synthesizing cinematic motion & animation..." },
  { id: 7, title: "🎬 Final Assembly", description: "Rendering final video deliverable..." },
];

export default function ProductionFlowEngine({ progress }: ProductionFlowEngineProps) {
  const currentStage = Math.min(
    Math.floor(progress / (100 / stages.length)),
    stages.length - 1
  );

  return (
    <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-white/5 p-6 md:p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">🎬 AI Production Live Stream</h2>
          <p className="mt-1 text-xs text-gray-400">Autonomous workflow orchestration.</p>
        </div>
        <span className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
          Stage {currentStage + 1} of {stages.length}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {stages.map((stage, index) => {
          const active = index === currentStage && progress < 100;
          const finished = index < currentStage || progress >= 100;
          const pending = index > currentStage;

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border p-5 transition-all duration-300 ${
                active
                  ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                  : finished
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-white/5 bg-white/5 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">{stage.title}</h3>
                <span className="text-xs font-semibold">
                  {finished ? (
                    <span className="text-green-400">✅ Completed</span>
                  ) : active ? (
                    <span className="animate-pulse text-cyan-300">⚡ Working...</span>
                  ) : (
                    <span className="text-gray-500">⏳ Queued</span>
                  )}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-300">{stage.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}