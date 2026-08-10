export type SceneData = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

export function analyzeIdea(idea: string) {

  const scenes: SceneData[] = [

    {
      title: "Scene 1",
      visual: `Opening cinematic scene showing ${idea}`,
      camera: "Slow cinematic establishing shot",
      voice: "Every great story begins with a powerful idea."
    },

    {
      title: "Scene 2",
      visual: `The main character faces a challenge related to ${idea}`,
      camera: "Dynamic tracking camera movement",
      voice: "The journey becomes harder, but the character keeps moving forward."
    },

    {
      title: "Scene 3",
      visual: `A powerful cinematic ending that completes ${idea}`,
      camera: "Emotional close up cinematic shot",
      voice: "Every ending creates a new beginning."
    }

  ];

  return {

    concept: idea,

    hook: `A cinematic story begins with ${idea}...`,

    directorVision:
      "Create a cinematic experience with professional storytelling.",

    mood:
      "Emotional cinematic atmosphere",

    scenes,

    status:
      "Idea analyzed successfully."

  };

}