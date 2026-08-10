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
  scenes,
  onScenesChange,
  onEditScene,
}: SceneControlEngineProps) {
  const [regenerateScene, setRegenerateScene] = useState<number | null>(null);
const originalScenes = useState<Scene[]>(scenes)[0];
  const [editableScenes, setEditableScenes] =
    useState<Scene[]>(scenes);

  useEffect(() => {
    setEditableScenes(scenes);
  }, [scenes]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">
        🎬 Scene Control System
      </h2>

      <p className="mt-3 text-gray-400">
        Control and regenerate each scene separately.
      </p>

      <div className="mt-6 space-y-6">
        {editableScenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <h4 className="text-xl font-bold text-white">
              {scene.title}
            </h4>

            <div className="mt-4 space-y-3 text-gray-300">
              <p>
                🖼 Visual:
                <span className="ml-2 text-white">
                  {scene.visual}
                </span>
              </p>

              <p>
                🎥 Camera:
                <span className="ml-2 text-white">
                  {scene.camera}
                </span>
              </p>

              <p>
                🎙 Voice:
                <span className="ml-2 text-white">
                  {scene.voice}
                </span>
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => onEditScene(index)}
                className="rounded-xl bg-blue-500/20 px-4 py-2 text-white hover:bg-blue-500/40"
              >
                ✏️ Edit Scene
              </button>

              <button
                type="button"
                onClick={() => setRegenerateScene(index)}
                className="rounded-xl bg-orange-500/20 px-4 py-2 text-white hover:bg-orange-500/40"
              >
                🔄 Regenerate Scene
              </button>
            </div>
          </div>
        ))}
      </div>

     {regenerateScene !== null &&
  editableScenes[regenerateScene] && (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-3xl
          rounded-2xl
          border
          border-white/10
          bg-gray-900
          p-6
          shadow-2xl
        "
      >
        <SceneRegenerationEngine
          scene={editableScenes[regenerateScene]}
          onRegenerate={(newScene: Scene) => {
            const updatedScenes = editableScenes.map(
              (scene, index) =>
                index === regenerateScene
                  ? newScene
                  : scene
            );

            setEditableScenes(updatedScenes);
            onScenesChange(updatedScenes);
            setRegenerateScene(null);
          }}
        />

        <button
          type="button"
          onClick={() => setRegenerateScene(null)}
          className="
            mt-6
            rounded-xl
            border
            border-white/20
            px-5
            py-2
            text-white
            hover:bg-white/10
          "
        >
          ❌ Close
        </button>
      </div>
    </div>
  )}
    </div>
  );
}