"use client";

type Props = {
  idea: string;
  style: string;
  character: string;
  goal?: string;
  customShots?: {
    id: number;
    duration: string;
    camera: string;
    lens: string;
    movement: string;
    lighting: string;
    emotion: string;
    voice: string;
  }[];
};

export default function ShotPlannerEngine({
  idea,
  style,
  goal = "Cinematic narrative",
  customShots,
}: Props) {
  const defaultShots = [
    {
      id: 1,
      duration: "5s",
      camera: "Wide Establishing Shot",
      lens: "24mm Anamorphic",
      movement: "Slow Forward Drone Push",
      lighting: "Golden Hour Atmosphere",
      emotion: "Mystery & Anticipation",
      voice: "Something extraordinary is about to happen...",
    },
    {
      id: 2,
      duration: "6s",
      camera: "Medium Character Tracking",
      lens: "35mm Prime",
      movement: "Dynamic Lateral Tracking",
      lighting: "Cinematic Volumetric Soft Light",
      emotion: "Intrigue & Discovery",
      voice: "The discovery changes everything.",
    },
    {
      id: 3,
      duration: "7s",
      camera: "Intense Close-Up",
      lens: "50mm Portrait Lens",
      movement: "Subtle Push-In",
      lighting: "High-Contrast Dramatic Chiaroscuro",
      emotion: "Awe & Revelation",
      voice: "A secret hidden for centuries is finally revealed.",
    },
  ];

  const shots = customShots && customShots.length > 0 ? customShots : defaultShots;

  return (
    <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6 md:p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">🎥 AI Shot Planner & Cinematography</h3>
          <p className="mt-1 text-xs text-gray-400">
            Director's shotlist detailing focal lengths, lens choice, lighting, and camera motion.
          </p>
        </div>
        <span className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
          {shots.length} Planned Shots
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {shots.map((shot) => (
          <div
            key={shot.id}
            className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/20 text-xs font-bold text-cyan-300">
                  {shot.id}
                </span>
                <h4 className="font-bold text-white">Shot {shot.id}</h4>
              </div>
              <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-gray-300 font-mono">
                ⏱ {shot.duration}
              </span>
            </div>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="font-semibold text-cyan-300">🎥 Camera Framing:</span>
                <p className="mt-0.5 text-gray-300">{shot.camera}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="font-semibold text-purple-300">📷 Lens Selection:</span>
                <p className="mt-0.5 text-gray-300">{shot.lens}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="font-semibold text-blue-300">🎞 Camera Movement:</span>
                <p className="mt-0.5 text-gray-300">{shot.movement}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="font-semibold text-yellow-300">💡 Lighting Scheme:</span>
                <p className="mt-0.5 text-gray-300">{shot.lighting}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="font-semibold text-pink-300">❤️ Emotional Beat:</span>
                <p className="mt-0.5 text-gray-300">{shot.emotion}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-2.5">
                <span className="font-semibold text-emerald-300">🎙 Narration Sync:</span>
                <p className="mt-0.5 text-gray-300 truncate">"{shot.voice}"</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs">
                <span className="font-semibold text-gray-400">🖼 Image Prompt Directive:</span>
                <p className="mt-1 text-gray-300">
                  {style} cinematic scene based on "{idea}", ultra-detailed, professional depth of field, dramatic atmospheric lighting, 8k masterpiece.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs">
                <span className="font-semibold text-gray-400">🎬 Video Motion Directive:</span>
                <p className="mt-1 text-gray-300">
                  {goal} cinematic sequence with {style} aesthetic, {shot.movement.toLowerCase()}, realistic physical motion, movie render.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}