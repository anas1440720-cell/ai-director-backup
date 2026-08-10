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
  return {
    ...scene,

    visual: `${scene.visual}

Reimagined as a ${style} scene inspired by "${idea}".`,

    camera:
      "Epic cinematic drone shot with dramatic lighting and dynamic movement.",

    voice:
      `A new chapter begins. This scene has been rewritten around the idea "${idea}".`,
  };
}