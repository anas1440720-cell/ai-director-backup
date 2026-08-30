import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import Groq from "groq-sdk";

export type AIProvider =
  | "groq"
  | "openai"
  | "gemini"
  | "claude";

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
    id: "groq",
    name: "Groq Llama / GPT-OSS",
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

export type DirectorOptions = {
  videoType: string;
  audience: string;
  goal: string;
  character: string;
  style: string;
  voiceLanguage: "ar" | "en";
  aspectRatio: "9:16" | "16:9";
};

/**
 * ============================================================
 * SCENE DURATION
 * ============================================================
 *
 * deAPI LTX-Video 13B accepts a maximum of 4 seconds
 * per generated video clip.
 *
 * The total requested duration is preserved exactly.
 *
 * Examples:
 *
 * 5s  -> 3s + 2s
 * 10s -> 4s + 3s + 3s
 * 15s -> 4s + 4s + 4s + 3s
 * 20s -> 4s + 4s + 4s + 4s + 4s
 */

export function calculateSceneDurations(
  totalDuration: number
): number[] {
  const safeDuration = Math.max(
    5,
    Math.round(Number(totalDuration) || 5)
  );

  const MAX_SCENE_DURATION = 4;

  const sceneCount = Math.ceil(
    safeDuration / MAX_SCENE_DURATION
  );

  const base = Math.floor(
    safeDuration / sceneCount
  );

  const remainder =
    safeDuration % sceneCount;

  return Array.from(
    { length: sceneCount },
    (_, index) =>
      base +
      (index < remainder ? 1 : 0)
  );
}

/**
 * ============================================================
 * GEMINI CLIENT
 * ============================================================
 */

function getGeminiClient(): GoogleGenAI {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing from .env.local"
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

/**
 * ============================================================
 * GROQ CLIENT
 * ============================================================
 */

function getGroqClient(): Groq {
  const apiKey =
    process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is missing from .env.local"
    );
  }

  return new Groq({
    apiKey,
  });
}

/**
 * ============================================================
 * STORY PROMPT
 * ============================================================
 */

