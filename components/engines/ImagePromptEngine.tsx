"use client";

export { getStyleProfile, normalizeVisualStyle } from "./StyleProfile.tmp";
export type { VisualStyle } from "./StyleProfile.tmp";

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


export type CharacterLock = {
  characterId?: string;
  name?: string;
  age?: string;
  appearance?: string;
  faceStructure?: string;
  skinTone?: string;
  hair?: string;
  eyes?: string;
  bodyType?: string;
  clothing?: string;
  footwear?: string;
  accessories?: string;
  distinctiveFeatures?: string;
  visualIdentity?: string;
};
type ImagePromptEngineProps = {
  scenes: ImagePromptScene[];
};

/**
 * Converts one detailed story scene into a production-ready
 * image generation prompt.
 */
export function buildImagePrompt(
  scene: ImagePromptScene,
  style: string = "Realistic",
  locks: CharacterLock[] = []
): string {
  const styleText = style?.trim() || "Realistic";

  const characterLocks =
    locks.length > 0
      ? locks
          .map(
            (lock) => `
LOCKED CHARACTER IDENTITY:
Character ID: ${lock.characterId || "character_1"}
Name: ${lock.name || "Unnamed character"}
Age: ${lock.age || "Not specified"}
Appearance: ${lock.appearance || "Preserve established appearance."}
Face Structure: ${lock.faceStructure || "Preserve established face structure."}
Skin Tone: ${lock.skinTone || "Preserve established skin tone."}
Hair: ${lock.hair || "Preserve established hair."}
Eyes: ${lock.eyes || "Preserve established eyes."}
Body Type: ${lock.bodyType || "Preserve established body type."}
Clothing: ${lock.clothing || "Preserve established clothing."}
Footwear: ${lock.footwear || "Preserve established footwear."}
Accessories: ${lock.accessories || "Preserve established accessories."}
Distinctive Features: ${
              lock.distinctiveFeatures ||
              "Preserve all established distinctive features."
            }
Visual Identity: ${
              lock.visualIdentity ||
              "Preserve the exact established visual identity."
            }`
          )
          .join("\n")
      : "No global character locks available.";

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

================================
SELECTED VISUAL STYLE
================================

${styleText}

The selected visual style is mandatory.
Apply this exact visual style consistently to the entire image.
Do not substitute another visual medium.
Do not mix visual styles.

Create ONE single cinematic image representing ONE exact physical moment from the story.

The image must look like a real frame captured during the action of the exact scene described below.

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
GLOBAL CHARACTER LOCKS
================================

${characterLocks}

These character locks are AUTHORITATIVE.

Preserve the exact identity of every recurring character across ALL scenes.

Do not change:
- face structure
- skin tone
- hair
- eyes
- body type
- age
- clothing
- footwear
- accessories
- distinctive features
- established visual identity

The current scene may change pose, movement, action, emotion and camera framing,
but the character identity itself MUST remain consistent.

================================
EXACT STORY EVENT
================================

Primary Action:
${scene.action || scene.visual}

Scene Emotion:
${scene.emotion || "Emotion must match the exact event."}

The image MUST visually communicate the specific story event above.

Do not replace the event with a generic pose.

Do not merely display the characters.

The characters must be actively DOING something that causes or expresses the story event.

================================
CINEMATIC ACTING & INTERACTION
================================

The characters are ACTORS inside a real physical event, not models posing for a portrait.

Prioritize observable physical acting over character presentation.

If multiple characters are present, they must have a believable spatial and behavioral relationship to one another.

Show natural interaction between characters whenever the story requires it:
- looking at each other when appropriate
- reacting to each other's actions
- speaking to or listening to one another when appropriate
- reaching toward, holding, helping, following, avoiding or confronting one another when justified
- natural body orientation toward the relevant person or object
- believable interpersonal distance
- coordinated physical actions
- visible cause-and-effect between one character's action and another character's reaction

If a character interacts with an object, the interaction must be physically clear:
- hands must correctly contact or manipulate the object
- body position must support the action
- gaze should naturally follow the action or object
- the object must occupy the correct physical location
- the character's movement must make sense within the environment

Every major character should have a meaningful role in the exact event.

Do not make all characters stand independently and face the camera.

Do not make characters pose side-by-side merely to show their appearance.

Do not make characters look directly into the camera unless the story explicitly requires it.

Use natural acting poses, body language, gestures, gaze direction and reactions.

The strongest visual information in the frame must come from the STORY EVENT and the characters' interaction with it.

================================
ACTION CAUSE AND REACTION
================================

The scene should contain a clear visual cause-and-effect relationship.

Show:
1. What is physically happening.
2. Who is causing or performing the action.
3. Who or what is being affected.
4. The immediate physical or emotional reaction.

Prefer active verbs and visible physical behavior.

Examples of acceptable cinematic behavior:
- one character reaches toward something while another reacts
- one character discovers an object while another leans closer to inspect it
- one character runs while another turns and reacts
- one character opens a door while another waits or looks inside
- one character points toward something while another follows the pointing direction with their gaze
- characters physically cooperate to solve a problem
- a character's movement changes another character's position, attention or emotion

Avoid static descriptions such as:
"two characters standing together"
"characters looking at the camera"
"characters posing"
"character portrait"
"character showcase"

Unless explicitly required by the story, the scene must NOT look like a posed group photograph.

================================
BODY LANGUAGE & GAZE
================================

Use anatomically believable body language.

Hands, arms, shoulders, torso, legs and head direction must support the described action.

Gaze direction must support the event:
- characters look toward the object they are interacting with
- characters look toward the person they are responding to
- characters look toward the source of danger, discovery or movement
- characters may look away from the camera when the event requires it

Facial expressions must be reactions to the event, not generic emotional portraits.

Body posture must communicate:
attention, surprise, fear, curiosity, urgency, cooperation, hesitation, excitement or other emotions only when justified by the scene.

================================
SPATIAL BLOCKING
================================

Maintain clear cinematic blocking.

Every important character must occupy a deliberate physical position within the environment.

Their positions must make the action readable.

Foreground, middle ground and background characters must have meaningful spatial relationships.

Do not randomly arrange characters.

Do not overlap bodies unnaturally.

Do not place hands, faces or important objects in physically impossible positions.

The environment must provide believable physical space for the described action.

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

The environment is part of the scene action.

Use environmental objects and spatial features when they naturally participate in the event.

Do not add unrelated scenery merely for cinematic decoration.

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

Lighting must support the action and environment without overpowering the story event.

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
  "Clear subject-focused cinematic framing that preserves the complete physical action."
}

