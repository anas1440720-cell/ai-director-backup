"use client";

import { useState } from "react";

type LoadProjectEngineProps = {
  onLoadProject?: (projectData: any) => void;
};

export default function LoadProjectEngine({ onLoadProject }: LoadProjectEngineProps) {
  const [savedProjectName, setSavedProjectName] = useState<string | null>(null);

  const handleCheckSaved = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai_director_full_state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedProjectName(parsed.idea || "Untitled AI Project");
          if (onLoadProject) {
            onLoadProject(parsed);
          }
        } catch {
          setSavedProjectName(null);
        }
      }
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">📁 Saved Projects</h3>
          <p className="mt-1 text-xs text-gray-400">
            Restore saved progress and generated assets.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCheckSaved}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          Check Local Storage
        </button>
      </div>

      {savedProjectName && (
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs text-cyan-300">
          Last Active Project: <span className="font-semibold text-white">{savedProjectName}</span>
        </div>
      )}
    </div>
  );
}