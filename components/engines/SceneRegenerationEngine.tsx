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
        setError(data.message || "Scene regeneration failed.");
        return;
      }

      onRegenerate(data.scene);
    } catch (err) {
      console.error("Scene regeneration error:", err);
      setError("Unable to regenerate scene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
      <h3 className="text-xl font-bold text-white">
        🔄 Scene Regeneration Engine
      </h3>

      <p className="mt-1 text-xs text-gray-300">
        AI will rewrite and reframe this specific scene while preserving overall narrative continuity.
      </p>

      <div className="mt-5 space-y-2 rounded-xl bg-black/40 p-4 text-xs text-gray-200">
        <p>
          <span className="font-bold text-white">🎬 Scene:</span> {scene.title}
        </p>
        <p>
          <span className="font-bold text-cyan-300">🖼 Visual:</span> {scene.visual}
        </p>
        <p>
          <span className="font-bold text-purple-300">🎥 Camera:</span> {scene.camera}
        </p>
        <p>
          <span className="font-bold text-emerald-300">🎙 Voice:</span> {scene.voice}
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          ❌ {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={handleRegenerate}
          className="rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "⏳ Synthesizing New Scene Blueprint..." : "🚀 Regenerate This Scene"}
        </button>
      </div>
    </div>
  );
}