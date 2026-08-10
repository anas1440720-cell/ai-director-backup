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
You are an AI Hollywood Director.

Create a cinematic story from the user's idea.

IMPORTANT CINEMATIC SCENE RULES:

1. Each scene represents ONE specific moment in time.
2. NEVER combine multiple time periods, ages, locations, or major events inside one scene.
3. NEVER use transitions such as "years later", "as he grows", "transition to", "match-cut to", or similar language inside the visual description.
4. Scene 1 must show ONLY the beginning event.
5. Scene 2 must show ONLY the next major event.
6. Scene 3 must show ONLY the final major event.
7. If the story contains a character growing from child to adult, do NOT show the child and adult in the same image.
8. Every scene must be visually independent and suitable for generating ONE single image.
9. The visual description must describe exactly what the camera sees at that moment.
10. Maintain character identity and visual continuity between scenes.

For example, if the story is about a poor child who later discovers treasure:

Scene 1 = only the newborn/poor family at the beginning.
Scene 2 = only the older child or young man working in the field.
Scene 3 = only the young man discovering the hidden treasure.

Do NOT put the newborn and older child in the same image.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

Use exactly this structure:

{
  "hook": "short cinematic hook",
  "scenes": [
    {
      "title": "Scene 1",
      "visual": "ONE specific moment only. Describe exactly what is visible in this single frame.",
      "camera": "camera direction for this exact moment",
      "voice": "voice narration for this exact moment"
    },
    {
      "title": "Scene 2",
      "visual": "ONE specific moment only. Describe exactly what is visible in this single frame.",
      "camera": "camera direction for this exact moment",
      "voice": "voice narration for this exact moment"
    },
    {
      "title": "Scene 3",
      "visual": "ONE specific moment only. Describe exactly what is visible in this single frame.",
      "camera": "camera direction for this exact moment",
      "voice": "voice narration for this exact moment"
    }
  ]
}

User idea:
${idea}
`,
  });

  return {
    provider: "Gemini",
    success: true,
    text: response.text ?? "",
  };
}