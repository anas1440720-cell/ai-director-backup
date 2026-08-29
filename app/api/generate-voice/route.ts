import { NextResponse } from "next/server";

// ========================================================
// VOICE GENERATION ENGINE
// ========================================================
//
// Architecture:
//
// Arabic:
//   Munsit -> primary
//   ElevenLabs -> fallback
//
// English:
//   ElevenLabs only
//
// IMPORTANT:
//   - Video generation is silent.
//   - This endpoint owns spoken dialogue.
//   - Generated audio is returned as an asset.
//   - Existing generated audio can be reused.
//   - No provider is called when there is nothing to say.
// ========================================================

type VoiceLanguage = "ar" | "en";

type DialogueItem = {
  speakerName?: string;
  characterType?: string;
  line?: string;
};

type VoiceResult = {
  audio: string;
  mimeType: string;
  provider: "munsit" | "elevenlabs";
  voiceId?: string;
};

type VoicePresetMap = Record<string, string>;

// ========================================================
// ELEVENLABS VOICE PRESETS
// ========================================================

const ELEVENLABS_VOICE_PRESETS: VoicePresetMap = {
  child_female:
    process.env.ELEVENLABS_VOICE_CHILD_FEMALE ||
    "EXAVITQu4vr4xnSDxMaL",

  child_male:
    process.env.ELEVENLABS_VOICE_CHILD_MALE ||
    "TX3LPaxmHKxFdv7VOQHJ",

  child:
    process.env.ELEVENLABS_VOICE_CHILD ||
    "EXAVITQu4vr4xnSDxMaL",

  teenager_female:
    process.env.ELEVENLABS_VOICE_TEEN_FEMALE ||
    "AZnzlk1XvdvUeBnXmlld",

  teenager_male:
    process.env.ELEVENLABS_VOICE_TEEN_MALE ||
    "TxGEqnHWrfWFTfGW9XjX",

  teenager:
    process.env.ELEVENLABS_VOICE_TEEN ||
    "AZnzlk1XvdvUeBnXmlld",

  young_male:
    process.env.ELEVENLABS_VOICE_YOUNG_MALE ||
    "TxGEqnHWrfWFTfGW9XjX",

  adult_male:
    process.env.ELEVENLABS_VOICE_MALE ||
    "21m00Tcm4TlvDq8ikWAM",

  adult_female:
    process.env.ELEVENLABS_VOICE_FEMALE ||
    "EXAVITQu4vr4xnSDxMaL",

  default:
    process.env.ELEVENLABS_VOICE_ID ||
    "21m00Tcm4TlvDq8ikWAM",
};

// ========================================================
// MUNSIT VOICE PRESETS
// ========================================================

const MUNSIT_VOICE_PRESETS: VoicePresetMap = {
  adult_male:
    process.env.MUNSIT_VOICE_MALE ||
    "ar-najdi-male-2",

  adult_female:
    process.env.MUNSIT_VOICE_FEMALE ||
    "ar-fusha-female-1",

  child_male:
    process.env.MUNSIT_VOICE_CHILD_MALE ||
    process.env.MUNSIT_VOICE_MALE ||
    "ar-najdi-male-2",

  child_female:
    process.env.MUNSIT_VOICE_CHILD_FEMALE ||
    process.env.MUNSIT_VOICE_FEMALE ||
    "ar-fusha-female-1",

  teenager_male:
    process.env.MUNSIT_VOICE_TEEN_MALE ||
    process.env.MUNSIT_VOICE_MALE ||
    "ar-najdi-male-2",

  teenager_female:
    process.env.MUNSIT_VOICE_TEEN_FEMALE ||
    process.env.MUNSIT_VOICE_FEMALE ||
    "ar-fusha-female-1",

  young_male:
    process.env.MUNSIT_VOICE_YOUNG_MALE ||
    process.env.MUNSIT_VOICE_MALE ||
    "ar-najdi-male-2",

  default:
    process.env.MUNSIT_VOICE_ID ||
    process.env.MUNSIT_VOICE_MALE ||
    "ar-najdi-male-2",
};

// ========================================================
// NORMALIZATION
// ========================================================

function normalizeLanguage(
  value: unknown
): VoiceLanguage {
  return value === "en" ? "en" : "ar";
}

