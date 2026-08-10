"use client";

import { useState } from "react";

type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

type SceneRegenerationProps = {
  scene: Scene;
  onRegenerate: (scene: Scene) => void;
};

export default function SceneRegenerationEngine({
  scene,
  onRegenerate,
}: SceneRegenerationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegenerate = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/regenerate-scene", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scene,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.scene) {
        console.error("Scene regeneration failed:", data);
        setError(data.message || "Scene regeneration failed.");
        return;
      }

      onRegenerate(data.scene);
    } catch (error) {
      console.error("Scene regeneration error:", error);
      setError("Unable to regenerate scene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
      <h3 className="text-xl font-bold text-white">
        🔄 Scene Regeneration Engine
      </h3>

      <p className="mt-3 text-gray-300">
        AI will regenerate this scene only.
      </p>

      <div className="mt-6 space-y-3 text-gray-200">
        <p>
          🎬 <span className="font-bold">Scene:</span>{" "}
          {scene.title}
        </p>

        <p>
          🖼 <span className="font-bold">Visual:</span>{" "}
          {scene.visual}
        </p>

        <p>
          🎥 <span className="font-bold">Camera:</span>{" "}
          {scene.camera}
        </p>

        <p>
          🎙 <span className="font-bold">Voice:</span>{" "}
          {scene.voice}
        </p>
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
          ❌ {error}
        </p>
      )}

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          disabled={loading}
          onClick={handleRegenerate}
          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "⏳ Regenerating..."
            : "🚀 Regenerate This Scene"}
        </button>
      </div>
    </div>
  );
}