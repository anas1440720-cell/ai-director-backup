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
    onSave({ visual, camera, voice });
    onClose();
  };

  const handleRegenerate = () => {
    const cleanVisual = visual.split(". Reimagined as a ")[0].trim();
    onRegenerate?.({ ...scene, visual: cleanVisual, camera, voice });
    onClose();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-2xl">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">🎬 Scene Editor</h2>
          <p className="mt-1 text-xs text-gray-400">Fine-tune narrative, visual, and camera parameters.</p>
        </div>
        {scene.title && (
          <span className="w-fit rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
            {scene.title}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {[
          { label: "🎥 Visual Prompting", val: visual, set: setVisual, rows: 4 },
          { label: "📸 Camera Directives", val: camera, set: setCamera, rows: 2 },
          { label: "🎙️ Voiceover Script", val: voice, set: setVoice, rows: 4 },
        ].map((field, i) => (
          <div key={i}>
            <label className="mb-2 block text-xs font-bold text-gray-400">{field.label}</label>
            <textarea
              value={field.val}
              onChange={(e) => field.set(e.target.value)}
              rows={field.rows}
              className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-gray-200 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          className="rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-black transition hover:bg-cyan-400"
        >
          💾 Save Changes
        </button>
        <button
          onClick={handleRegenerate}
          className="rounded-xl bg-purple-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-purple-500"
        >
          🔄 Regenerate Scene
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border border-white/10 px-6 py-3 text-xs font-bold text-white transition hover:bg-white/5"
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}