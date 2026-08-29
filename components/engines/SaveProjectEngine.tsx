"use client";

import { useState } from "react";

interface SaveProjectEngineProps {
  idea: string;
  storyData: any;
}

export default function SaveProjectEngine({
  idea,
  storyData,
}: SaveProjectEngineProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleSave = () => {
    if (typeof window === "undefined") return;

    const project = {
      idea: idea || "Untitled Project",
      storyData,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("ai-director-project", JSON.stringify(project));
    
    const timeStr = new Date().toLocaleTimeString();
    setLastSaved(timeStr);
    setMessage(`✅ Project saved locally at ${timeStr}`);
    
    setTimeout(() => setMessage(null), 3500);
  };

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">💾 Quick Save Engine</h3>
          <p className="mt-1 text-xs text-gray-400">
            Export current generation state and storyboard to persistent local cache.
          </p>
        </div>
        {lastSaved && (
          <span className="rounded-xl border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-bold text-green-300">
            Last saved: {lastSaved}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500"
        >
          💾 Save Current Snapshot
        </button>

        {message && (
          <p className="text-xs font-semibold text-green-400 animate-fade-in">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}