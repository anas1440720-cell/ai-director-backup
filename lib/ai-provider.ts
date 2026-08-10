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

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

Use exactly this structure:

{
  "hook": "short cinematic hook",
  "scenes": [
    {
      "title": "Scene 1",
      "visual": "detailed visual description",
      "camera": "camera direction",
      "voice": "voice narration"
    },
    {
      "title": "Scene 2",
      "visual": "detailed visual description",
      "camera": "camera direction",
      "voice": "voice narration"
    },
    {
      "title": "Scene 3",
      "visual": "detailed visual description",
      "camera": "camera direction",
      "voice": "voice narration"
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