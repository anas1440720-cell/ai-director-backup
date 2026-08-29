"use client";

import { useState } from "react";

interface ProjectManagerEngineProps {
  idea: string;
  storyData: any;
  onLoadProject?: (projectData: any) => void;
  onRenameProject?: (newName: string) => void;
  onResetProject?: () => void;
}

export default function ProjectManagerEngine({
  idea,
  storyData,
  onLoadProject,
  onRenameProject,
  onResetProject,
}: ProjectManagerEngineProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [currentIdeaName, setCurrentIdeaName] = useState(idea);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3500);
  };

  const handleSave = () => {
    if (typeof window === "undefined") return;
    const project = {
      idea: currentIdeaName || idea,
      storyData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("ai-director-project", JSON.stringify(project));
    showNotification("✅ Project saved locally!");
  };

  const handleLoad = () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("ai-director-project");
    if (!saved) {
      showNotification("⚠️ No saved project found in storage.");
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setCurrentIdeaName(parsed.idea || "Untitled AI Project");
      onLoadProject?.(parsed);
      showNotification("📂 Project loaded successfully!");
    } catch {
      showNotification("❌ Failed to parse saved project data.");
    }
  };

  const handleRename = () => {
    const newName = window.prompt("Enter new project title:", currentIdeaName || idea);
    if (newName && newName.trim()) {
      setCurrentIdeaName(newName.trim());
      onRenameProject?.(newName.trim());
      showNotification("✏️ Project renamed.");
    }
  };

  const handleDelete = () => {
    if (typeof window === "undefined") return;
    if (window.confirm("Are you sure you want to clear saved project data?")) {
      localStorage.removeItem("ai-director-project");
      onResetProject?.();
      showNotification("🗑️ Saved project deleted.");
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">🎛️ Project Manager</h3>
          <p className="mt-1 text-xs text-gray-400">
            Local session state management, backup snapshots, and restore actions.
          </p>
        </div>
        <span className="rounded-xl border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-300">
          State Active
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500"
        >
          💾 Save Snapshot
        </button>

        <button
          type="button"
          onClick={handleLoad}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500"
        >
          📂 Load Saved
        </button>

        <button
          type="button"
          onClick={handleRename}
          className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-xs font-bold text-yellow-300 transition hover:bg-yellow-500/20"
        >
          ✏️ Rename
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-500/20"
        >
          🗑️ Clear Storage
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <h4 className="text-xs font-bold text-gray-400">📊 Active Snapshot Information</h4>
        <div className="mt-3 space-y-1.5 text-xs text-gray-300">
          <p>
            <span className="font-semibold text-white">Title:</span>{" "}
            {currentIdeaName || idea || "Untitled AI Project"}
          </p>
          <p>
            <span className="font-semibold text-white">Status:</span> Production Ready
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/10 p-3 text-xs font-medium text-white">
          {message}
        </div>
      )}
    </div>
  );
}