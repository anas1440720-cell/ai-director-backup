export type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

export type DirectorDecision = {
  rewrittenScene: Scene;
  imagePrompt: string;
  videoPrompt: string;
  voiceScript: string;
  musicPrompt: string;
};

export function analyzeScene(
  scene: Scene,
  idea: string,
  style: string,
  audience: string,
  goal: string
): DirectorDecision {
  // Remove previous AI regeneration text
  // so repeated regeneration does not duplicate the content.
  const cleanVisual = scene.visual
    .split(". Reimagined as a ")[0]
    .trim();

  const cleanIdea = idea
    .split(". Reimagined as a ")[0]
    .trim();

  const baseIdea =
    cleanIdea || cleanVisual || "the main idea";

  const rewrittenScene: Scene = {
    ...scene,

    visual: `${cleanVisual}. Reimagined as a ${style} cinematic scene for ${audience}. Main idea: ${baseIdea}.`,

    camera:
      "Epic cinematic drone shot with dramatic lighting, smooth motion and film-quality composition.",

    voice:
      `This scene has been rewritten by the AI Director for an audience of ${audience}.`,
  };

  return {
    rewrittenScene,

    imagePrompt:
      `Ultra realistic ${style} movie frame of ${rewrittenScene.visual}`,

    videoPrompt:
      `Cinematic camera movement showing ${rewrittenScene.visual}`,

    voiceScript: rewrittenScene.voice,

    musicPrompt:
      `${style} emotional orchestral soundtrack matching the scene`,
  };
}