"use client";

import { useEffect, useState } from "react";
import SceneRegenerationEngine from "./SceneRegenerationEngine";

type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

type SceneControlEngineProps = {
  scenes: Scene[];
  onScenesChange: (scenes: Scene[]) => void;
  onEditScene: (index: number) => void;
};

export default function SceneControlEngine({
  scenes = [],
  onScenesChange,
  onEditScene,
}: SceneControlEngineProps) {
  const [regenerateScene, setRegenerateScene] = useState<number | null>(null);
  const [editableScenes, setEditableScenes] = useState<Scene[]>(scenes);

  useEffect(() => {
    setEditableScenes(scenes);
  }, [scenes]);

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">🎬 Scene Control System</h2>
          <p className="mt-1 text-xs text-gray-400">
            Granular control to edit, modify, or regenerate individual story scenes.
          </p>
        </div>
        <span className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-gray-300">
          {editableScenes.length} Scenes
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {editableScenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/20 text-xs font-bold text-cyan-300">
                  {index + 1}
                </span>
                <h4 className="font-bold text-white">{scene.title || `Scene ${index + 1}`}</h4>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs text-gray-300">
              <p>
                <span className="font-semibold text-cyan-300">🖼 Visual:</span>{" "}
                {scene.visual}
              </p>
              <p>
                <span className="font-semibold text-purple-300">🎥 Camera:</span>{" "}
                {scene.camera}
              </p>
              <p>
                <span className="font-semibold text-emerald-300">🎙 Voice:</span>{" "}
                {scene.voice}
              </p>
            </div>

            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => onEditScene(index)}
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/20"
              >
                ✏️ Edit Scene
              </button>

              <button
                type="button"
                onClick={() => setRegenerateScene(index)}
                className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-3.5 py-2 text-xs font-bold text-orange-300 transition hover:bg-orange-500/20"
              >
                🔄 Regenerate Scene
              </button>
            </div>
          </div>
        ))}
      </div>

      {regenerateScene !== null && editableScenes[regenerateScene] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <SceneRegenerationEngine
              scene={editableScenes[regenerateScene]}
              onRegenerate={(newScene: Scene) => {
                const updatedScenes = editableScenes.map((scene, index) =>
                  index === regenerateScene ? newScene : scene
                );

                setEditableScenes(updatedScenes);
                onScenesChange(updatedScenes);
                setRegenerateScene(null);
              }}
            />

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setRegenerateScene(null)}
                className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
              >
                ❌ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}