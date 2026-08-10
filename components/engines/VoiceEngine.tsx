"use client";

import { useState } from "react";

type VoiceEngineProps = {
audience: string;
style: string;
script?: string;
};

export default function VoiceEngine({
audience,
style,
script = "",
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
if (!script.trim() || loading) {
return;
}

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
      script,
      voice: voice.voice,
      tone: voice.tone,
      speed: voice.speed,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Voice generation failed."
    );
  }

  setAudioUrl(result.audioUrl);
} catch (error) {
  console.error("Voice generation failed:", error);

  setError(
    error instanceof Error
      ? error.message
      : "Voice generation failed."
  );
} finally {
  setLoading(false);
}


};

return ( <div className="mt-8 rounded-3xl border border-green-500/30 bg-green-500/10 p-6"> <h3 className="text-xl font-bold text-white">
🎙 Voice Engine </h3>

```
  <div className="mt-4 space-y-3 text-gray-300">
    <p>
      🗣 Voice:
      <span className="text-white">
        {" "}
        {voice.voice}
      </span>
    </p>

    <p>
      🎭 Tone:
      <span className="text-white">
        {" "}
        {voice.tone}
      </span>
    </p>

    <p>
      ⏱ Speed:
      <span className="text-white">
        {" "}
        {voice.speed}
      </span>
    </p>
  </div>

  {script.trim() && (
    <div className="mt-5">
      <p className="mb-2 text-sm font-bold text-gray-400">
        🎙 Script
      </p>

      <div className="rounded-xl bg-black/20 p-4 text-sm text-gray-300">
        {script}
      </div>
    </div>
  )}

  <div className="mt-6">
    <button
      type="button"
      onClick={generateVoice}
      disabled={!script.trim() || loading}
      className="rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading
        ? "⏳ Generating Voice..."
        : "🎙 Generate Voice"}
    </button>
  </div>

  {error && (
    <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
      ❌ {error}
    </div>
  )}

  {audioUrl && (
    <div className="mt-5 rounded-xl border border-green-400/20 bg-black/20 p-4">
      <p className="mb-3 font-bold text-green-300">
        ✅ Voice Generated
      </p>

      <audio
        controls
        src={audioUrl}
        className="w-full"
      />
    </div>
  )}
</div>

);
}