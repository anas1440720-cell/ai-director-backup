"use client";

import { useState } from "react";

type VoiceEngineProps = {
  audience: string;
  style: string;
  script?: string;
  onVoiceGenerated?: (audioUrl: string) => void;
};

export default function VoiceEngine({
  audience,
  style,
  script = "",
  onVoiceGenerated,
}: VoiceEngineProps) {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");

  const getVoice = () => {
    if (audience === "Kids") {
      return {
        voice: "Warm friendly child storyteller",
        tone: "Happy and playful",
        speed: "Medium storytelling speed",
      };
    }

    if (audience === "Adults") {
      return {
        voice: "Deep cinematic narrator",
        tone: "Professional and emotional",
        speed: "Slow dramatic narration",
      };
    }

    if (style === "Anime") {
      return {
        voice: "Anime cinematic character voice",
        tone: "Powerful emotional performance",
        speed: "Dynamic expressions",
      };
    }

    if (style === "Fantasy") {
      return {
        voice: "Epic fantasy narrator",
        tone: "Mysterious and legendary",
        speed: "Dramatic cinematic pacing",
      };
    }

    return {
      voice: "Professional AI narrator",
      tone: "Cinematic storytelling",
      speed: "Balanced narration",
    };
  };

  const voice = getVoice();

  const generateVoice = async () => {
    if (!script.trim() || loading) return;

    setLoading(true);
    setError("");
    setAudioUrl("");

    try {
      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || result.message || "Voice generation failed."
        );
      }

      let finalUrl = "";

      if (result.audioUrl) {
        finalUrl = result.audioUrl;
      } else if (result.audio) {
        if (result.audio.startsWith("data:") || result.audio.startsWith("http")) {
          finalUrl = result.audio;
        } else {
          const mimeType = result.mimeType || "audio/mp3";
          finalUrl = `data:${mimeType};base64,${result.audio}`;
        }
      } else {
        throw new Error("Voice was generated but no audio data was returned.");
      }

      setAudioUrl(finalUrl);
      onVoiceGenerated?.(finalUrl);
    } catch (err) {
      console.error("Voice generation failed:", err);
      setError(
        err instanceof Error ? err.message : "Voice generation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 md:p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">🎙️ Voiceover Engine</h3>
          <p className="mt-1 text-xs text-gray-300">
            Synthesizes studio-grade narration calibrated for tone, pacing, and target demographic.
          </p>
        </div>
        <span className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
          Target: {audience}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
        <div className="rounded-xl bg-black/20 p-3">
          <span className="font-semibold text-emerald-300">🗣️ Profile:</span>
          <p className="mt-0.5 text-white">{voice.voice}</p>
        </div>
        <div className="rounded-xl bg-black/20 p-3">
          <span className="font-semibold text-cyan-300">🎭 Delivery Tone:</span>
          <p className="mt-0.5 text-white">{voice.tone}</p>
        </div>
        <div className="rounded-xl bg-black/20 p-3">
          <span className="font-semibold text-yellow-300">⏱️ Cadence & Speed:</span>
          <p className="mt-0.5 text-white">{voice.speed}</p>
        </div>
      </div>

      {script.trim() && (
        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-semibold text-gray-400">
            🎙️ Narration Script Content
          </label>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-relaxed text-gray-200">
            "{script}"
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={generateVoice}
          disabled={!script.trim() || loading}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "⏳ Synthesizing Voice..." : "🎙️ Generate Narration"}
        </button>
      </div>

      {audioUrl && (
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-black/30 p-4 space-y-2">
          <p className="text-xs font-bold text-emerald-400">✅ Audio Track Ready</p>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          ❌ {error}
        </div>
      )}
    </div>
  );
}