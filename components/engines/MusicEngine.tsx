"use client";

type MusicEngineProps = {
  style: string;
  goal: string;
};

export default function MusicEngine({ style, goal }: MusicEngineProps) {
  const getMusic = () => {
    if (style === "Fantasy") {
      return {
        genre: "Epic fantasy orchestral music",
        emotion: "Adventure, wonder and mystical journey",
        instruments: "Full symphonic orchestra, taiko drums, harp and ethereal choir",
      };
    }

    if (style === "Pixar") {
      return {
        genre: "Emotional animated feature soundtrack",
        emotion: "Warm, inspiring and heartfelt",
        instruments: "Acoustic piano, orchestral strings, flute and gentle percussion",
      };
    }

    if (style === "Anime") {
      return {
        genre: "High-impact anime cinematic soundtrack",
        emotion: "Intense, dramatic and emotionally charged",
        instruments: "Electric guitar, driving strings, synthesizer and cinematic drums",
      };
    }

    if (style === "Realistic") {
      return {
        genre: "Hollywood cinematic score",
        emotion: "Deep cinematic immersion and tension",
        instruments: "Hybrid orchestral brass, ambient pads and sub-bass textures",
      };
    }

    return {
      genre: "Cinematic narrative background music",
      emotion: "Harmonious storytelling pacing",
      instruments: "Contemporary cinematic instruments and acoustic layers",
    };
  };

  const music = getMusic();

  return (
    <div className="mt-8 rounded-3xl border border-pink-500/30 bg-pink-500/10 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">🎵 Audio & Score Engine</h3>
          <p className="mt-1 text-sm text-gray-400">
            Acoustic atmosphere tailored to cinematic mood and visual style.
          </p>
        </div>
        <span className="rounded-xl border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-xs font-bold text-pink-300">
          {style || "Cinematic"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-gray-300 md:grid-cols-2">
        <p>🎼 Musical Genre: <span className="font-semibold text-white">{music.genre}</span></p>
        <p>❤️ Mood & Emotion: <span className="font-semibold text-white">{music.emotion}</span></p>
        <p className="md:col-span-2">
          🎹 Orchestration: <span className="font-semibold text-white">{music.instruments}</span>
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-semibold text-gray-400">🎯 Harmonic Purpose</p>
        <p className="mt-1 text-sm font-medium text-white">{goal || "Cinematic Narration"}</p>
      </div>
    </div>
  );
}