"use client";

type DashboardProps = {
  idea: string;
  videoType: string;
  audience: string;
  goal: string;
  character: string;
  style: string;
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
  onGenerate,
}: DashboardProps) {

  return (
    <div className="mt-10 space-y-8">

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">

        <h2 className="text-3xl font-bold text-white">
          🎬 Director Dashboard
        </h2>

        <p className="mt-2 text-gray-400">
          Complete overview of your AI production.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">

          <InfoCard title="Idea" value={idea} />
          <InfoCard title="Video Type" value={videoType} />
          <InfoCard title="Audience" value={audience} />
          <InfoCard title="Goal" value={goal} />
          <InfoCard title="Characters" value={character} />
          <InfoCard title="Visual Style" value={style} />

        </div>

      </section>


      <button
        onClick={onGenerate}
        className="rounded-2xl bg-blue-500/20 border border-blue-500/30 p-6 text-white"
      >
        🎬 Generate Video
      </button>


    </div>
  );
}


function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (
    <div className="rounded-2xl bg-white/5 p-5 border border-white/10">

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-white">
        {value}
      </p>

    </div>
  );
}