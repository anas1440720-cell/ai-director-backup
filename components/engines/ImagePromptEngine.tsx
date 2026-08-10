"use client";

export type ImagePromptCharacter = {
  characterId?: string;
  name?: string;
  age?: string;
  appearance?: string;
  clothing?: string;
  action?: string;
  emotion?: string;
  positionInFrame?: string;
};

export type ImagePromptScene = {
  title: string;

  storyPurpose?: string;
  time?: string;
  location?: string;

  characters?: ImagePromptCharacter[];

  action?: string;
  emotion?: string;

  environment?: {
    description?: string;
    foreground?: string;
    background?: string;
    props?: string[];
  };

  lighting?: {
    source?: string;
    direction?: string;
    quality?: string;
    mood?: string;
  };

  composition?: {
    shotType?: string;
    cameraAngle?: string;
    lens?: string;
    depthOfField?: string;
    framing?: string;
  };

  visual: string;
  camera: string;
  continuity?: string;
  voice: string;
};

type ImagePromptEngineProps = {
  scenes: ImagePromptScene[];
};

/**
 * Converts one detailed story scene into a production-ready
 * image generation prompt.
 */
export function buildImagePrompt(
  scene: ImagePromptScene
): string {
  const characters =
    scene.characters
      ?.map(
        (character) =>
          `CHARACTER:
Name: ${character.name || "Unnamed character"}
Character ID: ${character.characterId || "character_1"}
Age: ${character.age || "Not specified"}
Appearance: ${character.appearance || "Not specified"}
Clothing: ${character.clothing || "Not specified"}
Action: ${character.action || "Not specified"}
Emotion: ${character.emotion || "Not specified"}
Position in frame: ${
            character.positionInFrame || "Not specified"
          }`
      )
      .join("\n\n") ||
    "No structured character data provided.";

  const props =
    scene.environment?.props &&
    scene.environment.props.length > 0
      ? scene.environment.props.join(", ")
      : "No additional important props.";

  return `
CINEMATIC IMAGE GENERATION PROMPT

Create ONE single cinematic image representing ONE exact physical moment from the story.

The image must look like a real frame captured from the exact scene described below.

================================
SCENE IDENTITY
================================

Scene:
${scene.title}

Story Purpose:
${scene.storyPurpose || "Show the exact story event."}

Time / Period:
${scene.time || "Not specified."}

Location:
${scene.location || "Not specified."}

================================
CHARACTERS
================================

${characters}

================================
EXACT STORY ACTION
================================

Action:
${scene.action || scene.visual}

Emotion:
${scene.emotion || "Emotion must match the exact event."}

================================
ENVIRONMENT
================================

Environment:
${
  scene.environment?.description ||
  "Detailed environment appropriate to the story."
}

Foreground:
${
  scene.environment?.foreground ||
  "Natural foreground elements relevant to the location."
}

Background:
${
  scene.environment?.background ||
  "Detailed background consistent with the location and period."
}

Important Props:
${props}

================================
LIGHTING
================================

Lighting Source:
${scene.lighting?.source || "Natural cinematic lighting."}

Lighting Direction:
${
  scene.lighting?.direction ||
  "Physically believable lighting direction."
}

Lighting Quality:
${
  scene.lighting?.quality ||
  "Natural cinematic lighting with realistic shadows."
}

Lighting Mood:
${
  scene.lighting?.mood ||
  "Emotionally appropriate to the exact scene."
}

================================
CAMERA & COMPOSITION
================================

Shot Type:
${scene.composition?.shotType || scene.camera}

Camera Angle:
${
  scene.composition?.cameraAngle ||
  "Cinematic eye-level perspective."
}

Lens:
${scene.composition?.lens || "50mm cinematic lens."}

Depth of Field:
${
  scene.composition?.depthOfField ||
  "Natural cinematic depth of field."
}

Framing:
${
  scene.composition?.framing ||
  "Clear subject-focused cinematic framing."
}

Camera Direction:
${scene.camera}

================================
VISUAL DESCRIPTION
================================

${scene.visual}

================================
CHARACTER CONTINUITY
================================

${
  scene.continuity ||
  "Maintain the established identity, facial characteristics, body proportions, hair, skin tone and other recognizable traits of every recurring character."
}

================================
STRICT DIRECTOR RULES
================================

1. Generate exactly ONE image.

2. Show exactly ONE moment in time.

3. Do NOT combine different moments from the story.

4. Do NOT show past, present and future versions of a character together.

5. Do NOT show multiple ages of the same character in one image.

6. Do NOT create montage, collage, split screen or multiple panels.

7. Do NOT invent unrelated characters.

8. Do NOT invent unrelated vehicles, buildings, weapons, objects or scenery.

9. Do NOT add random cinematic elements that are not justified by the story.

10. Preserve the exact character appearance described above.

11. Preserve the exact clothing described above.

12. Preserve the exact environment described above.

13. Preserve the exact action described above.

14. Preserve the exact emotional expression described above.

15. Follow the specified camera angle and composition.

16. Follow the specified lighting direction.

17. Respect the specified historical, geographical and cultural context.

18. The main character must remain visually recognizable across scenes.

19. If the character's age changes between scenes, show ONLY the age specified for THIS scene.

20. The image must communicate the story event visually without requiring the viewer to read the original idea.

21. Do not replace the specific story event with a generic cinematic interpretation.

22. Prioritize STORY ACCURACY over generic cinematic decoration.

================================
VISUAL QUALITY
================================

Premium cinematic realism,
physically believable materials,
realistic human anatomy,
natural skin texture,
realistic hair,
detailed clothing,
accurate environmental textures,
physically believable shadows,
natural light behavior,
professional cinematography,
high visual fidelity,
cinematic color grading,
detailed background,
strong subject separation.

================================
FINAL DIRECTOR INSTRUCTION
================================

The generated image must look like a frame taken directly from THIS exact story scene.

Do not reinterpret the entire story.

Do not summarize the story.

Do not create a poster.

Do not create a generic cinematic image.

Create the exact physical moment described above.
`.trim();
}

export default function ImagePromptEngine({
  scenes,
}: ImagePromptEngineProps) {
  return (
    <div>
      <h3 className="text-xl font-bold text-white">
        🖼️ Image Prompt Engine
      </h3>

      <p className="mt-3 text-gray-400">
        AI generates detailed cinematic image prompts for every scene.
      </p>

      {scenes.map((scene, index) => {
        const prompt = buildImagePrompt(scene);

        return (
          <div
            key={`${scene.title}-${index}`}
            className="
              mt-5
              rounded-xl
              border border-white/10
              bg-black/20
              p-4
            "
          >
            <h4 className="font-bold text-white">
              🎬 {scene.title}
            </h4>

            <p className="mt-4 text-xs uppercase tracking-wide text-cyan-400">
              Story Purpose
            </p>

            <p className="mt-1 text-gray-300">
              {scene.storyPurpose ||
                "Specific cinematic moment from the story."}
            </p>

            <p className="mt-4 text-xs uppercase tracking-wide text-cyan-400">
              Generated Image Prompt
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-300">
              {prompt}
            </p>
          </div>
        );
      })}
    </div>
  );
}