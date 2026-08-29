"use client";

type CameraEngineProps = {
  style: string;
  goal: string;
};

export default function CameraEngine({ style, goal }: CameraEngineProps) {
  const getCameraPlan = () => {
    if (style === "Realistic") {
      return {
        shot: "Hollywood cinematic shots",
        movement: "Controlled dolly, tracking shots & subtle push-ins",
        lens: "35mm & 50mm Prime cinema lenses",
        angle: "Eye-level & dramatic low angles",
        lighting: "Natural volumetric cinematic lighting",
      };
    }

    if (style === "Pixar") {
      return {
        shot: "Animated feature composition",
        movement: "Smooth stabilized orbital & sweeping movements",
        lens: "Wide animation lens (24mm equivalent)",
        angle: "Character eye-level emotive angles",
        lighting: "Vibrant high-key studio rim lighting",
      };
    }

    if (style === "Anime") {
      return {
        shot: "Dynamic Japanese animation framing",
        movement: "Rapid cinematic tracking and impactful crash zooms",
        lens: "Stylized anamorphic framing",
        angle: "Extreme Dutch & dramatic three-quarter angles",
        lighting: "High-contrast cel-shaded cinematic lighting",
      };
    }

    if (style === "Fantasy") {
      return {
        shot: "Epic scale landscape & hero shots",
        movement: "Slow sweeping crane & majestic aerial shots",
        lens: "Epic wide-angle cinema glass",
        angle: "Heroic low-angle perspective",
        lighting: "Atmospheric mystical lighting with golden hour bloom",
      };
    }

    return {
      shot: "Cinematic storytelling compositions",
      movement: "Subtle dynamic camera motion",
      lens: "Standard professional cinema lens",
      angle: "Balanced narrative angles",
      lighting: "Natural balanced film lighting",
    };
  };

  const camera = getCameraPlan();

  return (
    <div className="mt-8 rounded-3xl border border-blue-500/30 bg-blue-500/10 p-6 backdrop-blur-xl">
      <h3 className="text-xl font-bold text-white">📸 Cinematic Camera Engine</h3>

      <div className="mt-4 grid gap-3 text-sm text-gray-300 md:grid-cols-2">
        <p>🎬 Shot Type: <span className="font-semibold text-white">{camera.shot}</span></p>
        <p>🎥 Camera Motion: <span className="font-semibold text-white">{camera.movement}</span></p>
        <p>🔍 Lens Specs: <span className="font-semibold text-white">{camera.lens}</span></p>
        <p>📐 Framing Angle: <span className="font-semibold text-white">{camera.angle}</span></p>
        <p className="md:col-span-2">💡 Lighting Style: <span className="font-semibold text-white">{camera.lighting}</span></p>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-semibold text-gray-400">🎯 Production Goal Alignment</p>
        <p className="mt-1 text-sm font-medium text-white">{goal || "Cinematic Storytelling"}</p>
      </div>
    </div>
  );
}