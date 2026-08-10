export type CharacterData = {
  characterId?: string;
  name?: string;
  role?: string;
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
  age?: string;
  appearance?: string;
  clothing?: string;
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

  storyPurpose?: string;
  time?: string;
  location?: string;

  characters?: SceneCharacterData[];

  action?: string;
  emotion?: string;

  environment?: SceneEnvironmentData;

  lighting?: SceneLightingData;

  composition?: SceneCompositionData;

  visual: string;
  camera: string;

  continuity?: string;

  voice: string;
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

export function analyzeIdea(idea: string): StoryData {
  const scenes: SceneData[] = [
    {
      title: "Scene 1",

      storyPurpose:
        "Establish the beginning of the story and introduce the main character.",

      time:
        "Beginning of the story, natural daytime lighting.",

      location:
        "A location appropriate to the user's story.",

      characters: [
        {
          characterId: "character_1",
          name: "Main Character",
          age: "Age appropriate to the beginning of the story.",
          appearance:
            "Appearance should be determined from the story idea.",
          clothing:
            "Clothing appropriate to the character, location and time period.",
          action:
            "Performing the exact opening action of the story.",
          emotion:
            "Emotion appropriate to the beginning of the story.",
          positionInFrame:
            "Primary subject clearly visible in the main area of the frame.",
        },
      ],

      action:
        `The opening event of the story related directly to: ${idea}`,

      emotion:
        "Emotion appropriate to the beginning of the story.",

      environment: {
        description:
          `A detailed environment appropriate to the story idea: ${idea}`,
        foreground:
          "Natural foreground elements relevant to the location.",
        background:
          "Background elements that establish the story location.",
        props: [],
      },

      lighting: {
        source: "Natural or practical lighting appropriate to the location.",
        direction: "Physically believable lighting direction.",
        quality: "Natural cinematic lighting.",
        mood: "Emotionally appropriate to the opening.",
      },

      composition: {
        shotType: "Wide cinematic establishing shot",
        cameraAngle: "Eye level",
        lens: "35mm cinematic lens",
        depthOfField:
          "Moderate depth of field keeping the main subject recognizable.",
        framing:
          "Clear cinematic framing with the main subject as the visual focus.",
      },

      visual:
        `Opening moment of the story about ${idea}. Show one exact physical moment with a clearly defined main character, environment, action, emotion, clothing and relevant objects.`,

      camera:
        "Wide cinematic establishing composition showing the environment and main character clearly.",

      continuity:
        "Establish the main character's visual identity for future scenes.",

      voice:
        "Every great story begins with a single defining moment.",
    },

    {
      title: "Scene 2",

      storyPurpose:
        "Develop the story by showing the next major event or challenge.",

      time:
        "Later chronological moment in the story.",

      location:
        "A location directly connected to the story progression.",

      characters: [
        {
          characterId: "character_1",
          name: "Main Character",
          age: "Age appropriate to this point in the story.",
          appearance:
            "Maintain recognizable identity from Scene 1.",
          clothing:
            "Clothing appropriate to the character's current situation.",
          action:
            "Performing the next major action in the story.",
          emotion:
            "Emotion appropriate to the current event.",
          positionInFrame:
            "Clearly visible as the primary subject.",
        },
      ],

      action:
        `The next major event directly related to: ${idea}`,

      emotion:
        "Emotion showing the development or challenge of the story.",

      environment: {
        description:
          "A detailed environment showing the story's development.",
        foreground:
          "Objects and environmental details physically close to the camera.",
        background:
          "Background details that reinforce the location and story.",
        props: [],
      },

      lighting: {
        source: "Lighting appropriate to the scene location and time.",
        direction: "Physically believable lighting direction.",
        quality: "Natural cinematic lighting.",
        mood: "Tension, curiosity or emotion appropriate to the story.",
      },

      composition: {
        shotType: "Medium cinematic shot",
        cameraAngle: "Three-quarter eye-level angle",
        lens: "50mm cinematic lens",
        depthOfField:
          "Shallow-to-moderate depth of field separating the character from the background.",
        framing:
          "Character-focused composition while preserving important environmental context.",
      },

      visual:
        `The next specific moment in the story about ${idea}. Show one exact event, with the same recognizable character identity and a clearly defined environment, action and emotional state.`,

      camera:
        "Medium cinematic composition focused on the character and the exact action occurring at this moment.",

      continuity:
        "Maintain the same character identity, facial characteristics and recognizable visual traits established in Scene 1.",

      voice:
        "The journey moves forward, and the next moment changes everything.",
    },

    {
      title: "Scene 3",

      storyPurpose:
        "Show the major climax or final story event.",

      time:
        "Final chronological moment of the story.",

      location:
        "The exact location where the climax or ending occurs.",

      characters: [
        {
          characterId: "character_1",
          name: "Main Character",
          age: "Age appropriate to the final moment.",
          appearance:
            "Maintain the same recognizable identity established earlier.",
          clothing:
            "Clothing appropriate to the final event.",
          action:
            "Performing the exact final story action.",
          emotion:
            "Strong emotion appropriate to the climax or ending.",
          positionInFrame:
            "Primary visual subject clearly visible.",
        },
      ],

      action:
        `The final major event directly related to: ${idea}`,

      emotion:
        "Strong emotional reaction appropriate to the story's climax.",

      environment: {
        description:
          "A highly detailed environment appropriate to the final event.",
        foreground:
          "Important objects and environmental details near the camera.",
        background:
          "Background elements that clearly establish the final location.",
        props: [],
      },

      lighting: {
        source: "Lighting appropriate to the final environment.",
        direction: "Physically believable cinematic lighting direction.",
        quality: "Detailed cinematic lighting.",
        mood: "Strong emotional climax.",
      },

      composition: {
        shotType: "Medium close-up cinematic shot",
        cameraAngle: "Dramatic three-quarter angle",
        lens: "50mm cinematic lens",
        depthOfField:
          "Shallow cinematic depth of field emphasizing the character and key story object.",
        framing:
          "Strong subject-focused framing emphasizing the final story moment.",
      },

      visual:
        `Final specific moment of the story about ${idea}. Show the exact climax or ending event, with the established character identity, precise environment, physical action and visible emotional reaction.`,

      camera:
        "Dramatic cinematic framing focused on the character's final important action and emotional reaction.",

      continuity:
        "Preserve the same recognizable character identity established in the previous scenes.",

      voice:
        "The journey reaches its defining moment.",
    },
  ];

  return {
    concept: idea,

    hook:
      `A cinematic story begins with ${idea}...`,

    directorVision:
      "Create a cinematic experience with precise storytelling, strong visual continuity and clear scene progression.",

    mood:
      "Emotional cinematic atmosphere",

    characters: [
      {
        characterId: "character_1",
        name: "Main Character",
        role: "Main protagonist",
        age: "Determined by the story.",
        appearance:
          "Determined by the story and maintained consistently across scenes.",
        visualIdentity:
          "Primary visual identity must remain recognizable across every scene.",
      },
    ],

    scenes,

    status:
      "Idea analyzed successfully.",
  };
}