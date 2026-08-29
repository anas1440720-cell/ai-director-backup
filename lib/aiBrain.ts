export type CharacterData = {
  characterId?: string;
  name?: string;
  role?: string;
  gender?: string;
  voiceType?: string;
  age?: string;
  appearance?: string;
  faceStructure?: string;
  skinTone?: string;
  hair?: string;
  eyes?: string;
  bodyType?: string;
  distinctiveFeatures?: string;
  clothing?: string;
  footwear?: string;
  accessories?: string;
  personality?: string;
  visualIdentity?: string;
};

export type SceneCharacterData = {
  characterId?: string;
  name?: string;
  gender?: string;
  age?: string;

  // Immutable character identity
  appearance?: string;
  faceStructure?: string;
  skinTone?: string;
  hair?: string;
  eyes?: string;
  bodyType?: string;
  distinctiveFeatures?: string;
  clothing?: string;
  footwear?: string;
  accessories?: string;
  visualIdentity?: string;

  // Scene-specific performance
  action?: string;
  emotion?: string;
  positionInFrame?: string;
};

export type SceneEnvironmentData = {
  description?: string;
  foreground?: string;
  background?: string;
  props?: string[];
};

export type SceneLightingData = {
  source?: string;
  direction?: string;
  quality?: string;
  mood?: string;
};

export type SceneCompositionData = {
  shotType?: string;
  cameraAngle?: string;
  lens?: string;
  depthOfField?: string;
  framing?: string;
};

export type SceneData = {
  title: string;
  duration: number;

  // Narrative structure
  storyPurpose?: string;
  sceneObjective?: string;

  // Scene timing / location
  time?: string;
  location?: string;

  // Characters performing inside the scene
  characters?: SceneCharacterData[];

  // Cinematic acting structure
  action?: string;
  interaction?: string;
  reaction?: string;
  movement?: string;
  emotion?: string;
  environmentInteraction?: string;

  // Environment / lighting / composition
  environment?: SceneEnvironmentData;
  lighting?: SceneLightingData;
  composition?: SceneCompositionData;

  // Generated visual keyframe
  visual: string;

  // Camera direction
  camera: string;

  // Continuity between scenes
  continuity?: string;

  // Audio planning
  voice: string;

  dialogue?: Array<{
    speakerName: string;
    characterType?: string;
    line: string;
  }>;

  // Sound design
  sfxPrompt?: string;
  musicMood?: string;
};

export type StoryData = {
  concept: string;
  hook: string;
  directorVision: string;
  mood: string;
  characters?: CharacterData[];
  scenes: SceneData[];
  status: string;
};

/**
 * Fallback local story analyzer.
 *
 * NOTE:
 * The main production story is currently generated through
 * /api/generate-story -> lib/ai-provider.ts.
 *
 * This function remains as a safe local fallback and keeps
 * the StoryData structure compatible with the production pipeline.
 */
