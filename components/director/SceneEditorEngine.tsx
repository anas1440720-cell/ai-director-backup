"use client";

import { useState } from "react";

type Scene = {
  title?: string;
  visual: string;
  camera: string;
  voice: string;
};

type SceneEditorProps = {
  scene: Scene;
  onSave: (updatedScene: Partial<Scene>) => void;
  onClose: () => void;
  onRegenerate?: (scene: Scene) => void;
};

export default function SceneEditorEngine({
  scene,
  onSave,
  onClose,
  onRegenerate,
}: SceneEditorProps) {
  const [visual, setVisual] = useState(scene.visual);
  const [camera, setCamera] = useState(scene.camera);
  const [voice, setVoice] = useState(scene.voice);

  const handleSave = () => {
    onSave({
      visual,
      camera,
      voice,
    });
  };

  const handleRegenerate = () => {
    const cleanVisual = visual
      .split(". Reimagined as a ")[0]
      .trim();

    onRegenerate?.({
      ...scene,
      visual: cleanVisual,
      camera,
      voice,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            🎬 Scene Editor
          </h2>

          <p className="mt-2 text-gray-300">
            Edit your cinematic scene before regeneration.
          </p>
        </div>

        {scene.title && (
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
            {scene.title}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-300">
            🎥 Visual
          </label>

          <textarea
            value={visual}
            onChange={(event) => setVisual(event.target.value)}
            rows={5}
            className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-cyan-400/50"
            placeholder="Describe the visual appearance of the scene..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-300">
            📸 Camera
          </label>

          <textarea
            value={camera}
            onChange={(event) => setCamera(event.target.value)}
            rows={3}
            className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-cyan-400/50"
            placeholder="Describe the camera movement and shot..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-300">
            🎙 Voice
          </label>

          <textarea
            value={voice}
            onChange={(event) => setVoice(event.target.value)}
            rows={5}
            className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:border-cyan-400/50"
            placeholder="Enter the voice script for this scene..."
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
        >
          💾 Save Scene
        </button>

        <button
          type="button"
          onClick={handleRegenerate}
          className="rounded-xl bg-purple-500 px-6 py-3 font-bold text-white transition hover:bg-purple-400"
        >
          🔄 Regenerate Scene
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/20 px-6 py-3 text-white transition hover:bg-white/10"
        >
          ❌ Close
        </button>
      </div>
    </div>
  );
}