"use client";

type PromptEngineProps = {
  idea: string;
  style: string;
  goal: string;
  character: string;
  story?: {
    hook: string;
    scenes: {
      title: string;
      visual: string;
      camera: string;
      voice: string;
    }[];
  };
};


export default function PromptEngine({
  idea,
  style,
  goal,
  character,
  story,
}: PromptEngineProps) {


  const prompt = `
🎬 MASTER AI VIDEO PROMPT

Create a professional cinematic video.

💡 IDEA:
${idea}


🎨 VISUAL STYLE:
${style} cinematic style


🎯 VIDEO GOAL:
${goal}


👤 CHARACTER DIRECTION:
${character}


🎥 CINEMATOGRAPHY:
Use professional movie camera movements,
cinematic framing,
dynamic shots,
realistic lighting,
depth of field,
and high quality composition.


📖 STORY BLUEPRINT:

Hook:
${story?.hook || "Create a powerful opening hook"}

Scenes:

${story?.scenes.map((scene) => `
${scene.title}

Visual:
${scene.visual}

Camera:
${scene.camera}

Voice:
${scene.voice}
`).join("\n") || "Generate cinematic scenes"}


🎵 MUSIC DIRECTION:
Create background music that matches the emotion,
scene pacing and storytelling style.


🎙 VOICE DIRECTION:
Professional cinematic narration,
clear emotional delivery,
perfect timing with scenes.


🎬 VIDEO QUALITY:
Hollywood cinematic quality,
high details,
smooth animation,
professional editing,
movie atmosphere.
`;



  return (

    <div className="
    mt-8
    rounded-2xl
    border border-blue-500/30
    bg-blue-500/10
    p-6
    ">


      <h3 className="text-xl font-bold text-white">
        🧠 Master Prompt Engine
      </h3>


      <p className="mt-3 text-gray-400">
        AI Director master production prompt
      </p>


      <div className="
      mt-5
      rounded-xl
      border border-white/10
      bg-black/20
      p-5
      text-white
      whitespace-pre-line
      ">

        {prompt}

      </div>


    </div>

  );

}