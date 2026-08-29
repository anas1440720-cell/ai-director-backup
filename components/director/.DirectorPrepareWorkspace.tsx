"use client";

interface PrepareWorkspaceProps {
  children: React.ReactNode;
}

export default function DirectorPrepareWorkspace({
  children,
}: PrepareWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-500/30 bg-black/40 p-6 md:p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white">
          🎬 AI Director Preparation
        </h2>

        <p className="mt-1 text-xs text-gray-400">
          Review your story, characters, prompts, and production blueprint before launching asset generation.
        </p>
      </div>

      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}