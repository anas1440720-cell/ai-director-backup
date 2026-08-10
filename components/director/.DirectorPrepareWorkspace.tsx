"use client";

interface PrepareWorkspaceProps {
  children: React.ReactNode;
}

export default function DirectorPrepareWorkspace({
  children,
}: PrepareWorkspaceProps) {
  return (
    <div className="space-y-6">

      <div className="rounded-2xl border border-cyan-500/20 bg-white/5 p-6">
        <h2 className="text-2xl font-bold text-white">
          🎬 AI Director Preparation
        </h2>

        <p className="mt-2 text-gray-400">
          Review your story, characters, prompts and production plan before generating the final video.
        </p>
      </div>

      {children}

    </div>
  );
}