function buildStoryPrompt(
  idea: string,
  duration: number,
  options: DirectorOptions
): string {
  const sceneDurations =
    calculateSceneDurations(duration);

  const sceneCount =
    sceneDurations.length;

  const outputLanguage =
    options.voiceLanguage === "en"
      ? "ENGLISH"
      : "ARABIC";

  const durationPlan =
    sceneDurations
      .map(
        (d, index) =>
          `Scene ${index + 1}: ${d}s`
      )
      .join("\n");

  return `
You are an ELITE CINEMATIC FILM DIRECTOR, SCREENWRITER, ACTING DIRECTOR, STORYBOARD DIRECTOR, AND IMAGE-TO-VIDEO MOTION SUPERVISOR.

Your job is to transform the user's idea into a coherent multi-scene cinematic film designed for actual visual execution.

The production pipeline is:

STORY
→ IMAGE KEYFRAMES
→ IMAGE-TO-VIDEO
→ ELEVENLABS VOICE
→ SFX
→ MUSIC
→ FINAL EDIT

The story must therefore be designed for short, executable cinematic scenes.

==================================================
USER IDEA
==================================================

${idea}

==================================================
PRODUCTION SETTINGS
==================================================

REQUESTED TOTAL DURATION:
${duration} seconds

EXACT SCENE COUNT:
${sceneCount}

EXACT SCENE DURATION PLAN:
${durationPlan}

Video Type:
${options.videoType}

Target Audience:
${options.audience}

Goal:
${options.goal}

Character Type:
${options.character}

Visual Style:
${options.style || "Realistic"}

Voice Language:
${
  options.voiceLanguage === "en"
    ? "English"
    : "Arabic"
}

Aspect Ratio:
${options.aspectRatio}

==================================================
OUTPUT LANGUAGE — ABSOLUTE
==================================================

Every natural-language value MUST be written in ${outputLanguage}.

JSON keys MUST remain in English.

Character names must be written in ${outputLanguage}.

Dialogue must be written in ${outputLanguage}.

Scene descriptions must be written in ${outputLanguage}.

Visual descriptions must be written in ${outputLanguage}.

Action descriptions must be written in ${outputLanguage}.

Do NOT mix Arabic and English natural-language content.

English is allowed only for JSON keys and fixed enum values such as:

male
female
child_male
child_female
teenager_male
teenager_female
adult_male
adult_female

==================================================
CORE CINEMATIC RULE
==================================================

EVERY SCENE MUST BE A REAL STORY EVENT.

The film must feel like characters are actually living through events.

NEVER create scenes that are merely:

- character showcases
- portraits
- beauty shots
- poses
- character introductions without action
- characters standing and looking at camera
- generic walking
- generic smiling
- generic waving
- decorative camera movement
- idle animation

The camera must OBSERVE AN EVENT.

The character must PERFORM AN EVENT.

==================================================
MANDATORY EVENT STRUCTURE
==================================================

Every scene MUST contain:

CAUSE
→ TRIGGER
→ PHYSICAL ACTION
→ INTERACTION
→ REACTION
→ CONSEQUENCE
→ TRANSITION

The event must be physically understandable.

The viewer must be able to understand:

1. What was happening.
2. What changed.
3. What caused the change.
4. What the character physically did.
5. What the character interacted with.
6. How another character or environment reacted.
7. What changed as a result.
8. Why the next scene begins where it does.

==================================================
SCENE ACTING REQUIREMENTS
==================================================

Characters should perform meaningful physical actions such as:

- walking with purpose
- running when appropriate
- stopping
- turning
- crouching
- leaning
- reaching
- grabbing
- releasing
- opening
- closing
- pushing
- pulling
- picking up
- dropping
- pointing
- stepping backward
- stepping forward
- approaching
- retreating
- looking toward an object
- looking toward another character
- exchanging meaningful glances
- reacting to unexpected events
- manipulating objects
- touching surfaces
- moving around obstacles
- responding to environmental changes

Every movement MUST have a narrative reason.

==================================================
PHYSICAL ACTING
==================================================

Describe emotions through visible physical performance.

Bad:

"Character is surprised."

Good:

"Character notices the glowing object, stops mid-step, widens their eyes, leans backward, raises one hand defensively, then looks toward the other child for confirmation."

Emotion must be visible through:

- facial expression
- eye direction
- head movement
- body posture
- weight shift
- hand movement
- movement through space
- reaction timing

Avoid abstract emotional descriptions without physical acting.

==================================================
ANTI-CHARACTER-SHOWCASE RULE
==================================================

STRICTLY FORBIDDEN:

- stationary character posing
- character looking at camera
- character smiling at camera
- beauty shots
- portrait animation
- character presentation shots
- slow generic walking
- walking toward camera without story purpose
- waving without narrative reason
- random hand gestures
- random head movement
- generic idle movement
- characters staring at each other without interaction
- camera orbit around stationary characters
- cinematic camera movement without story action
- animation that does not change the story

If a scene can be described as "the character looks cool", it is WRONG.

==================================================
CHARACTER COUNT
==================================================

Use 1 or 2 main characters.

Do not unnecessarily create many characters.

If the story works naturally with two children, prefer two children.

If one character is sufficient, use one.

==================================================
CHARACTER CONTINUITY — ABSOLUTE
==================================================

Create immutable Visual DNA for every main character.

For every main character define:

- exact age
- gender
- skin tone
- face shape
- hairstyle
- hair color
- eye color
- body proportions
- clothing
- clothing colors
- shoes
- accessories
- distinctive visual traits

These properties are IMMUTABLE.

They MUST NOT change between scenes.

Never change:

- face
- facial structure
- age appearance
- gender
- hairstyle
- hair color
- eye color
- skin tone
- body proportions
- clothing
- clothing colors
- shoes
- accessories
- distinctive traits

==================================================
SCENE CHARACTER CONTINUITY
==================================================

Every scene MUST contain a "characters" array.

Every scene character entry MUST repeat:

- character identity
- exact appearance
- exact clothing
- current action
- current emotion
- current position in frame

Do NOT omit these details.

The scene character data is used by downstream image and video prompt generation.

==================================================
ENVIRONMENT CONTINUITY
==================================================

Every scene MUST contain:

"location"

and

"environment": {
  "description": "...",
  "objects": "...",
  "lighting": "...",
  "timeOfDay": "..."
}

The environment must remain logically consistent between scenes unless the story explicitly changes location.

Characters must physically exist inside the environment.

They must not appear pasted onto the background.

==================================================
ENVIRONMENT INTERACTION
==================================================

When appropriate, characters should physically:

- touch walls
- open doors
- step around objects
- pick up objects
- push objects
- pull objects
- touch surfaces
- move around obstacles
- interact with weather
- react to light
- interact with magical elements
- affect objects
- cause environmental changes

The environment must participate in the story.

==================================================
IMAGE KEYFRAME
==================================================

The "visual" field is the source image keyframe.

It is NOT a character portrait.

It MUST show a meaningful story moment.

The visual description MUST include:

- exact character identity
- exact clothing
- current physical action
- current pose
- current interaction
- environment
- important objects
- emotional state
- spatial relationship
- cinematic composition
- lighting
- selected visual style
- ${options.aspectRatio} composition
- no text
- no subtitles
- no watermark
- natural anatomy
- natural hands
- natural body posture

The source image will later become the first frame of image-to-video generation.

Therefore the image must visually represent the event itself.

==================================================
VIDEO MOTION COMPATIBILITY
==================================================

Every scene must be executable as a short image-to-video shot.

Avoid too many unrelated events.

A single scene should contain ONE coherent event with connected acting beats.

Example:

Child walks toward glowing object
→ notices it floating
→ slows down
→ reaches toward it
→ object reacts
→ child pulls hand back
→ second child approaches
→ both react to the changed object.

This is GOOD.

Do NOT compress unrelated events into one scene.

==================================================
SCENE BEATS
==================================================

For every scene internally construct:

BEAT 1 — INITIAL STATE

What is physically happening at the beginning?

BEAT 2 — TRIGGER

What changes the situation?

BEAT 3 — ACTION

What does the character physically do?

BEAT 4 — INTERACTION

What object, character, or environment is affected?

BEAT 5 — REACTION

How does the character or environment physically react?

BEAT 6 — CONSEQUENCE

What changes because of the action?

BEAT 7 — TRANSITION

What final visual state naturally leads into the next scene?

The final "action" field MUST combine the seven beats into one concise chronological physical performance.

==================================================
CAMERA
==================================================

The camera must observe the event.

Camera movement is SECONDARY to acting.

Use only purposeful camera movement such as:

- tracking
- lateral tracking
- dolly
- push-in
- pull-back
- over-the-shoulder
- reaction close-up
- environmental reveal
- low angle
- crane
- controlled handheld follow

Camera movement must support the event.

Never use camera movement to hide weak acting.

==================================================
VOICE
==================================================

Dialogue is optional.

Do NOT create dialogue merely to fill silence.

If dialogue is unnecessary:

"dialogue": []

If dialogue exists, it MUST:

- belong to the correct character
- match the character's age
- match the emotional state
- be relevant to the event
- fit the scene duration
- be natural
- be written entirely in ${outputLanguage}

Do NOT write narration unless genuinely required.

==================================================
AUDIO ARCHITECTURE
==================================================

The image-to-video provider is VISUAL ONLY.

The video generation prompt MUST NOT request:

- speech
- dialogue
- narration
- music
- singing
- lyrics
- sound effects
- audio generation

The video provider must produce silent visual footage.

Dialogue belongs to ElevenLabs.

SFX belongs to the SFX pipeline.

Music belongs to the music pipeline.

Therefore:

"dialogue" describes only intended spoken dialogue.

"sfxPrompt" describes only sounds caused by visible actions.

"musicMood" describes only emotional background music.

Never place spoken dialogue inside:

- musicMood
- sfxPrompt
- action
- visual

==================================================
SFX
==================================================

"sfxPrompt" must describe only sounds caused by visible physical actions.

Examples:

- footsteps on pavement
- child touching metal
- object falling
- wooden door opening
- fabric movement
- wind moving through alley
- magical energy pulsing
- footsteps approaching
- glass breaking

Do not create generic SFX unrelated to visible actions.

==================================================
MUSIC
==================================================

"musicMood" describes ONLY background emotional music.

Examples:

- mysterious magical tension
- warm childhood wonder
- urgent adventure
- quiet suspense
- emotional discovery

Do NOT put dialogue or narration inside musicMood.

==================================================
CONTINUITY
==================================================

Every scene must logically continue from the previous scene.

Scene N ending MUST create the physical starting condition of Scene N+1.

Do not reset:

- character positions
- clothing
- props
- environment
- lighting
- time of day

unless the story explicitly causes the change.

==================================================
STYLE — ABSOLUTE
==================================================

The selected style is FINAL.

Selected Visual Style:

${options.style || "Realistic"}

Every visual description MUST respect this style.

Do NOT:

- reinterpret the style
- weaken the style
- mix styles
- switch rendering medium
- turn realistic into animation
- turn animation into photorealism
- add unrelated visual aesthetics

The visual style must remain consistent across every scene.

==================================================
SCENE DURATION
==================================================

Respect this EXACT schedule:

${durationPlan}

Do not change scene durations.

Do not create additional scenes.

Do not remove scenes.

Do not merge scenes.

Each scene duration MUST exactly match the schedule.

Each scene duration MUST be between 1 and 4 seconds.

==================================================
OUTPUT JSON
==================================================

Return ONLY valid JSON.

No markdown.

No code fences.

No commentary.

No explanations.

No extra keys outside the schema.

Schema:

{
  "hook": "Cinematic hook sentence",

  "characters": [
    {
      "characterId": "char_1",
      "name": "Character Name",
      "gender": "male / female",
      "voiceType": "child_male / child_female / teenager_male / teenager_female / adult_male / adult_female",
      "age": "Exact age",
      "appearance": "Full immutable visual DNA",
      "clothing": "Exact immutable outfit",
      "visualIdentity": "Signature immutable traits"
    }
  ],

  "scenes": [
    {
      "title": "Scene 1",

      "duration": ${sceneDurations[0]},

      "storyPurpose": "Specific narrative purpose of this event",

      "sceneObjective": "What the character wants to accomplish in this scene",

      "action": "Chronological physical acting sequence containing initial state, trigger, action, interaction, reaction, consequence and transition",

      "interaction": "Specific physical interaction between character, object, environment or another character",

      "reaction": "Specific visible physical and emotional reaction caused by the event",

      "movement": "Specific purposeful movement through physical space",

      "emotion": "Emotional progression expressed through facial expression and body language",

      "environmentInteraction": "How the characters physically interact with the environment",

      "continuity": "How this scene connects from the previous scene and leads into the next scene",

      "location": "Specific physical location",

      "environment": {
        "description": "Detailed physical environment",
        "objects": "Important physical objects and props",
        "lighting": "Lighting conditions",
        "timeOfDay": "Time of day"
      },

      "characters": [
        {
          "characterId": "char_1",
          "name": "Character Name",
          "appearance": "Exact immutable appearance repeated from character DNA",
          "clothing": "Exact immutable clothing repeated from character DNA",
          "action": "Exact physical action performed in this scene",
          "emotion": "Current emotional state expressed physically",
          "positionInFrame": "Specific physical position in the environment and frame"
        }
      ],

      "sfxPrompt": "Sounds caused only by visible physical actions",

      "musicMood": "Background cinematic music mood only",

      "visual": "Cinematic source image keyframe showing the exact immutable character DNA performing the actual story event, interacting with the environment and props, with the correct emotional state and physical pose, ${options.aspectRatio} composition, selected visual style, no text, no subtitles, no watermark",

      "camera": "Cinematic camera movement that clearly observes and supports the physical event",

      "dialogue": [
        {
          "speakerName": "Character Name",
          "characterType": "child_male / child_female / teenager_male / teenager_female / adult_male / adult_female",
          "line": "Natural spoken line in ${outputLanguage}"
        }
      ]
    }
  ]
}

==================================================
FINAL QUALITY CHECK
==================================================

Before returning the JSON, internally verify:

1. Exact requested total duration is preserved.
2. Scene count exactly equals ${sceneCount}.
3. Every scene duration matches the schedule.
4. No scene exceeds 4 seconds.
5. Every scene is a real story event.
6. Every scene has cause → trigger → action → interaction → reaction → consequence.
7. Every scene has purposeful movement.
8. Every scene contains scene.characters.
9. Every scene contains location.
10. Every scene contains environment.
11. Character DNA is identical across scenes.
12. Clothing never changes.
13. Faces never change.
14. Hair never changes.
15. Eye color never changes.
16. Body proportions never change.
17. Visual style never changes.
18. Scene N leads naturally into Scene N+1.
19. Visual keyframes show events, not portraits.
20. Dialogue is relevant and optional.
21. SFX describe visible actions only.
22. musicMood contains no dialogue.
23. Image-to-video receives visual instructions only.
24. No speech, music, narration or SFX is requested from the video provider.
25. No text, subtitles or watermark are requested.
26. All natural-language content uses ${outputLanguage}.
27. Every scene is executable within its exact duration.
28. Do not create multiple unrelated actions inside one short clip.

Return the final JSON only.
`.trim();
}

