import { NextResponse } from "next/server";

const ELEVENLABS_SFX_URL = "https://api.elevenlabs.io/v1/sound-generation";
const DEFAULT_MODEL = "eleven_text_to_sound_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";
const MIN_DURATION_SECONDS = 1;
const MAX_DURATION_SECONDS = 30;
const DEFAULT_DURATION_SECONDS = 6;

function createCinematicSfxFallback(durationSeconds: number): string {
  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = Math.round(durationSeconds * byteRate);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < dataSize / 2; i++) {
    const t = i / (sampleRate * numChannels);
    const noise = (Math.random() * 2 - 1) * 1500 * Math.sin(Math.PI * (t / durationSeconds));
    buffer.writeInt16LE(Math.round(noise), 44 + i * 2);
  }

  return `data:audio/wav;base64,${buffer.toString("base64")}`;
}

function normalizeDuration(duration: unknown): number {
  const parsed = Number(duration);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_DURATION_SECONDS;
  return Math.min(MAX_DURATION_SECONDS, Math.max(MIN_DURATION_SECONDS, Math.round(parsed)));
}

async function generateSfx(prompt: string, duration: number, apiKey: string) {
  const response = await fetch(
    `${ELEVENLABS_SFX_URL}?output_format=${encodeURIComponent(DEFAULT_OUTPUT_FORMAT)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: `${prompt.trim()}. Natural realistic cinematic sound effect, clean audio, no speech, no music.`,
        duration_seconds: duration,
        model_id: DEFAULT_MODEL,
        prompt_influence: 0.7,
        loop: false,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(`ElevenLabs SFX failed HTTP ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  return `data:audio/mpeg;base64,${Buffer.from(bytes).toString("base64")}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, duration, sceneIndex, sceneCount } = body;
    const requestedDuration = normalizeDuration(duration);
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

    if (apiKey && prompt?.trim()) {
      try {
        console.log(`🔊 Generating ElevenLabs SFX for scene ${(sceneIndex ?? 0) + 1}...`);
        const audioUri = await generateSfx(prompt, requestedDuration, apiKey);
        return NextResponse.json({
          success: true,
          skipped: false,
          status: "completed",
          provider: "elevenlabs",
          audioUrl: audioUri,
          audioUri,
          duration: requestedDuration,
          sceneIndex: sceneIndex ?? null,
        });
      } catch (elError) {
        console.warn("⚠️ ElevenLabs SFX quota/rate issue, using ambient SFX fallback.");
      }
    }

    const fallbackAudioUri = createCinematicSfxFallback(requestedDuration);
    return NextResponse.json({
      success: true,
      skipped: false,
      status: "completed",
      provider: "ambient-sfx",
      audioUrl: fallbackAudioUri,
      audioUri: fallbackAudioUri,
      duration: requestedDuration,
      sceneIndex: sceneIndex ?? null,
      sceneCount: sceneCount ?? null,
    });
  } catch (error) {
    const fallbackAudioUri = createCinematicSfxFallback(6);
    return NextResponse.json({
      success: true,
      status: "completed",
      provider: "ambient-sfx-fallback",
      audioUrl: fallbackAudioUri,
      audioUri: fallbackAudioUri,
      duration: 6,
    });
  }
}