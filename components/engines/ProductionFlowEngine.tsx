"use client";

interface ProductionFlowEngineProps {
  progress: number;
}

const stages = [
  {
    id: 0,
    title: "🧠 Story Director",
    description: "Creating cinematic story...",
  },
  {
    id: 1,
    title: "🎭 Character Designer",
    description: "Designing consistent characters...",
  },
  {
    id: 2,
    title: "📸 Cinematographer",
    description: "Planning shots and camera...",
  },
  {
    id: 3,
    title: "🎙 Voice Director",
    description: "Generating voices...",
  },
  {
    id: 4,
    title: "🎵 Music Composer",
    description: "Creating soundtrack...",
  },
  {
    id: 5,
    title: "🖼 Image Director",
    description: "Generating images...",
  },
  {
    id: 6,
    title: "🎥 Video Director",
    description: "Creating video...",
  },
  {
    id: 7,
    title: "🎬 Final Render",
    description: "Finalizing production...",
  },
];

export default function ProductionFlowEngine({
  progress,
}: ProductionFlowEngineProps) {

  const currentStage = Math.min(
    Math.floor(progress / 13),
    stages.length - 1
  );

  return (
    <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-white/5 p-8">

      <h2 className="text-3xl font-bold text-white mb-8">
        🎬 AI Production
      </h2>

      {stages.map((stage, index) => {

        if (index > currentStage) return null;

        const active = index === currentStage;
        const finished = index < currentStage;

        return (
          <div
            key={stage.id}
            className={`mb-6 rounded-2xl border p-6 transition-all ${
              active
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-green-500/30 bg-green-500/10"
            }`}
          >
            <h3 className="text-xl font-bold text-white">
              {stage.title}
            </h3>

            <p className="mt-2 text-gray-300">
              {stage.description}
            </p>

            {active && (
              <p className="mt-4 text-cyan-300 animate-pulse">
                Working...
              </p>
            )}

            {finished && (
              <p className="mt-4 text-green-400">
                ✅ Completed
              </p>
            )}

          </div>
        );

      })}

    </div>
  );
}