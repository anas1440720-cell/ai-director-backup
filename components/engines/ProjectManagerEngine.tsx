"use client";

import { useState } from "react";

interface ProjectManagerEngineProps {
  idea: string;
  storyData: any;
}

export default function ProjectManagerEngine({
  idea,
  storyData,
}: ProjectManagerEngineProps) {
  const [message, setMessage] = useState("");

  const handleSave = () => {
    const project = {
      idea,
      storyData,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "ai-director-project",
      JSON.stringify(project)
    );

    setMessage("✅ Project saved successfully!");
  };

  return (
    <div className="mt-8 rounded-2xl border border-gray-700 bg-gray-900 p-6">
      <h2 className="text-2xl font-bold mb-6">
        🎛️ Project Manager
      </h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          id="save-project-btn"
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 transition"
        >
          💾 Save
        </button>

        <button
          id="load-project-btn"
          className="rounded-lg bg-green-600 px-5 py-3 font-semibold hover:bg-green-700 transition"
        >
          📂 Load
        </button>

        <button
          id="rename-project-btn"
          className="rounded-lg bg-yellow-600 px-5 py-3 font-semibold hover:bg-yellow-700 transition"
        >
          ✏️ Rename
        </button>

        <button
          id="delete-project-btn"
          className="rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 transition"
        >
          🗑 Delete
        </button>
      </div>

      <div className="rounded-xl bg-gray-800 p-4">
        <h3 className="font-semibold mb-3">
          📊 Current Project
        </h3>

        <p>
          <strong>Idea:</strong>{" "}
          {idea || "No project loaded"}
        </p>

        <p className="mt-2">
          <strong>Status:</strong> Ready
        </p>

        <p className="mt-2">
          <strong>Last Save:</strong>{" "}
          {message ? "Saved" : "Not Saved"}
        </p>
      </div>

      {message && (
        <p className="mt-4 text-green-400 font-medium">
          {message}
        </p>
      )}
    </div>
  );
}