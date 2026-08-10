"use client";

type StoryEngineProps = {
  idea: string;
  style: string;
  goal: string;
  emotion?: string;
  storyType?: string;
  storyData?: {
    hook?: string;
    scenes?: {
      title: string;
      visual: string;
      camera: string;
      voice: string;
    }[];
  };
};

export default function StoryEngine({
  idea,
  storyData,
  storyType,
}: StoryEngineProps) {


  const story = storyData || {

    hook: `An exciting story begins about ${idea}...`,

    scenes: [

      {
        title: "Scene 1",
        visual: `Opening cinematic scene about ${idea}`,
        camera: "Establishing cinematic shot",
        voice: "The story begins..."
      },

      {
        title: "Scene 2",
        visual: `The main character faces a challenge related to ${idea}`,
        camera: "Dynamic tracking camera",
        voice: "The journey continues..."
      },

      {
        title: "Scene 3",
        visual: `The final moment of ${idea}`,
        camera: "Emotional cinematic close up",
        voice: "The story ends..."
      }

    ]

  };


  return (

    <div
      className="
      mt-8
      rounded-2xl
      border border-green-500/30
      bg-green-500/10
      p-6
      "
    >

      <h3 className="text-xl font-bold text-white">
        📖 AI Story Blueprint
      </h3>


      <p className="mt-3 text-gray-400">
        🧠 Story Type: {storyType}
      </p>


      <p className="mt-3 text-gray-300">

        ⚡ Hook:

        <span className="text-white">
          {" "}{story.hook}
        </span>

      </p>


      {story.scenes?.map((scene, index) => (

        <div
          key={index}
          className="
          mt-5
          rounded-xl
          border border-white/10
          p-4
          "
        >

          <h4 className="font-bold text-white">
            🎬 {scene.title}
          </h4>


          <p className="text-gray-300">
            🎥 Visual:
            <span className="text-white">
              {" "}{scene.visual}
            </span>
          </p>


          <p className="text-gray-300">
            📸 Camera:
            <span className="text-white">
              {" "}{scene.camera}
            </span>
          </p>


          <p className="text-gray-300">
            🎙 Voice:
            <span className="text-white">
              {" "}{scene.voice}
            </span>
          </p>


        </div>

      ))}


    </div>

  );

}