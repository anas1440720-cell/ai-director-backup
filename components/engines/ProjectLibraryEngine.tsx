"use client";

import { useEffect, useState } from "react";

type ProjectLibraryEngineProps = {
  idea: string;
  onSelectProject?: (projectName: string) => void;
};

type ProjectItem = {
  name: string;
  status: string;
  date: string;
};

export default function ProjectLibraryEngine({
  idea,
  onSelectProject,
}: ProjectLibraryEngineProps) {
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      name: idea || "Current Active Project",
      status: "In Production",
      date: "Today",
    },
    {
      name: "Ancient Mesopotamia Chronicles",
      status: "Completed",
      date: "Recent",
    },
    {
      name: "Cyberpunk Baghdad 2088",
      status: "Completed",
      date: "Saved",
    },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai_director_full_state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.idea) {
            setProjects((prev) => [
              { name: parsed.idea, status: "Saved Draft", date: "Local State" },
              ...prev.filter((p) => p.name !== parsed.idea),
            ]);
          }
        } catch {
          // fallback to defaults
        }
      }
    }
  }, []);

  return (
    <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">📁 Project Vault & Library</h3>
          <p className="mt-1 text-xs text-gray-400">
            Archive of your cinematic stories and generation sessions.
          </p>
        </div>
        <span className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
          {projects.length} Saved
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {projects.map((project, index) => {
          const isCompleted = project.status === "Completed";
          const isInProd = project.status === "In Production";

          return (
            <div
              key={index}
              onClick={() => onSelectProject?.(project.name)}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-400/40 hover:bg-black/30"
            >
              <div>
                <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {project.name}
                </h4>
                <p className="mt-0.5 text-xs text-gray-400">{project.date}</p>
              </div>

              <span
                className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                  isInProd
                    ? "border border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                    : isCompleted
                    ? "border border-green-500/30 bg-green-500/10 text-green-300"
                    : "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                }`}
              >
                {project.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}