function cleanText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getCombinedCharacterProfile(
  characterProfile?: string,
  speakerName?: string
): string {
  return `${characterProfile || ""} ${
    speakerName || ""
  }`
    .trim()
    .toLowerCase();
}

// ========================================================
// CHARACTER -> ELEVENLABS VOICE
// ========================================================

function selectElevenLabsVoiceId(
  characterProfile?: string,
  speakerName?: string
): string {
  const combined =
    getCombinedCharacterProfile(
      characterProfile,
      speakerName
    );

  if (!combined) {
    return ELEVENLABS_VOICE_PRESETS.default;
  }

  const isFemale =
    combined.includes("woman") ||
    combined.includes("female") ||
    combined.includes("girl") ||
    combined.includes("mother") ||
    combined.includes("wife") ||
    combined.includes("امرأة") ||
    combined.includes("فتاة") ||
    combined.includes("بنت") ||
    combined.includes("أنثى") ||
    combined.includes("أم") ||
    combined.includes("زوجة") ||
    combined.includes("سلمى") ||
    combined.includes("سارة") ||
    combined.includes("ليلى") ||
    combined.includes("مريم") ||
    combined.includes("نور");

  const isChild =
    combined.includes("child") ||
    combined.includes("kid") ||
    combined.includes("boy") ||
    combined.includes("طفل") ||
    combined.includes("طفلة") ||
    combined.includes("ولد") ||
    combined.includes("صغير") ||
    combined.includes("صغيرة");

  const isTeen =
    combined.includes("teen") ||
    combined.includes("teenager") ||
    combined.includes("مراهق") ||
    combined.includes("مراهقة");

  if (isFemale && isChild) {
    return ELEVENLABS_VOICE_PRESETS.child_female;
  }

  if (!isFemale && isChild) {
    return ELEVENLABS_VOICE_PRESETS.child_male;
  }

  if (isFemale && isTeen) {
    return ELEVENLABS_VOICE_PRESETS.teenager_female;
  }

  if (!isFemale && isTeen) {
    return ELEVENLABS_VOICE_PRESETS.teenager_male;
  }

  if (isFemale) {
    return ELEVENLABS_VOICE_PRESETS.adult_female;
  }

  if (
    combined.includes("young") ||
    combined.includes("شاب") ||
    combined.includes("شابة")
  ) {
    return ELEVENLABS_VOICE_PRESETS.young_male;
  }

  if (
    combined.includes("man") ||
    combined.includes("male") ||
    combined.includes("father") ||
    combined.includes("رجل") ||
    combined.includes("عجوز") ||
    combined.includes("أب")
  ) {
    return ELEVENLABS_VOICE_PRESETS.adult_male;
  }

  return ELEVENLABS_VOICE_PRESETS.default;
}

// ========================================================
// CHARACTER -> MUNSIT VOICE
// ========================================================

function selectMunsitVoiceId(
  characterProfile?: string,
  speakerName?: string
): string {
  const combined =
    getCombinedCharacterProfile(
      characterProfile,
      speakerName
    );

  if (!combined) {
    return MUNSIT_VOICE_PRESETS.default;
  }

  const isFemale =
    combined.includes("woman") ||
    combined.includes("female") ||
    combined.includes("girl") ||
    combined.includes("mother") ||
    combined.includes("wife") ||
    combined.includes("امرأة") ||
    combined.includes("فتاة") ||
    combined.includes("بنت") ||
    combined.includes("أنثى") ||
    combined.includes("أم") ||
    combined.includes("زوجة") ||
    combined.includes("سلمى") ||
    combined.includes("سارة") ||
    combined.includes("ليلى") ||
    combined.includes("مريم") ||
    combined.includes("نور");

  const isChild =
    combined.includes("child") ||
    combined.includes("kid") ||
    combined.includes("boy") ||
    combined.includes("طفل") ||
    combined.includes("طفلة") ||
    combined.includes("ولد") ||
    combined.includes("صغير") ||
    combined.includes("صغيرة");

  const isTeen =
    combined.includes("teen") ||
    combined.includes("teenager") ||
    combined.includes("مراهق") ||
    combined.includes("مراهقة");

  if (isFemale && isChild) {
    return MUNSIT_VOICE_PRESETS.child_female;
  }

  if (!isFemale && isChild) {
    return MUNSIT_VOICE_PRESETS.child_male;
  }

  if (isFemale && isTeen) {
    return MUNSIT_VOICE_PRESETS.teenager_female;
  }

  if (!isFemale && isTeen) {
    return MUNSIT_VOICE_PRESETS.teenager_male;
  }

  if (isFemale) {
    return MUNSIT_VOICE_PRESETS.adult_female;
  }

  if (
    combined.includes("young") ||
    combined.includes("شاب") ||
    combined.includes("شابة")
  ) {
    return MUNSIT_VOICE_PRESETS.young_male;
  }

  return MUNSIT_VOICE_PRESETS.adult_male;
}

