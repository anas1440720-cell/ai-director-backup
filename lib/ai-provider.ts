import { GoogleGenAI } from "@google/genai";

export type AIProvider = "openai" | "gemini" | "claude";

export type AIProviderConfig = {
  id: AIProvider;
  name: string;
  available: boolean;
};

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    available: true,
  },
  {
    id: "openai",
    name: "OpenAI",
    available: false,
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    available: false,
  },
];

export type GenerateStoryResult = {
  provider: string;
  success: boolean;
  text: string;
  message?: string;
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env.local");
  }

  return new GoogleGenAI({
    apiKey,
  });
}

function getProviderConfig(provider: AIProvider) {
  return AI_PROVIDERS.find((item) => item.id === provider);
}

export async function generateStory(
  provider: AIProvider,
  idea: string
): Promise<GenerateStoryResult> {
  const config = getProviderConfig(provider);

  if (!config) {
    throw new Error(`Unknown AI Provider: ${provider}`);
  }

  if (!config.available) {
    return {
      provider: config.name,
      success: false,
      text: "",
      message: `${config.name} is not connected yet.`,
    };
  }

  switch (provider) {
    case "gemini":
      return generateWithGemini(idea);

    case "openai":
    case "claude":
      return {
        provider: config.name,
        success: false,
        text: "",
        message: `${config.name} is not connected yet.`,
      };

    default:
      throw new Error(`Unknown AI Provider: ${provider}`);
  }
}

