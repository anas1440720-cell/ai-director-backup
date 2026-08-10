"use client";

type Props = {
  idea: string;
  style: string;
  character: string;
  goal?: string;
};

export default function ShotPlannerEngine({
  idea,
  style,
  goal,
}: Props) {
  const shots = [
    {
      id: 1,
      duration: "5 sec",
      camera: "Wide Establishing Shot",
      lens: "24mm",
      movement: "Slow Drone Push In",
      lighting: "Golden Hour",
      emotion: "Mystery",
      voice: "Something extraordinary is about to happen...",
    },
    {
      id: 2,
      duration: "6 sec",
      camera: "Medium Shot",
      lens: "35mm",
      movement: "Tracking Shot",
      lighting: "Soft Cinematic",
      emotion: "Curiosity",
      voice: "The discovery changes everything.",
    },
    {
      id: 3,
      duration: "7 sec",
      camera: "Close Up",
      lens: "50mm",
      movement: "Slow Push In",
      lighting: "Epic Contrast",
      emotion: "Wonder",
      voice: "A secret hidden for centuries is finally revealed.",
    },
  ];

  return (
    <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">

      <h3 className="text-2xl font-bold text-white">
        🎥 AI Shot Planner
      </h3>

      <p className="mt-2 text-gray-400">
        AI has planned the cinematic shots for your video.
      </p>

      <div className="mt-6 space-y-6">

        {shots.map((shot) => (

          <div
            key={shot.id}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >

            <h4 className="text-xl font-bold text-white">
              🎬 Shot {shot.id}
            </h4>

            <div className="mt-4 space-y-2 text-gray-300">

              <p>
                ⏱ Duration:
                <span className="text-white"> {shot.duration}</span>
              </p>

              <p>
                🎥 Camera:
                <span className="text-white"> {shot.camera}</span>
              </p>

              <p>
                📷 Lens:
                <span className="text-white"> {shot.lens}</span>
              </p>

              <p>
                🎞 Movement:
                <span className="text-white"> {shot.movement}</span>
              </p>

              <p>
                💡 Lighting:
                <span className="text-white"> {shot.lighting}</span>
              </p>

              <p>
                ❤️ Emotion:
                <span className="text-white"> {shot.emotion}</span>
              </p>

              <p>
                🎙 Voice:
                <span className="text-white"> {shot.voice}</span>
              </p>

            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">

              <p className="text-sm text-gray-400">
                🖼 Image Prompt
              </p>

              <p className="mt-2 text-white">
                {style} cinematic scene based on "{idea}", ultra detailed,
                professional composition, dramatic lighting, masterpiece,
                8k quality.
              </p>

            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">

              <p className="text-sm text-gray-400">
                🎬 Video Prompt
              </p>

              <p className="mt-2 text-white">
                Create a {goal} cinematic sequence with {style} visuals,
                smooth camera movement, realistic physics, cinematic lighting,
                movie quality.
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}