export function analyzeIdea(
  idea: string,
  totalDurationSeconds: number = 30,
  style: string = "Pixar",
  aspectRatio: string = "9:16"
): StoryData {
  const sceneDuration = 5;

  const calculatedSceneCount = Math.max(
    2,
    Math.round(totalDurationSeconds / sceneDuration)
  );

  const normalizedStyle = style.toLowerCase();

  const isPixarStyle =
    normalizedStyle.includes("pixar") ||
    normalizedStyle.includes("3d");

  const scenes: SceneData[] = [];

  const actionBeats = [
    "The protagonist notices something important in the environment, pauses, turns toward it, and reacts naturally.",
    "The protagonist approaches the important object or situation, reaches toward it, touches it, and physically interacts with it.",
    "The protagonist attempts to solve the immediate problem through a clear physical action, showing effort and emotional reaction.",
    "A new development interrupts the action. The protagonist turns, reacts, and physically responds to what changed.",
    "The protagonist and the environment respond to the consequence of the previous action, creating visible narrative progression.",
    "The protagonist completes the immediate objective through a decisive physical action, followed by a natural emotional reaction."
  ];

  const emotionalBeats = [
    "curious and alert",
    "cautious but determined",
    "focused and emotionally engaged",
    "surprised and reactive",
    "relieved and emotionally affected",
    "satisfied and hopeful"
  ];

  for (let i = 0; i < calculatedSceneCount; i++) {
    const sceneNum = i + 1;
    const beatIndex = Math.min(i, actionBeats.length - 1);

    const action = `${actionBeats[beatIndex]} The action must directly relate to: ${idea}`;

    const interaction =
      "The protagonist physically interacts with a story-relevant object or environmental element.";

    const reaction =
      "The protagonist visibly reacts through eye direction, facial expression, body posture, and purposeful movement.";

    const movement =
      "The protagonist moves naturally through physical space toward or away from the story-relevant event.";

    const environmentInteraction =
      "The protagonist physically occupies and affects the environment while performing the action.";

    const voiceText =
      i === 0
        ? `في بداية الحكاية ${idea}`
        : i === calculatedSceneCount - 1
          ? "وهكذا تصل الحكاية إلى لحظتها الأخيرة ويبقى أثر ما حدث واضحا."
          : "تتغير الأحداث ويتفاعل البطل مع ما يحدث أمامه.";

    const sceneObjective =
      i === 0
        ? `Establish the situation and respond to the first important event related to ${idea}.`
        : i === calculatedSceneCount - 1
          ? `Complete the immediate objective and resolve the current event related to ${idea}.`
          : `Advance the story through a concrete physical event related to ${idea}.`;

    scenes.push({
      title: `Scene ${sceneNum}`,

      duration: sceneDuration,

      storyPurpose:
        i === 0
          ? `Establish the situation and trigger the first action related to ${idea}.`
          : i === calculatedSceneCount - 1
            ? `Resolve the immediate narrative action related to ${idea}.`
            : `Advance the story through a visible physical event and reaction related to ${idea}.`,

      sceneObjective,

      time:
        i === 0
          ? "Beginning of the story"
          : "Continuous chronological progression",

      location: `A specific cinematic environment that directly supports the current event of: ${idea}`,

      characters: [
        {
          characterId: "character_1",
          name: "Main Character",
          gender: "unknown",
          age: "Expressive protagonist",

          appearance: isPixarStyle
            ? "Pixar 3D animated protagonist with expressive facial features and consistent stylized proportions."
            : "Detailed cinematic protagonist with consistent physical appearance.",

          faceStructure:
            "Locked facial structure identical across every scene.",

          skinTone:
            "Locked skin tone identical across every scene.",

          hair:
            "Locked hairstyle, color, length, and volume identical across every scene.",

          eyes:
            "Locked eye shape and color identical across every scene.",

          bodyType:
            "Locked body proportions identical across every scene.",

          distinctiveFeatures:
            "Locked recognizable facial and physical features.",

          clothing:
            "Locked signature outfit identical across every scene.",

          footwear:
            "Locked footwear identical across every scene.",

          accessories:
            "Locked accessories identical across every scene.",

          visualIdentity:
            "MASTER CHARACTER LOCK — preserve exact identity, face, hair, body, clothing, footwear and accessories.",

          action,

          emotion: emotionalBeats[beatIndex],

          positionInFrame:
            "Position determined by the action; never artificially centered for a character showcase."
        }
      ],

      action,

      interaction,

      reaction,

      movement,

      emotion: emotionalBeats[beatIndex],

      environmentInteraction,

      environment: {
        description: `Story-driven cinematic environment physically relevant to the current action and the idea: ${idea}`,

        foreground:
          "Objects that can be touched, moved, crossed, or interacted with during the action.",

        background:
          "Narratively relevant environment with visible depth and continuity.",

        props: [
          `Story-specific interactive object related to ${idea}`,
          "Environment elements that react naturally to the protagonist's actions."
        ]
      },

      lighting: {
        source: "Motivated environmental cinematic lighting",
        direction: "Natural directional light appropriate to the location",
        quality: "Cinematic physically motivated lighting",
        mood: emotionalBeats[beatIndex]
      },

      composition: {
        shotType:
          i % 3 === 0
            ? "Cinematic medium shot showing character and environment interaction"
            : i % 3 === 1
              ? "Cinematic medium close-up capturing action and reaction"
              : "Cinematic wider shot establishing physical movement and environment",

        cameraAngle:
          i % 2 === 0
            ? "Natural eye-level perspective following the action"
            : "Slight dynamic angle supporting the physical event",

        lens: "Cinematic natural perspective",

        depthOfField:
          "Selective depth of field while keeping important action readable",

        framing:
          "Frame the action and environment together; do not isolate the character as a portrait."
      },

      visual: isPixarStyle
        ? `Pixar 3D cinematic animated scene about ${idea}. Show a real narrative event, physical interaction, natural movement, reaction, environmental storytelling, and clear cause-and-effect. The character must perform the specified action rather than pose or showcase themselves.`
        : `Cinematic narrative scene about ${idea}. Show a real narrative event, physical interaction, natural movement, reaction, environmental storytelling, and clear cause-and-effect.`,

      camera:
        i % 3 === 0
          ? "Camera naturally follows the character's movement through the environment."
          : i % 3 === 1
            ? "Subtle cinematic tracking movement follows the action and reaction."
            : "Controlled cinematic movement reveals the event and its consequence.",

      continuity:
        "MASTER CHARACTER LOCK. Exact same face, facial structure, hairstyle, hair color, body proportions, skin tone, clothing, footwear and accessories across all scenes. Preserve environmental and prop continuity. Continue directly from the previous scene.",

      voice: voiceText,

      dialogue: [
        {
          speakerName: "الراوي",
          characterType: "Narrator",
          line: voiceText
        }
      ],

      sfxPrompt:
        "Natural cinematic environmental sound effects caused by the visible physical actions in this scene. No music and no narration.",

      musicMood:
        "Subtle cinematic background mood matching the emotional progression of the scene. No dialogue or narration."
    });
  }

  return {
    concept: idea,

    hook: `A cinematic story about ${idea}.`,

    directorVision:
      "Story-first cinematic direction. Every scene must contain a concrete event, physical action, interaction, reaction, environmental storytelling, and chronological cause-and-effect. Characters must act within the story rather than pose for the camera.",

    mood: "Cinematic and emotionally driven",

    characters: [
      {
        characterId: "character_1",
        name: "Main Character",
        role: "Main Protagonist",
        gender: "unknown",
        age: "Dynamic",

        appearance: isPixarStyle
          ? "Pixar 3D animated stylized protagonist"
          : "Detailed cinematic protagonist",

        visualIdentity:
          "MASTER CHARACTER LOCK — exact facial identity, hair, body proportions, clothing, footwear and accessories must remain unchanged throughout the entire production."
      }
    ],

    scenes,

    status: `Generated ${scenes.length} story-driven cinematic scenes for ${totalDurationSeconds}s duration.`
  };
}