async function generateWithGemini(
  idea: string
): Promise<GenerateStoryResult> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `
You are an elite AI Film Director, Screenwriter,
Cinematographer and Visual Continuity Director.

Your job is to transform the user's idea into a precise
cinematic production blueprint that can be sent directly
to an image generation model.

The image model must NOT need to guess what the story means.

The blueprint must explicitly describe what must appear
inside every single frame.

USER IDEA:
${idea}

==================================================
CORE STORY RULES
==================================================

1. Understand the complete story before creating scenes.

2. Build a logical chronological progression:
   beginning → development → climax / ending.

3. Every scene represents ONE exact moment in time.

4. NEVER combine different moments, ages, locations,
   or major events inside one image.

5. NEVER show multiple ages of the same character
   inside one image.

6. NEVER use vague descriptions such as:
   "cinematic scene about the idea"
   "a powerful moment"
   "something dramatic"
   "the character faces a challenge"

7. Every visual description must describe exactly
   what the camera sees.

8. Every scene must be independently understandable.

9. Characters must remain visually consistent
   throughout the story.

10. If a character becomes older between scenes,
    explicitly describe the new age while preserving
    recognizable identity.

11. Clothing must make sense for the character's age,
    location, culture, occupation and time period.

12. Environment must match the story.

13. Do not introduce random cars, buildings,
    weapons, people, objects or locations.

14. Historical, geographical and cultural details
    must be internally consistent.

15. The image must visually communicate the actual
    story event, not merely its mood.

==================================================
CHARACTER BIBLE
==================================================

Before describing scenes, create a CHARACTER BIBLE.

For every important character define:

- characterId
- name
- role
- age at first appearance
- physical appearance
- face structure
- skin tone
- hair
- eyes
- body type
- distinctive identifying features
- clothing
- footwear
- accessories
- personality
- visual identity

The characterId must remain identical across scenes.

If the character ages, preserve the same identity
while changing only age-appropriate characteristics.

Do NOT create contradictory appearances.

==================================================
SCENE BLUEPRINT
==================================================

Create exactly 3 major scenes.

Each scene must contain:

title

storyPurpose:
Explain exactly why this scene exists in the story.

time:
Specify the time period, season, time of day,
and approximate chronological position if useful.

location:
Specify the exact physical location.

characters:
List only the characters visible in this scene.

For every visible character specify:

- characterId
- name
- age
- appearance
- clothing
- action
- emotion
- positionInFrame

action:
Describe exactly what is physically happening
at this instant.

emotion:
Describe the emotional state visible on faces
and body language.

environment:
Describe the complete environment.

environment must contain:

- description
- foreground
- background
- props

lighting:
Describe:

- source
- direction
- quality
- mood

composition:
Describe:

- shotType
- cameraAngle
- lens
- depthOfField
- framing

visual:
Write a highly detailed description of exactly
what the image generation model must render.

camera:
Describe the camera perspective for this exact frame.

continuity:
Explicitly describe which character details must
remain consistent with previous scenes.

voice:
Write a short narration corresponding ONLY
to this exact moment.

==================================================
CAMERA RULES
==================================================

Choose camera language appropriate to the scene.

Possible shot types include:

- extreme wide shot
- wide shot
- full shot
- medium shot
- medium close-up
- close-up
- extreme close-up

Possible camera angles include:

- eye level
- low angle
- high angle
- over-the-shoulder
- profile
- three-quarter view

Do not randomly use camera movements.

For an IMAGE, describe the camera position and framing,
not an imaginary video movement.

==================================================
VISUAL ACCURACY RULES
==================================================

The visual description must answer:

WHO is visible?

WHAT are they doing?

WHERE are they?

WHEN is this happening?

WHAT are they wearing?

WHAT do they look like?

WHAT objects are visible?

WHAT is in the foreground?

WHAT is in the background?

WHAT is the lighting?

WHAT is the camera angle?

WHAT emotion is visible?

WHAT must remain consistent with previous scenes?

==================================================
EXAMPLE
==================================================

If the idea is about a poor Egyptian child who grows up
and discovers an ancient Egyptian treasure:

Scene 1 must show ONLY the beginning.

Example concept:

A newborn child inside a poor rural Egyptian home.
The mother is holding the newborn while the father
stands beside her. The room is small and poor,
with mud-brick walls and very limited furniture.
The parents wear simple rural Egyptian clothing.
The scene communicates poverty, family and hope.

Do NOT show the adult version of the child.

Scene 2 must show ONLY the next major event.

The same character is now a young adult working
in an agricultural field. His facial identity,
hair characteristics and recognizable features
must remain consistent with the character bible.
He wears practical rural farming clothes.
The Egyptian agricultural environment is clearly visible.

Do NOT show the newborn.

Scene 3 must show ONLY the discovery.

The same young adult stands inside a newly discovered
ancient underground chamber beneath the agricultural land.
He has just uncovered an entrance to an ancient Egyptian
treasure chamber. Ancient Egyptian statues, stone walls,
hieroglyphics, treasure chests and gold objects are visible.
His face shows genuine shock and amazement.

Do NOT show previous scenes or younger versions.

==================================================
ANTI-GENERIC RULE
==================================================

Never write:

"cinematic scene about..."

"opening cinematic scene..."

"the character faces a challenge..."

"powerful cinematic ending..."

"beautiful cinematic environment..."

unless followed by precise physical details.

Every sentence must provide information useful
to an image generation model.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Do not use markdown.

Do not use code fences.

Do not add explanations before or after the JSON.

Use exactly this structure:

{
  "hook": "short cinematic hook",

  "characters": [
    {
      "characterId": "character_1",
      "name": "Character name",
      "role": "Role in story",
      "age": "Age",
      "appearance": "Detailed physical appearance",
      "faceStructure": "Detailed face structure",
      "skinTone": "Skin tone",
      "hair": "Hair description",
      "eyes": "Eye description",
      "bodyType": "Body type",
      "distinctiveFeatures": "Unique identifying features",
      "clothing": "Detailed clothing",
      "footwear": "Footwear",
      "accessories": "Accessories",
      "personality": "Personality",
      "visualIdentity": "Short continuity identity description"
    }
  ],

  "scenes": [
    {
      "title": "Scene 1",
      "storyPurpose": "Exact narrative purpose",
      "time": "Exact time / period",
      "location": "Exact location",

      "characters": [
        {
          "characterId": "character_1",
          "name": "Character name",
          "age": "Age in this scene",
          "appearance": "Scene-specific appearance",
          "clothing": "Scene-specific clothing",
          "action": "Exact physical action",
          "emotion": "Visible emotion",
          "positionInFrame": "Exact position in frame"
        }
      ],

      "action": "Exact physical event happening at this moment",

      "emotion": "Main emotional state",

      "environment": {
        "description": "Detailed environment",
        "foreground": "Foreground details",
        "background": "Background details",
        "props": [
          "Important prop 1",
          "Important prop 2"
        ]
      },

      "lighting": {
        "source": "Lighting source",
        "direction": "Lighting direction",
        "quality": "Lighting quality",
        "mood": "Lighting mood"
      },

      "composition": {
        "shotType": "Shot type",
        "cameraAngle": "Camera angle",
        "lens": "Lens choice",
        "depthOfField": "Depth of field",
        "framing": "Framing description"
      },

      "visual": "Extremely detailed description of exactly what the camera sees",

      "camera": "Exact camera perspective and framing",

      "continuity": "Character and visual continuity requirements",

      "voice": "Narration for this exact moment"
    },

    {
      "title": "Scene 2",
      "storyPurpose": "Exact narrative purpose",
      "time": "Exact time / period",
      "location": "Exact location",

      "characters": [
        {
          "characterId": "character_1",
          "name": "Character name",
          "age": "Age in this scene",
          "appearance": "Scene-specific appearance",
          "clothing": "Scene-specific clothing",
          "action": "Exact physical action",
          "emotion": "Visible emotion",
          "positionInFrame": "Exact position in frame"
        }
      ],

      "action": "Exact physical event happening at this moment",

      "emotion": "Main emotional state",

      "environment": {
        "description": "Detailed environment",
        "foreground": "Foreground details",
        "background": "Background details",
        "props": [
          "Important prop 1",
          "Important prop 2"
        ]
      },

      "lighting": {
        "source": "Lighting source",
        "direction": "Lighting direction",
        "quality": "Lighting quality",
        "mood": "Lighting mood"
      },

      "composition": {
        "shotType": "Shot type",
        "cameraAngle": "Camera angle",
        "lens": "Lens choice",
        "depthOfField": "Depth of field",
        "framing": "Framing description"
      },

      "visual": "Extremely detailed description of exactly what the camera sees",

      "camera": "Exact camera perspective and framing",

      "continuity": "Character and visual continuity requirements",

      "voice": "Narration for this exact moment"
    },

    {
      "title": "Scene 3",
      "storyPurpose": "Exact narrative purpose",
      "time": "Exact time / period",
      "location": "Exact location",

      "characters": [
        {
          "characterId": "character_1",
          "name": "Character name",
          "age": "Age in this scene",
          "appearance": "Scene-specific appearance",
          "clothing": "Scene-specific clothing",
          "action": "Exact physical action",
          "emotion": "Visible emotion",
          "positionInFrame": "Exact position in frame"
        }
      ],

      "action": "Exact physical event happening at this moment",

      "emotion": "Main emotional state",

      "environment": {
        "description": "Detailed environment",
        "foreground": "Foreground details",
        "background": "Background details",
        "props": [
          "Important prop 1",
          "Important prop 2"
        ]
      },

      "lighting": {
        "source": "Lighting source",
        "direction": "Lighting direction",
        "quality": "Lighting quality",
        "mood": "Lighting mood"
      },

      "composition": {
        "shotType": "Shot type",
        "cameraAngle": "Camera angle",
        "lens": "Lens choice",
        "depthOfField": "Depth of field",
        "framing": "Framing description"
      },

      "visual": "Extremely detailed description of exactly what the camera sees",

      "camera": "Exact camera perspective and framing",

      "continuity": "Character and visual continuity requirements",

      "voice": "Narration for this exact moment"
    }
  ]
}

FINAL CHECK BEFORE RETURNING JSON:

- Exactly 3 scenes.
- Character identities are consistent.
- Each scene contains one moment.
- No mixed ages in one image.
- No random unrelated objects.
- Every scene advances the story.
- Every visual description is concrete and physically visible.
- Every camera description matches the scene.
- Every environment matches the location.
- Every clothing description matches the character and period.
- Scene 2 must logically follow Scene 1.
- Scene 3 must logically follow Scene 2.
`,
  });

  return {
    provider: "Gemini",
    success: true,
    text: response.text ?? "",
  };
}