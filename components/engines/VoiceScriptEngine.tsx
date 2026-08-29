"use client";

import { useState } from "react";

type VoiceScriptEngineProps = {
  scenes: {
    title: string;
    visual: string;
    camera: string;
    voice: string;
  }[];
};

export default function VoiceScriptEngine({
  scenes = [],
}: VoiceScriptEngineProps) {
  const [copied, setCopied] = useState(false);

  const fullNarration = scenes
    .map((s, i) => `[Scene ${i + 1}: ${s.title || `Scene ${i + 1}`}]\n"${s.voice}"`)
    .join("\n\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullNarration);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6 md:p-8 backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-bold text-white">🎙️ Voice Script Narration Engine</h3>
          <p className="mt-1 text-xs text-gray-300">
            Chronological narration transcript ready for voice recording or AI synthesis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-bold text-yellow-300">
            {scenes.length} Dialogue Blocks
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl bg-yellow-500 px-4 py-1.5 text-xs font-bold text-black transition hover:bg-yellow-400"
          >
            {copied ? "✅ Copied" : "📋 Copy All Scripts"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-yellow-500/30"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-400/20 text-xs font-bold text-yellow-300">
                {index + 1}
              </span>
              <h4 className="text-sm font-bold text-white">
                {scene.title || `Scene ${index + 1}`}
              </h4>
            </div>

            <div className="mt-3">
              <p className="rounded-xl bg-black/40 p-4 text-xs font-medium leading-relaxed text-yellow-100/90">
                "{scene.voice || "No narration scripted for this cut."}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}