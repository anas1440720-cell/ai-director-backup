"use client";

import { useState } from "react";

type DashboardProps = {
  idea: string;
  videoType: string;
  audience: string;
  goal: string;
  character: string;
  style: string;
  duration?: string;
  appStage?: "prepare" | "production" | "editing";
  onGenerate?: () => void;
};

export default function Dashboard({
  idea,
  videoType,
  audience,
  goal,
  character,
  style,
  duration,
  onGenerate,
}: DashboardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <div className="mt-10 space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-3xl font-bold text-white">🎬 Director Dashboard</h2>
        <p className="mt-2 text-gray-400">
          Complete overview of your AI production parameters.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <InfoCard title="Idea" value={idea} />
          <InfoCard title="Video Type" value={videoType} />
          <InfoCard title="Audience" value={audience} />
          <InfoCard title="Goal" value={goal} />
          <InfoCard title="Characters" value={character} />
          <InfoCard title="Visual Style" value={style} />
          {duration && (
            <InfoCard
              title="Video Duration"
              value={
                Number(duration) >= 60
                  ? `${Number(duration) / 60} Minutes (${duration}s)`
                  : `${duration} Seconds`
              }
            />
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={handleClick}
        disabled={isGenerating}
        className={`w-full rounded-2xl p-5 text-center text-lg font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-3 ${
          isGenerating
            ? "bg-blue-800/60 cursor-not-allowed opacity-80"
            : "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:scale-[1.01] hover:shadow-cyan-500/25 active:scale-[0.98] cursor-pointer"
        }`}
      >
        {isGenerating ? (
          <>
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Generating Video...</span>
          </>
        ) : (
          <span>✨ Generate Video</span>
        )}
      </button>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="mt-2 font-semibold text-white">{value || "—"}</p>
    </div>
  );
}