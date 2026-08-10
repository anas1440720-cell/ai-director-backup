import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const text = body.text;

    if (!text || typeof text !== "string") {
      return Response.json(
        {
          success: false,
          error: "Voice text is required",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error: "GEMINI_API_KEY is missing",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Speak the following narration naturally and emotionally.

Voice direction:
Professional cinematic narrator.
Warm, clear and expressive.
Moderate pacing.
Natural pauses.
Do not add or remove words.

Narration:
${text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Kore",
            },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(
      (item: any) => item.inlineData?.data
    );

    const audioData = part?.inlineData?.data;

    if (!audioData) {
      return Response.json(
        {
          success: false,
          error: "Gemini did not return audio",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      audio: audioData,
      mimeType: part?.inlineData?.mimeType || "audio/wav",
    });
  } catch (error: any) {
    console.error("Gemini Voice Generation Error:", error);

    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to generate voice with Gemini",
      },
      { status: 500 }
    );
  }
}