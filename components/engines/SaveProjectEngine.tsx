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
      <h2 className="text-2xl font-bold mb-4">
        💾 Save Project
      </h2>

      <button
        onClick={handleSave}
        className="rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 font-semibold transition"
      >
        Save Project
      </button>

      {message && (
        <p className="mt-4 text-green-400">
          {message}
        </p>
      )}
    </div>
  );
}