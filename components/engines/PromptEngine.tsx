"use client";

import { useState } from "react";

type PromptEngineProps = {
  idea: string;
  style: string;
  goal: string;
  character: string;
  story?: {
    hook: string;
    scenes: {
      title: string;
      visual: string;
      camera: string;
      voice: string;
    }[];
  };
};

export default function PromptEngine({
  idea,
  style,
  goal,
  character,
  story,
}: PromptEngineProps) {
  const [copied, setCopied] = useState(false);

  const scenesText =
    story?.scenes
      ?.map(
        (scene, idx) => `
Scene ${idx + 1}: ${scene.title}
Visual: ${scene.visual}
Camera: ${scene.camera}
Voice: ${scene.voice}
`
      )
      .join("\n") || "Generate cinematic multi-scene progression.";

  const prompt = `🎬 MASTER AI VIDEO DIRECTIVE

💡 CORE STORY CONCEPT:
${idea || "Untitled Narrative"}

🎨 VISUAL & AESTHETIC DIRECTIVE:
${style || "Cinematic"} style, high dynamic range, volumetric lighting, photorealistic depth of field.

🎯 NARRATIVE GOAL:
${goal || "Engaging storytelling"}

👤 CHARACTER CONSISTENCY DIRECTIVE:
${character || "Dynamic cinematic protagonist"}

📖 SCENE PROGRESSION & STORYBOARD:
Hook: ${story?.hook || "High-impact narrative hook opening"}
${scenesText}

🎵 SOUNDTRACK & SCORE:
Adaptive orchestration matching emotional beats and scene transitions.

🎙️ NARRATION & VOICE DIRECTIVE:
Studio-grade vocal delivery with natural emotional cadence synchronized with visual cues.

✨ RENDER SPECIFICATION:
Hyper-detailed keyframes, fluid camera motion, 4k cinematic grading.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-blue-500/30 bg-blue-500/10 p-6 backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-bold text-white">🧠 Master Prompt Engine</h3>
          <p className="mt-1 text-xs text-gray-400">
            Synthesized master production directive for external AI generators.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="w-fit rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
        >
          {copied ? "✅ Copied!" : "📋 Copy Master Prompt"}
        </button>
      </div>

      <div className="mt-5 max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-5 font-mono text-xs leading-relaxed text-gray-200 whitespace-pre-line scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {prompt}
      </div>
    </div>
  );
}