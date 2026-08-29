"use client";

import React, { useState, useEffect } from "react";

export type Project = {
  id: string;
  title: string;
  date: string;
  videoUrl: string;
  style: string;
};

export interface ProjectsArchiveProps {
  onNewProject?: () => void;
}

export default function ProjectsArchive({ onNewProject }: ProjectsArchiveProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ai_director_projects_archive");
        localStorage.removeItem("ai_director_archive");
      } catch (_) {}
    }
  }, []);

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAll = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ai_director_projects_archive");
      localStorage.removeItem("ai_director_archive");
    }
    setProjects([]);
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📁 Studio Projects Archive
          </h2>
          <p className="text-xs text-gray-400">
            Access, watch, or download all your previously rendered cinematic masterpieces.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onNewProject && (
            <button
              onClick={onNewProject}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white rounded-xl shadow-lg transition"
            >
              ✨ New Project
            </button>
          )}
          {projects.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-xs font-bold text-white rounded-xl shadow-lg transition"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-12 text-center">
          <div className="text-4xl mb-3">🎬</div>
          <h3 className="text-base font-bold text-white">No Saved Projects</h3>
          <p className="text-xs text-gray-400 mt-1">
            Render your final videos in the Editing studio to see them archived here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 transition-all hover:border-white/20"
            >
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black mb-3">
                {project.videoUrl ? (
                  <video
                    src={project.videoUrl}
                    controls
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500 text-xs">
                    Video unavailable
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                <span className="text-cyan-400">{project.style || "Cinematic"}</span>
                <span className="text-gray-500">{project.date}</span>
              </div>
              <h4 className="mt-1 text-sm font-semibold text-white truncate">
                {project.title}
              </h4>
              <div className="mt-4 flex items-center gap-2">
                {project.videoUrl && (
                  <a
                    href={project.videoUrl}
                    download
                    className="flex-1 text-center py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    💾 Download MP4
                  </a>
                )}
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 rounded-lg text-xs font-bold transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}