/**
 * ============================================================
 * GROQ STORY GENERATION
 * ============================================================
 */

async function generateWithGroq(
  idea: string,
  duration: number,
  options: DirectorOptions
): Promise<GenerateStoryResult> {
  const prompt =
    buildStoryPrompt(
      idea,
      duration,
      options
    );

  try {
    const groq =
      getGroqClient();

    const completion =
      await groq.chat.completions.create({
        model:
          "llama-3.3-70b-versatile",

        temperature: 0.7,

        response_format: {
          type: "json_object",
        },

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const text =
      completion
        .choices?.[0]
        ?.message
        ?.content ?? "";

    if (!text.trim()) {
      throw new Error(
        "Groq returned empty text."
      );
    }

    return {
      provider: "Groq",
      success: true,
      text,
    };
  } catch (error) {
    console.error(
      "Groq generation failed:",
      error
    );

    return {
      provider: "Groq",
      success: false,
      text: "",
      message:
        error instanceof Error
          ? error.message
          : "Groq failed",
    };
  }
}

/**
 * ============================================================
 * GEMINI STORY GENERATION
 * ============================================================
 */

async function generateWithGemini(
  idea: string,
  duration: number,
  options: DirectorOptions
): Promise<GenerateStoryResult> {
  /*
   * Keep the model list conservative.
   *
   * Do not blindly cycle through multiple models when a
   * quota/rate-limit error occurs. That can waste quota and
   * make one failed request turn into several failed requests.
   */

  const fallbackModels = [
  "gemini-3.6-flash",
];

  const prompt =
    buildStoryPrompt(
      idea,
      duration,
      options
    );

  let lastError: unknown = null;

  const gemini =
    getGeminiClient();

  const safetySettings = [
    {
      category:
        HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold:
        HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category:
        HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold:
        HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category:
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold:
        HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category:
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold:
        HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  for (const modelName of fallbackModels) {
    try {
      console.log(
        `Gemini story generation using model: ${modelName}`
      );

      const response =
        await gemini.models.generateContent({
          model: modelName,

          contents: prompt,

          config: {
  responseMimeType: "application/json",

  responseSchema: {
    type: "OBJECT",
    properties: {
      hook: {
        type: "STRING",
      },

      characters: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            characterId: {
              type: "STRING",
            },
            name: {
              type: "STRING",
            },
            gender: {
              type: "STRING",
            },
            voiceType: {
              type: "STRING",
            },
            age: {
              type: "STRING",
            },
            appearance: {
              type: "STRING",
            },
            clothing: {
              type: "STRING",
            },
            visualIdentity: {
              type: "STRING",
            },
          },
          required: [
            "characterId",
            "name",
            "gender",
            "voiceType",
            "age",
            "appearance",
            "clothing",
            "visualIdentity",
          ],
        },
      },

      scenes: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: {
              type: "STRING",
            },

            duration: {
              type: "NUMBER",
            },

            storyPurpose: {
              type: "STRING",
            },

            sceneObjective: {
              type: "STRING",
            },

            action: {
              type: "STRING",
            },

            interaction: {
              type: "STRING",
            },

            reaction: {
              type: "STRING",
            },

            movement: {
              type: "STRING",
            },

            emotion: {
              type: "STRING",
            },

            environmentInteraction: {
              type: "STRING",
            },

            continuity: {
              type: "STRING",
            },

            location: {
              type: "STRING",
            },

            environment: {
              type: "OBJECT",
              properties: {
                description: {
                  type: "STRING",
                },
                objects: {
                  type: "STRING",
                },
                lighting: {
                  type: "STRING",
                },
                timeOfDay: {
                  type: "STRING",
                },
              },
              required: [
                "description",
                "objects",
                "lighting",
                "timeOfDay",
              ],
            },

            characters: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  characterId: {
                    type: "STRING",
                  },
                  name: {
                    type: "STRING",
                  },
                  appearance: {
                    type: "STRING",
                  },
                  clothing: {
                    type: "STRING",
                  },
                  action: {
                    type: "STRING",
                  },
                  emotion: {
                    type: "STRING",
                  },
                  positionInFrame: {
                    type: "STRING",
                  },
                },
                required: [
                  "characterId",
                  "name",
                  "appearance",
                  "clothing",
                  "action",
                  "emotion",
                  "positionInFrame",
                ],
              },
            },

            sfxPrompt: {
              type: "STRING",
            },

            musicMood: {
              type: "STRING",
            },

            visual: {
              type: "STRING",
            },

            camera: {
              type: "STRING",
            },

            dialogue: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  speakerName: {
                    type: "STRING",
                  },
                  characterType: {
                    type: "STRING",
                  },
                  line: {
                    type: "STRING",
                  },
                },
                required: [
                  "speakerName",
                  "characterType",
                  "line",
                ],
              },
            },
          },

          required: [
            "title",
            "duration",
            "storyPurpose",
            "sceneObjective",
            "action",
            "interaction",
            "reaction",
            "movement",
            "emotion",
            "environmentInteraction",
            "continuity",
            "location",
            "environment",
            "characters",
            "sfxPrompt",
            "musicMood",
            "visual",
            "camera",
            "dialogue",
          ],
        },
      },
    },

    required: [
      "hook",
      "characters",
      "scenes",
    ],
  },

  temperature: 0.7,

  safetySettings:
    safetySettings as any,
},
        });

      let text = "";

      if (
        typeof (response as any)?.text ===
        "function"
      ) {
        text =
          (response as any).text();
      } else if (
        typeof (response as any)?.text ===
        "string"
      ) {
        text =
          (response as any).text;
      } else if (
        (
          response as any
        )?.candidates?.[0]
          ?.content?.parts?.[0]
          ?.text
      ) {
        text =
          (
            response as any
          ).candidates[0]
            .content.parts[0].text;
      }

      if (
        typeof text === "string" &&
        text.trim()
      ) {
        console.log(
          `Gemini story generation succeeded with ${modelName}`
        );

        return {
          provider:
            `Gemini (${modelName})`,
          success: true,
          text,
        };
      }

      throw new Error(
        `Gemini ${modelName} returned empty text.`
      );
    } catch (error) {
      lastError = error;

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.warn(
        `Gemini model ${modelName} failed:`,
        message
      );

      /*
       * IMPORTANT QUOTA PROTECTION:
       *
       * If Gemini reports a rate-limit/quota/exhaustion
       * condition, stop trying additional Gemini models.
       *
       * Switching models inside the same exhausted project
       * is not a reliable quota recovery strategy and can
       * create unnecessary API requests.
       */
      const lowerMessage =
        message.toLowerCase();

      const isQuotaError =
        lowerMessage.includes("429") ||
        lowerMessage.includes(
          "resource_exhausted"
        ) ||
        lowerMessage.includes(
          "resource exhausted"
        ) ||
        lowerMessage.includes(
          "rate limit"
        ) ||
        lowerMessage.includes(
          "quota"
        ) ||
        lowerMessage.includes(
          "too many requests"
        );

      if (isQuotaError) {
        console.warn(
          "Gemini quota/rate-limit detected. Stopping Gemini fallback attempts."
        );

        break;
      }
    }
  }

  /*
   * ==========================================================
   * GROQ FALLBACK
   * ==========================================================
   *
   * Only use Groq if:
   *
   * 1. Gemini failed completely.
   * 2. GROQ_API_KEY exists.
   *
   * This keeps Groq as a controlled fallback rather than
   * sending duplicate Gemini requests.
   */

  if (
    process.env.GROQ_API_KEY
  ) {
    console.warn(
      "Gemini failed. Falling back to Groq."
    );

    return generateWithGroq(
      idea,
      duration,
      options
    );
  }

  console.error(
    "Gemini generation failed completely:",
    lastError
  );

  return {
    provider: "Gemini",
    success: false,
    text: "",
    message:
      lastError instanceof Error
        ? lastError.message
        : "Gemini story generation failed",
  };
}

/**
 * ============================================================
 * PUBLIC STORY GENERATOR
 * ============================================================
 */

export async function generateStory(
  provider: AIProvider,
  idea: string,
  duration: number,
  options: DirectorOptions
): Promise<GenerateStoryResult> {
  if (
    provider === "groq"
  ) {
    return generateWithGroq(
      idea,
      duration,
      options
    );
  }

  /*
   * OpenAI and Claude are not enabled.
   *
   * Gemini remains the default provider.
   */
  return generateWithGemini(
    idea,
    duration,
    options
  );
}