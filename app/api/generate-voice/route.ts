import { NextResponse } from "next/server";

type VoiceLanguage = "ar" | "en";

type DialogueItem = {
  speakerName?: string;
  characterType?: string;
  line?: string;
};

const ELEVENLABS_VOICE_PRESETS: Record<string, string> = {
  child_female: process.env.ELEVENLABS_VOICE_CHILD_FEMALE || "EXAVITQu4vr4xnSDxMaL",
  child_male: process.env.ELEVENLABS_VOICE_CHILD_MALE || "TX3LPaxmHKxFdv7VOQHJ",
  teenager_female: process.env.ELEVENLABS_VOICE_TEEN_FEMALE || "AZnzlk1XvdvUeBnXmlld",
  teenager_male: process.env.ELEVENLABS_VOICE_TEEN_MALE || "TxGEqnHWrfWFTfGW9XjX",
  adult_female: process.env.ELEVENLABS_VOICE_FEMALE || "EXAVITQu4vr4xnSDxMaL",
  adult_male: process.env.ELEVENLABS_VOICE_MALE || "21m00Tcm4TlvDq8ikWAM",
  default: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function language(value: unknown): VoiceLanguage {
  return value === "en" ? "en" : "ar";
}

function selectVoice(characterProfile = "", speakerName = "") {
  const profile = `${characterProfile} ${speakerName}`.toLowerCase();
  const female = /woman|female|girl|mother|wife|امرأة|فتاة|بنت|أنثى|أم|زوجة/.test(profile);
  const child = /child|kid|boy|طفل|طفلة|ولد|صغير|صغيرة/.test(profile);
  const teen = /teen|teenager|مراهق|مراهقة/.test(profile);

  if (female && child) return ELEVENLABS_VOICE_PRESETS.child_female;
  if (!female && child) return ELEVENLABS_VOICE_PRESETS.child_male;
  if (female && teen) return ELEVENLABS_VOICE_PRESETS.teenager_female;
  if (!female && teen) return ELEVENLABS_VOICE_PRESETS.teenager_male;
  if (female) return ELEVENLABS_VOICE_PRESETS.adult_female;
  return ELEVENLABS_VOICE_PRESETS.adult_male || ELEVENLABS_VOICE_PRESETS.default;
}

async function elevenLabs(text: string, voiceId: string, lang: VoiceLanguage) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is missing.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          language_code: lang,
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
        cache: "no-store",
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`ElevenLabs failed (${response.status}): ${details}`);
    }

    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength) throw new Error("ElevenLabs returned empty audio.");

    return {
      audio: `data:audio/mp3;base64,${Buffer.from(buffer).toString("base64")}`,
      mimeType: "audio/mpeg",
      provider: "elevenlabs" as const,
      voiceId,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function existingAudio(body: Record<string, unknown>) {
  for (const value of [body.existingAudio, body.audioUrl, body.audioUri, body.generatedAudio]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const body = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    const lang = language(body.voiceLanguage);

    const reused = existingAudio(body);
    if (reused) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reused: true,
        provider: "asset-reuse",
        audio: reused,
        audioUrl: reused,
        audioUri: reused,
        voiceLanguage: lang,
        assetsGenerated: true,
      });
    }

    const dialogues = Array.isArray(body.dialogues) ? body.dialogues as DialogueItem[] : [];

    if (dialogues.length) {
      const clips = [];
      for (const item of dialogues) {
        const line = clean(item.line);
        if (!line) continue;
        const speakerName = clean(item.speakerName) || "Character";
        const characterType = clean(item.characterType) || "adult_male";
        const result = await elevenLabs(line, selectVoice(characterType, speakerName), lang);
        clips.push({
          speakerName,
          characterType,
          line,
          audio: result.audio,
          mimeType: result.mimeType,
          provider: result.provider,
          voiceId: result.voiceId,
        });
      }

      if (!clips.length) {
        return NextResponse.json({
          success: true,
          skipped: true,
          provider: null,
          audio: null,
          audioUrl: null,
          voiceLanguage: lang,
          assetsGenerated: false,
          code: "VOICE_NOT_REQUIRED",
        });
      }

      if (clips.length === 1) {
        return NextResponse.json({
          success: true,
          skipped: false,
          reused: false,
          multiVoice: false,
          ...clips[0],
          audioUrl: clips[0].audio,
          audioUri: clips[0].audio,
          voiceLanguage: lang,
          assetsGenerated: true,
        });
      }

      return NextResponse.json({
        success: true,
        skipped: false,
        reused: false,
        multiVoice: true,
        clips,
        provider: "elevenlabs",
        voiceLanguage: lang,
        assetsGenerated: true,
      });
    }

    const text = clean(body.text);
    if (!text) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reused: false,
        code: "VOICE_NOT_REQUIRED",
        provider: null,
        audio: null,
        audioUrl: null,
        audioUri: null,
        voiceLanguage: lang,
        assetsGenerated: false,
      });
    }

    const characterProfile = clean(body.characterProfile) || clean(body.gender) || clean(body.age);
    const result = await elevenLabs(text, selectVoice(characterProfile), lang);

    return NextResponse.json({
      success: true,
      skipped: false,
      reused: false,
      multiVoice: false,
      provider: "elevenlabs",
      audio: result.audio,
      audioUrl: result.audio,
      audioUri: result.audio,
      mimeType: result.mimeType,
      voiceLanguage: lang,
      voiceId: result.voiceId,
      assetsGenerated: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ ElevenLabs voice generation failed:", message);
    return NextResponse.json({
      success: false,
      skipped: true,
      code: "VOICE_GENERATION_FAILED",
      provider: "elevenlabs",
      audio: null,
      audioUrl: null,
      audioUri: null,
      message,
    }, { status: 502 });
  }
}
