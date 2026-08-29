"use client";

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
  const [title, setTitle] = useState(scene.title || "");
  const [visual, setVisual] = useState(scene.visual || "");
  const [camera, setCamera] = useState(scene.camera || "");
  const [voice, setVoice] = useState(scene.voice || "");

  const handleSave = () => {
    onSave({
      title,
      visual,
      camera,
      voice,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">✏️ Scene Production Editor</h3>
            <p className="mt-1 text-xs text-gray-400">
              Customize visual prompts, camera dynamics, and narration script.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-300">
              Scene Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. Scene 1 - Dramatic Introduction"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-300">
              Visual Composition & Prompt
            </label>
            <textarea
              value={visual}
              onChange={(e) => setVisual(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs leading-relaxed text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Describe scene visual elements and atmosphere..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-300">
              Camera Motion & Lens Direction
            </label>
            <input
              type="text"
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              placeholder="e.g. Slow push-in cinematic camera, wide angle, 35mm lens"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-300">
              Voiceover Script
            </label>
            <textarea
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs leading-relaxed text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Enter spoken narration for this scene..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-gray-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-black transition hover:bg-cyan-400"
            >
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}