export type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

export function rewriteScene(
  scene: Scene,
  idea: string,
  style: string = "Cinematic"
): Scene {
  const cleanVisual = scene.visual
    .replace(/\n\s*Reimagined as[\s\S]*/i, "")
    .trim();
  const baseIdea = idea.trim() || "the main narrative";

  return {
    ...scene,
    visual: `${cleanVisual} — Enhanced as a ${style} cinematic scene inspired by "${baseIdea}".`,
    camera:
      scene.camera ||
      "Epic cinematic drone shot with dramatic volumetric lighting and dynamic framing.",
    voice:
      scene.voice ||
      `A new chapter begins. This scene advances the story around "${baseIdea}".`,
  };
}