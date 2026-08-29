export type CharacterDNA = {
  characterId?: string;
  name: string;
  gender: string;
  appearance: string;
  clothing: string;
};

export type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
  characters?: CharacterDNA[];
};

export type DirectorDecision = {
  rewrittenScene: Scene;
  imagePrompt: string;
  videoPrompt: string;
  voiceScript: string;
  musicPrompt: string;
};

/**
 * Builds a strict, English-only cinematic prompt guaranteeing 
 * all characters are rendered together with correct anatomy and zero text artifacts.
 */
export function analyzeScene(
  scene: Scene,
  idea: string,
  style: string = "Pixar 3D Animation",
  audience: string = "General",
  goal: string = "Cinematic storytelling"
): DirectorDecision {
  const cleanVisual = scene.visual.split(". Reimagined as a ")[0].trim();
  const cleanCamera = scene.camera?.trim() || "Smooth cinematic camera tracking movement";

  // Build high-tier Pixar standard image prompt enforcing clean frame & both characters
  const imagePrompt = [
    `Masterpiece 3D cinematic frame, ${style} aesthetic`,
    cleanVisual,
    `cinematic soft volumetric lighting, rich color palette, extreme character consistency`,
    `anatomically correct human bodies, exactly two hands with 5 fingers each, no extra hands, no third hand`,
    `vertical 9:16 mobile composition, ultra clean frame, absolutely no text, no subtitles, no watermark, no captions, no gibberish letters`,
  ].join(", ");

  // Pure motion-directive prompt for deAPI video engine (LTX)
  const videoPrompt = [
    `Cinematic continuous physical motion, ${cleanCamera}`,
    `characters physically act, walk, and react naturally`,
    `smooth 25fps framerate, movie color grading`,
    `ultra clean background, no text, no subtitles, no on-screen letters, no extra limbs`,
  ].join(", ");

  const rewrittenScene: Scene = {
    ...scene,
    visual: cleanVisual,
    camera: cleanCamera,
    voice: scene.voice || "",
  };

  return {
    rewrittenScene,
    imagePrompt,
    videoPrompt,
    voiceScript: rewrittenScene.voice,
    musicPrompt: `Cinematic orchestral atmosphere, emotional tone reflecting ${goal}, subtle and immersive background score.`,
  };
}