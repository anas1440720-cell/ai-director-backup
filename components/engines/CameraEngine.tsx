"use client";

type CameraEngineProps = {
  style: string;
  goal: string;
};


export default function CameraEngine({
  style,
  goal,
}: CameraEngineProps) {


  const getCameraPlan = () => {


    if (style === "Realistic") {
      return {
        shot: "Hollywood cinematic shots",
        movement: "Dolly shots, tracking shots and handheld realism",
        lens: "35mm cinematic lens",
        angle: "Low angles for powerful moments",
        lighting: "Natural cinematic lighting"
      };
    }



    if (style === "Pixar") {
      return {
        shot: "Animated cinematic compositions",
        movement: "Smooth camera movements with magical transitions",
        lens: "Wide colorful animation lens",
        angle: "Eye level emotional character shots",
        lighting: "Soft bright studio lighting"
      };
    }



    if (style === "Anime") {
      return {
        shot: "Dynamic anime movie shots",
        movement: "Fast camera movements and dramatic zooms",
        lens: "Stylized cinematic framing",
        angle: "Extreme angles for emotions",
        lighting: "High contrast anime lighting"
      };
    }



    if (style === "Fantasy") {
      return {
        shot: "Epic fantasy movie shots",
        movement: "Large cinematic movements and aerial shots",
        lens: "Wide epic fantasy lens",
        angle: "Heroic low angle shots",
        lighting: "Magical atmospheric lighting"
      };
    }



    return {
      shot: "Cinematic storytelling shots",
      movement: "Dynamic camera movements",
      lens: "Professional movie lens",
      angle: "Balanced cinematic angles",
      lighting: "Balanced movie lighting"
    };

  };



  const camera = getCameraPlan();



  return (

    <div
      className="
      mt-8
      rounded-3xl
      border border-blue-500/30
      bg-blue-500/10
      p-6
      "
    >


      <h3 className="text-xl font-bold text-white">
        📸 Camera Engine
      </h3>


      <div className="mt-4 space-y-3 text-gray-300">


        <p>
          🎬 Shot:
          <span className="text-white">
            {" "}{camera.shot}
          </span>
        </p>


        <p>
          🎥 Movement:
          <span className="text-white">
            {" "}{camera.movement}
          </span>
        </p>


        <p>
          🔍 Lens:
          <span className="text-white">
            {" "}{camera.lens}
          </span>
        </p>


        <p>
          📐 Angle:
          <span className="text-white">
            {" "}{camera.angle}
          </span>
        </p>


        <p>
          💡 Lighting:
          <span className="text-white">
            {" "}{camera.lighting}
          </span>
        </p>


      </div>



      <div
        className="
        mt-5
        rounded-xl
        border border-white/10
        p-4
        "
      >

        <p className="text-gray-400">
          🎯 Production Goal
        </p>

        <p className="mt-2 text-white">
          {goal}
        </p>

      </div>


    </div>

  );

}