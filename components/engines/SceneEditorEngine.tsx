"use client";
console.log("ENGINES EDITOR");
import { useState } from "react";

type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

type SceneEditorEngineProps = {
  scene: Scene;
  onSave: (scene: Partial<Scene>) => void;
  onClose: () => void;
};

export default function SceneEditorEngine({
  scene,
  onSave,
  onClose,
}: SceneEditorEngineProps) {
  const [visual, setVisual] = useState(scene.visual);
  const [camera, setCamera] = useState(scene.camera);
  const [voice, setVoice] = useState(scene.voice);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#111827] p-8 shadow-2xl">

        <h3 className="text-2xl font-bold text-white">
          ✏️ Scene Editor
        </h3>

        <p className="mt-2 text-gray-400">
          Edit this scene before generating assets.
        </p>

        <div className="mt-6 space-y-5">

          <div>
            <label className="mb-2 block font-semibold text-white">
              Visual
            </label>

            <textarea
              value={visual}
              onChange={(e) => setVisual(e.target.value)}
              rows={5}
              className="w-full rounded-xl bg-black/30 p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-white">
              Camera
            </label>

            <input
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              className="w-full rounded-xl bg-black/30 p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-white">
              Voice
            </label>

            <textarea
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              rows={5}
              className="w-full rounded-xl bg-black/30 p-3 text-white outline-none"
            />
          </div>

          <div className="flex gap-4">

            <button
              onClick={() =>
                onSave({
                  visual,
                  camera,
                  voice,
                })
              }
              className="rounded-xl bg-green-600 px-5 py-3 text-white transition hover:bg-green-500"
            >
              💾 Save Changes
            </button>

            <button
              onClick={onClose}
              className="rounded-xl bg-red-600 px-5 py-3 text-white transition hover:bg-red-500"
            >
              ❌ Cancel
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}