// ========================================================
// RESOLVE SINGLE TEXT
// ========================================================

function resolveVoiceText(
  body: Record<string, unknown>
): {
  text: string;
  characterProfile?: string;
  source: "dialogues" | "text";
} {
  const dialogues =
    Array.isArray(body.dialogues)
      ? (body.dialogues as DialogueItem[])
      : [];

  const dialogueText =
    dialogues
      .map((dialogue) =>
        cleanText(dialogue?.line)
      )
      .filter(Boolean)
      .join("\n");

  if (dialogueText) {
    const profiles =
      dialogues
        .map(
          (dialogue) =>
            `${cleanText(
              dialogue?.speakerName
            )} ${cleanText(
              dialogue?.characterType
            )}`.trim()
        )
        .filter(Boolean)
        .join(", ");

    return {
      text: dialogueText,
      characterProfile:
        profiles ||
        cleanText(body.characterProfile) ||
        cleanText(body.gender) ||
        cleanText(body.age),
      source: "dialogues",
    };
  }

  return {
    text: cleanText(body.text),
    characterProfile:
      cleanText(body.characterProfile) ||
      cleanText(body.gender) ||
      cleanText(body.age),
    source: "text",
  };
}

// ========================================================
// ELEVENLABS
// ========================================================

async function generateWithElevenLabs(
  text: string,
  apiKey: string,
  voiceId: string,
  languageCode: VoiceLanguage
): Promise<VoiceResult> {
  console.log(
    `🔊 ElevenLabs TTS | voice=${voiceId} | language=${languageCode}`
  );

  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 60_000);

  try {
    const response =
      await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
          voiceId
        )}?output_format=mp3_44100_128`,
        {
          method: "POST",

          headers: {
            "xi-api-key": apiKey,
            "Content-Type":
              "application/json",
            Accept: "audio/mpeg",
          },

          body: JSON.stringify({
            text,
            model_id:
              "eleven_multilingual_v2",
            language_code:
              languageCode,

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
      const errorText =
        await response.text();

      throw new Error(
        `ElevenLabs failed (${response.status}): ${errorText}`
      );
    }

    const arrayBuffer =
      await response.arrayBuffer();

    if (!arrayBuffer.byteLength) {
      throw new Error(
        "ElevenLabs returned empty audio."
      );
    }

    const audio =
      Buffer.from(
        arrayBuffer
      ).toString("base64");

    return {
      audio:
        `data:audio/mp3;base64,${audio}`,
      mimeType: "audio/mpeg",
      provider: "elevenlabs",
      voiceId,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ========================================================
// MUNSIT
// ========================================================

async function generateWithMunsit(
  text: string,
  apiKey: string,
  voiceId: string
): Promise<VoiceResult> {
  const modelId =
    process.env.MUNSIT_MODEL_ID ||
    "faseeh-v1-preview";

  const baseUrl =
    process.env.MUNSIT_API_BASE_URL ||
    "https://api.munsit.com/api/v1";

  console.log(
    `🔊 Munsit TTS | model=${modelId} | voice=${voiceId} | language=ar`
  );

  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 60_000);

  try {
    const response =
      await fetch(
        `${baseUrl}/text-to-speech/${encodeURIComponent(
          modelId
        )}`,
        {
          method: "POST",

          headers: {
            "x-api-key": apiKey,
            "Content-Type":
              "application/json",
            Accept: "audio/wav",
          },

          body: JSON.stringify({
            voice_id: voiceId,
            text,
            stability: 0.5,
            speed: 1.0,
            streaming: false,
          }),

          cache: "no-store",
          signal: controller.signal,
        }
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `Munsit failed (${response.status}): ${errorText}`
      );
    }

    const arrayBuffer =
      await response.arrayBuffer();

    if (!arrayBuffer.byteLength) {
      throw new Error(
        "Munsit returned empty audio."
      );
    }

    const audio =
      Buffer.from(
        arrayBuffer
      ).toString("base64");

    return {
      audio:
        `data:audio/wav;base64,${audio}`,
      mimeType: "audio/wav",
      provider: "munsit",
      voiceId,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ========================================================
// PROVIDER SELECTION
// ========================================================

async function generateVoice(
  text: string,
  language: VoiceLanguage,
  characterProfile?: string,
  speakerName?: string
): Promise<VoiceResult> {
  const clean = text.trim();

  if (!clean) {
    throw new Error(
      "Voice text is empty."
    );
  }

  // ------------------------------------------------------
  // ENGLISH -> ELEVENLABS ONLY
  // ------------------------------------------------------

  if (language === "en") {
    const apiKey =
      process.env.ELEVENLABS_API_KEY?.trim();

    if (!apiKey) {
      throw new Error(
        "ELEVENLABS_API_KEY is missing for English."
      );
    }

    const voiceId =
      selectElevenLabsVoiceId(
        characterProfile,
        speakerName
      );

    return generateWithElevenLabs(
      clean,
      apiKey,
      voiceId,
      "en"
    );
  }

  // ------------------------------------------------------
  // ARABIC -> MUNSIT FIRST
  // ------------------------------------------------------

  const munsitKey =
    process.env.MUNSIT_API_KEY?.trim();

  if (munsitKey) {
    const voiceId =
      selectMunsitVoiceId(
        characterProfile,
        speakerName
      );

    try {
      return await generateWithMunsit(
        clean,
        munsitKey,
        voiceId
      );
    } catch (error) {
      console.warn(
        "⚠️ Munsit Arabic generation failed; trying ElevenLabs fallback.",
        error instanceof Error
          ? error.message
          : error
      );
    }
  }

  // ------------------------------------------------------
  // ARABIC FALLBACK -> ELEVENLABS
  // ------------------------------------------------------

  const elevenLabsKey =
    process.env.ELEVENLABS_API_KEY?.trim();

  if (!elevenLabsKey) {
    throw new Error(
      "Arabic voice providers are unavailable."
    );
  }

  const voiceId =
    selectElevenLabsVoiceId(
      characterProfile,
      speakerName
    );

  return generateWithElevenLabs(
    clean,
    elevenLabsKey,
    voiceId,
    "ar"
  );
}

// ========================================================
// EXISTING ASSET EXTRACTION
// ========================================================

function extractExistingAudio(
  body: Record<string, unknown>
): string {
  const candidates = [
    body.existingAudio,
    body.audioUrl,
    body.audioUri,
    body.generatedAudio,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return "";
}

// ========================================================
// POST
// ========================================================

export async function POST(
  request: Request
) {
  try {
    const rawBody =
      await request.json();

    const body =
      rawBody &&
      typeof rawBody === "object"
        ? (rawBody as Record<
            string,
            unknown
          >)
        : {};

    const voiceLanguage =
      normalizeLanguage(
        body.voiceLanguage
      );

    console.log(
      `🎧 Voice request | language=${voiceLanguage}`
    );

    // ====================================================
    // ASSET REUSE
    // ====================================================
    //
    // Never regenerate an audio asset that already exists.
    // This protects ElevenLabs/Munsit quota.
    // ====================================================

    const existingAudio =
      extractExistingAudio(body);

    if (existingAudio) {
      console.log(
        "♻️ Existing voice asset supplied. Reusing audio; generation skipped."
      );

      return NextResponse.json({
        success: true,
        skipped: true,
        reused: true,

        provider: "asset-reuse",

        audio: existingAudio,
        audioUrl: existingAudio,
        audioUri: existingAudio,

        voiceLanguage,

        assetsGenerated: true,

        message:
          "Existing voice asset reused.",
      });
    }

    // ====================================================
    // MULTI-DIALOGUE MODE
    // ====================================================

    const dialogues =
      Array.isArray(body.dialogues)
        ? (body.dialogues as DialogueItem[])
        : [];

    if (dialogues.length > 0) {
      const audioClips: Array<{
        characterType: string;
        speakerName: string;
        audio: string;
        mimeType: string;
        provider:
          | "munsit"
          | "elevenlabs";
        voiceId?: string;
        line: string;
      }> = [];

      for (
        const dialogue of dialogues
      ) {
        const line =
          cleanText(dialogue?.line);

        if (!line) {
          continue;
        }

        const speakerName =
          cleanText(
            dialogue?.speakerName
          ) || "Character";

        const characterType =
          cleanText(
            dialogue?.characterType
          ) || "adult";

        try {
          const result =
            await generateVoice(
              line,
              voiceLanguage,
              characterType,
              speakerName
            );

          audioClips.push({
            characterType,
            speakerName,

            audio:
              result.audio,

            mimeType:
              result.mimeType,

            provider:
              result.provider,

            voiceId:
              result.voiceId,

            line,
          });

          console.log(
            `✅ Voice generated | speaker=${speakerName} | provider=${result.provider} | language=${voiceLanguage}`
          );
        } catch (clipError) {
          console.warn(
            `⚠️ Voice failed for "${speakerName}":`,
            clipError instanceof Error
              ? clipError.message
              : clipError
          );
        }
      }

      if (audioClips.length === 0) {
        return NextResponse.json(
          {
            success: false,
            skipped: true,
            code:
              "VOICE_ALL_CLIPS_FAILED",
            provider: null,
            audio: null,
            mimeType: null,
            voiceLanguage,
            message:
              "All dialogue voice clips failed.",
          },
          { status: 502 }
        );
      }

      // --------------------------------------------------
      // ONE CLIP
      // --------------------------------------------------

      if (
        audioClips.length === 1
      ) {
        const clip =
          audioClips[0];

        return NextResponse.json({
          success: true,
          skipped: false,
          reused: false,

          multiVoice: false,

          provider:
            clip.provider,

          audio:
            clip.audio,

          audioUrl:
            clip.audio,

          audioUri:
            clip.audio,

          mimeType:
            clip.mimeType,

          source:
            "dialogues",

          voiceLanguage,

          characterType:
            clip.characterType,

          speakerName:
            clip.speakerName,

          voiceId:
            clip.voiceId,

          line:
            clip.line,

          assetsGenerated: true,
        });
      }

      // --------------------------------------------------
      // MULTI CLIP
      // --------------------------------------------------

      return NextResponse.json({
        success: true,
        skipped: false,
        reused: false,

        multiVoice: true,

        clips: audioClips,

        source:
          "dialogues",

        voiceLanguage,

        assetsGenerated: true,
      });
    }

    // ====================================================
    // SINGLE TEXT MODE
    // ====================================================

    const resolved =
      resolveVoiceText(body);

    if (!resolved.text) {
      console.log(
        "ℹ️ No voice text. Skipping TTS."
      );

      return NextResponse.json({
        success: true,
        skipped: true,
        reused: false,

        code:
          "VOICE_NOT_REQUIRED",

        provider: null,

        audio: null,
        audioUrl: null,
        audioUri: null,

        mimeType: null,

        source:
          resolved.source,

        voiceLanguage,

        assetsGenerated: false,

        message:
          "No dialogue or voice text was supplied.",
      });
    }

    const result =
      await generateVoice(
        resolved.text,
        voiceLanguage,
        resolved.characterProfile
      );

    console.log(
      `✅ Single voice generated | provider=${result.provider} | language=${voiceLanguage}`
    );

    return NextResponse.json({
      success: true,
      skipped: false,
      reused: false,

      multiVoice: false,

      provider:
        result.provider,

      audio:
        result.audio,

      audioUrl:
        result.audio,

      audioUri:
        result.audio,

      mimeType:
        result.mimeType,

      source:
        resolved.source,

      voiceLanguage,

      voiceId:
        result.voiceId,

      assetsGenerated: true,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "❌ Voice generation failed:",
      message
    );

    return NextResponse.json(
      {
        success: false,
        skipped: true,

        code:
          "VOICE_GENERATION_FAILED",

        provider: null,

        audio: null,
        audioUrl: null,
        audioUri: null,

        mimeType: null,

        message:
          `Voice generation failed: ${message}`,
      },
      { status: 502 }
    );
  }
}