Camera Direction:
${scene.camera}

The camera must serve the story event.

Prefer compositions that make the interaction and physical action immediately readable.

Do not frame the image primarily as a character portrait.

Do not sacrifice the physical action merely to create a beautiful portrait.

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

23. Characters must appear to be naturally acting within the event, not posing for the camera.

24. Prefer visible interaction over static character presentation.

25. When multiple characters are present, preserve meaningful cause-and-effect relationships between their actions and reactions.

26. When the story involves an object, make the character-object interaction physically visible.

27. Use gaze direction and body orientation to reinforce the actual story action.

28. Do not use generic standing poses when the story describes movement or interaction.

29. Do not create a character showcase, fashion pose, lineup or promotional portrait.

30. Do not make every character face the camera.

31. Do not invent actions that contradict the exact story event.

32. The physical action must remain readable even without knowing the original story text.

================================
VISUAL QUALITY
================================

Premium cinematic ${styleText} visual quality,
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
strong subject separation,
natural body language,
believable physical interaction,
clear visual storytelling.

================================
FINAL DIRECTOR INSTRUCTION
================================

The generated image must look like a frame taken directly from THIS exact story scene during the actual event.

The characters are actors performing the event.

The image must show what is HAPPENING, not merely who is present.

Prioritize:
STORY EVENT
→ PHYSICAL ACTION
→ CHARACTER INTERACTION
→ REACTION
→ BODY LANGUAGE
→ GAZE
→ ENVIRONMENTAL PARTICIPATION
→ CINEMATIC COMPOSITION

Do not reinterpret the entire story.

Do not summarize the story.

Do not create a poster.

Do not create a generic cinematic image.

Do not create a character showcase.

Do not create a posed character lineup.

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










