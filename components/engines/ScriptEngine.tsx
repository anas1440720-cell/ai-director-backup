"use client";

import { useState } from "react";

type SceneScript = {
  title: string;
  voice: string;
  camera?: string;
  visual?: string;
};

type ScriptEngineProps = {
  hook?: string;
  scenes: SceneScript[];
  voiceLanguage?: "ar" | "en";
};

export default function ScriptEngine({
  hook = "Capture audience attention immediately.",
  scenes = [],
  voiceLanguage = "ar",
}: ScriptEngineProps) {
  const [copied, setCopied] = useState(false);

  const fullScript = `🎬 PRODUCTION VOICE SCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 HOOK:
${hook}

${scenes
  .map(
    (scene, idx) => `🎙️ SCENE ${idx + 1}: ${scene.title}
Narration: "${scene.voice}"
Visual Cue: ${scene.visual || "Default shot"}
`
  )
  .join("\n")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 md:p-8 backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">📜 Script & Narration Engine</h3>
          <p className="mt-1 text-xs text-gray-300">
            Synchronized voiceover script, character dialog, and delivery pacing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
            Language: {voiceLanguage === "ar" ? "Arabic (العربية)" : "English"}
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-emerald-400"
          >
            {copied ? "✅ Copied!" : "📋 Copy Script"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {/* Hook Block */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            ⚡ Hook / Opening Line
          </span>
          <p className="mt-2 text-sm font-medium leading-relaxed text-white">
            "{hook}"
          </p>
        </div>

        {/* Scene Scripts */}
        <div className="space-y-4">
          {scenes.map((scene, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-emerald-500/30"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/20 text-xs font-bold text-emerald-300">
                    {index + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {scene.title || `Scene ${index + 1}`}
                  </h4>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-400">🎙️ Spoken Narration:</p>
                <p className="mt-1 rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-gray-200">
                  "{scene.voice || "No script provided."}"
                </p>
              </div>

              {scene.visual && (
                <p className="mt-2 text-[11px] text-gray-400">
                  <span className="font-semibold text-gray-300">Visual Cue:</span> {scene.visual}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}