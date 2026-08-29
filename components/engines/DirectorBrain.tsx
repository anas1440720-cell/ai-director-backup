"use client";

type DirectorBrainProps = {
  idea: string;
  videoType: string;
  audience: string;
  goal: string;
  character: string;
  style: string;
};

export default function DirectorBrain({
  idea,
  videoType,
  audience,
  goal,
  character,
  style,
}: DirectorBrainProps) {
  const analyzeStory = () => {
    let emotion = "Emotional cinematic feeling";
    let pacing = "Balanced cinematic pacing";
    let storyType = "Cinematic Story";

    if (goal === "Teach") {
      emotion = "Curiosity and discovery";
      pacing = "Clear educational storytelling";
      storyType = "Educational cinematic journey";
    } else if (goal === "Get More Views") {
      emotion = "Shock and excitement";
      pacing = "Fast viral editing style";
      storyType = "Viral attention grabbing story";
    } else if (goal === "Entertain") {
      emotion = "Fun and excitement";
      pacing = "Dynamic entertaining scenes";
      storyType = "Entertainment adventure";
    } else if (goal === "Sell Product") {
      emotion = "Trust and desire";
      pacing = "Professional advertising rhythm";
      storyType = "Commercial cinematic story";
    }

    return {
      emotion,
      pacing,
      storyType,
      idea,
      videoType,
      audience,
      goal,
      character,
      style,
    };
  };

  const brain = analyzeStory();

  return (
    <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">
      <h3 className="text-xl font-bold text-white">🧠 Director Brain</h3>

      <div className="mt-4 grid gap-3 text-sm text-gray-300 md:grid-cols-2">
        <p>🎬 Story Type: <span className="font-semibold text-white">{brain.storyType}</span></p>
        <p>❤️ Emotion: <span className="font-semibold text-white">{brain.emotion}</span></p>
        <p>⚡ Editing Style: <span className="font-semibold text-white">{brain.pacing}</span></p>
        <p>💡 Idea: <span className="font-semibold text-white">{idea}</span></p>
        <p>📺 Format: <span className="font-semibold text-white">{videoType}</span></p>
        <p>👥 Audience: <span className="font-semibold text-white">{audience}</span></p>
        <p>🎭 Character Direction: <span className="font-semibold text-white">{character}</span></p>
        <p>🎨 Visual Style: <span className="font-semibold text-white">{style}</span></p>
      </div>
    </div>
  );
}