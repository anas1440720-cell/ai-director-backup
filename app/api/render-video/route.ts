import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { spawn } from "child_process";
import fsSync from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type RenderRequest = {
  videos?: (string | null)[];
  voices?: (string | null)[];
  music?: (string | null)[];
  sfx?: (string | null)[];
  sceneDurations?: (number | null)[];
  aspectRatio?: string;
};

function getResolvedFFmpegPath(): string {
  try {
    const ffmpegStatic = require("ffmpeg-static");
    if (typeof ffmpegStatic === "string" && fsSync.existsSync(ffmpegStatic)) {
      return ffmpegStatic;
    }
  } catch {}

  const localPath = path.join(
    process.cwd(),
    "node_modules",
    "ffmpeg-static",
    process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"
  );

  if (fsSync.existsSync(localPath)) {
    return localPath;
  }

  return "ffmpeg";
}

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const binaryPath = getResolvedFFmpegPath();
    console.log(`🎬 FFmpeg: ${binaryPath} ${args.join(" ")}`);

    const child = spawn(binaryPath, args, {
      windowsHide: true,
    });

    let stderr = "";

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `FFmpeg failed with exit code ${code}.\n${stderr.slice(-6000)}`
        )
      );
    });
  });
}

async function saveAsset(source: string, outputPath: string): Promise<void> {
  if (source.startsWith("data:")) {
    const commaIndex = source.indexOf(",");
    if (commaIndex === -1) {
      throw new Error("Invalid data URI.");
    }
    const base64Data = source.slice(commaIndex + 1);
    await fs.writeFile(outputPath, Buffer.from(base64Data, "base64"));
    return;
  }

  const response = await fetch(source, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download asset: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getSafeDuration(duration: number | null | undefined): number {
  return typeof duration === "number" &&
    Number.isFinite(duration) &&
    duration > 0
    ? duration
    : 5;
}

function normalizeAssetArray(values: unknown): (string | null)[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) =>
    typeof value === "string" && value.trim().length > 0 ? value : null
  );
}

function buildConcatFileContent(files: string[]): string {
  return files
    .map(
      (filePath) =>
        `file '${filePath.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`
    )
    .join("\n");
}

/*
 * ============================================================
 * VIDEO NORMALIZATION (FULL SCREEN CROP - NO BLACK BARS)
 * ============================================================
 */

async function normalizeVideo(
  source: string,
  outputPath: string,
  width: number,
  height: number,
  duration: number
): Promise<void> {
  const rawPath = `${outputPath}.raw.mp4`;
  await saveAsset(source, rawPath);

  const safeDuration = getSafeDuration(duration);

  // Normalize video to the final render dimensions.
  // IMPORTANT: remove any provider-generated audio.
  // Final production audio is added separately during Final Render.
  const filter =
    `scale=${width}:${height}:force_original_aspect_ratio=increase,` +
    `crop=${width}:${height},` +
    `setsar=1,` +
    `fps=30`;

  await runFFmpeg([
    "-y",
    "-i",
    rawPath,
    "-vf",
    filter,
    "-t",
    String(safeDuration),
    "-map",
    "0:v:0",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputPath,
  ]);

  if (!(await fileExists(outputPath))) {
    throw new Error(
      "Video normalization finished but output video was not created."
    );
  }

  try {
    await fs.rm(rawPath, { force: true });
  } catch (_) {}
}
/*
 * ============================================================
 * AUDIO HELPERS
 * ============================================================
 */

async function verifyAudioAsset(
  filePath: string,
  sceneNumber: number
): Promise<void> {
  await runFFmpeg([
    "-v",
    "error",
    "-i",
    filePath,
    "-map",
    "0:a:0",
    "-f",
    "null",
    "-",
  ]);

  console.log(
    `🎙️ Scene ${sceneNumber}: voice audio verified successfully.`
  );
}

async function saveVoiceAsset(
  source: string | null,
  outputPath: string,
  tempDir: string,
  sceneNumber: number
): Promise<boolean> {
  if (!source) {
    return false;
  }

  try {
    if (source.trim().startsWith("[")) {
      const clips = JSON.parse(source) as Array<{
        audio?: string;
        speakerName?: string;
        characterType?: string;
      }>;

      const validClips = clips.filter(
        (clip) =>
          typeof clip?.audio === "string" && clip.audio.trim().length > 0
      );

      if (validClips.length === 0) {
        return false;
      }

      const clipPaths: string[] = [];

      for (let i = 0; i < validClips.length; i++) {
        const clipPath = path.join(
          tempDir,
          `scene-${sceneNumber}-voice-${i + 1}.mp3`
        );
        await saveAsset(validClips[i].audio!, clipPath);
        clipPaths.push(clipPath);
      }

      if (clipPaths.length === 1) {
        await fs.copyFile(clipPaths[0], outputPath);
        await verifyAudioAsset(outputPath, sceneNumber);
        return true;
      }

      const concatPath = path.join(
        tempDir,
        `scene-${sceneNumber}-voice-concat.txt`
      );

      await fs.writeFile(
        concatPath,
        buildConcatFileContent(clipPaths),
        "utf8"
      );

      await runFFmpeg([
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatPath,
        "-vn",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "128k",
        "-ar",
        "44100",
        "-ac",
        "2",
        outputPath,
      ]);

      await verifyAudioAsset(outputPath, sceneNumber);
      return true;
    }

    await saveAsset(source, outputPath);
    await verifyAudioAsset(outputPath, sceneNumber);
    return true;
  } catch (error) {
    console.warn(
      `⚠️ Voice asset unavailable for Scene ${sceneNumber}:`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

async function saveOptionalAudio(
  source: string | null,
  outputPath: string
): Promise<boolean> {
  if (!source) {
    return false;
  }

  try {
    await saveAsset(source, outputPath);
    return true;
  } catch (error) {
    console.warn(
      `⚠️ Audio asset unavailable: ${outputPath}`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

async function buildScene(
  videoSource: string,
  voiceSource: string | null,
  musicSource: string | null,
  sfxSource: string | null,
  duration: number,
  index: number,
  tempDir: string,
  width: number,
  height: number
): Promise<string> {
  const sceneNumber = index + 1;
  const safeDuration = getSafeDuration(duration);

  console.log(`🎬 Building Scene ${sceneNumber}: ${safeDuration}s`);

  const sceneVideoPath = path.join(
    tempDir,
    `scene-${sceneNumber}-video.mp4`
  );

  await normalizeVideo(
    videoSource,
    sceneVideoPath,
    width,
    height,
    safeDuration
  );

  const voicePath = path.join(tempDir, `scene-${sceneNumber}-voice.mp3`);
  const musicPath = path.join(tempDir, `scene-${sceneNumber}-music.mp3`);
  const sfxPath = path.join(tempDir, `scene-${sceneNumber}-sfx.mp3`);

  const hasVoice = await saveVoiceAsset(
    voiceSource,
    voicePath,
    tempDir,
    sceneNumber
  );
  const hasMusic = await saveOptionalAudio(musicSource, musicPath);
  const hasSfx = await saveOptionalAudio(sfxSource, sfxPath);

  console.log(
  `🔊 Scene ${sceneNumber} AUDIO SOURCES: ` +
    `voice=${hasVoice ? "YES" : "NO"} | ` +
    `music=${hasMusic ? "YES" : "NO"} | ` +
    `sfx=${hasSfx ? "YES" : "NO"}`
);

  const finalScenePath = path.join(
    tempDir,
    `scene-${sceneNumber}-final.mp4`
  );

  if (!hasVoice && !hasMusic && !hasSfx) {
  await runFFmpeg([
    "-y",
    "-i",
    sceneVideoPath,
    "-f",
    "lavfi",
    "-t",
    String(safeDuration),
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-t",
    String(safeDuration),
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-shortest",
    "-movflags",
    "+faststart",
    finalScenePath,
  ]);

  await verifyAudioAsset(finalScenePath, sceneNumber);

  console.log(
    `🔇 Scene ${sceneNumber}: no production audio, silent audio track added.`
  );

  return finalScenePath;
}

  const args: string[] = ["-y", "-i", sceneVideoPath];
  let voiceInput = -1;
  let musicInput = -1;
  let sfxInput = -1;
  let nextInput = 1;

  if (hasVoice) {
    voiceInput = nextInput;
    args.push("-i", voicePath);
    nextInput++;
  }

  if (hasMusic) {
    musicInput = nextInput;
    args.push("-stream_loop", "-1", "-i", musicPath);
    nextInput++;
  }

  if (hasSfx) {
    sfxInput = nextInput;
    args.push("-i", sfxPath);
    nextInput++;
  }

  const filters: string[] = [];
  let voiceLabel = "";
  let musicLabel = "";
  let sfxLabel = "";

  if (voiceInput >= 0) {
    filters.push(
      `[${voiceInput}:a]` +
        `aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,` +
        `aresample=48000,` +
        `asetpts=PTS-STARTPTS,` +
        `volume=1.0,` +
        `apad,` +
        `atrim=duration=${safeDuration},` +
        `afade=t=in:st=0:d=0.03,` +
        `afade=t=out:st=${Math.max(0, safeDuration - 0.08)}:d=0.08` +
        `[voice]`
    );
    voiceLabel = "[voice]";
  }

  if (musicInput >= 0) {
    filters.push(
      `[${musicInput}:a]` +
        `aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,` +
        `aresample=48000,` +
        `asetpts=PTS-STARTPTS,` +
        `volume=0.16,` +
        `atrim=duration=${safeDuration},` +
        `afade=t=in:st=0:d=0.7,` +
        `afade=t=out:st=${Math.max(0, safeDuration - 0.8)}:d=0.8` +
        `[musicbase]`
    );
    musicLabel = "[musicbase]";
  }

  if (sfxInput >= 0) {
    filters.push(
      `[${sfxInput}:a]` +
        `aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,` +
        `aresample=48000,` +
        `asetpts=PTS-STARTPTS,` +
        `volume=0.38,` +
        `atrim=duration=${safeDuration},` +
        `afade=t=in:st=0:d=0.03,` +
        `afade=t=out:st=${Math.max(0, safeDuration - 0.12)}:d=0.12` +
        `[sfx]`
    );
    sfxLabel = "[sfx]";
  }

  const mixInputs: string[] = [];
  if (voiceLabel) mixInputs.push(voiceLabel);
  if (sfxLabel) mixInputs.push(sfxLabel);
  if (musicLabel) mixInputs.push(musicLabel);

  if (mixInputs.length === 0) {
    throw new Error(
      `Scene ${sceneNumber}: audio inputs disappeared during render.`
    );
  }

  filters.push(
    `${mixInputs.join("")}` +
      `amix=` +
      `inputs=${mixInputs.length}:` +
      `duration=longest:` +
      `dropout_transition=0.35:` +
      `normalize=0` +
      `[mixed]`
  );

  filters.push(
    `[mixed]alimiter=limit=0.92:attack=5:release=80[aout]`
  );

  args.push(
    "-filter_complex",
    filters.join(";"),
    "-map",
    "0:v:0",
    "-map",
    "[aout]",
    "-t",
    String(safeDuration),
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-shortest",
    "-movflags",
    "+faststart",
    finalScenePath
  );

  await runFFmpeg(args);

await verifyAudioAsset(finalScenePath, sceneNumber);

console.log(
  `✅ Scene ${sceneNumber} FINAL MP4 contains verified audio.`
);

return finalScenePath;
}

/*
 * ============================================================
 * FINAL RENDER
 * ============================================================
 */

export async function POST(req: Request) {
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "ai-director-render-")
  );

  try {
    const body = (await req.json()) as RenderRequest;

    const videos: string[] = Array.isArray(body.videos)
      ? body.videos.map((value) =>
          typeof value === "string" && value.trim().length > 0
            ? value.trim()
            : ""
        )
      : [];

    const voices = normalizeAssetArray(body.voices);
    const music = normalizeAssetArray(body.music);
    const sfx = normalizeAssetArray(body.sfx);
    const sceneDurations = Array.isArray(body.sceneDurations)
      ? body.sceneDurations
      : [];

    if (!videos.some(Boolean)) {
      return NextResponse.json(
        {
          success: false,
          code: "NO_VIDEO_ASSETS",
          message: "No generated scene videos were provided.",
        },
        {
          status: 400,
        }
      );
    }

    const isVertical = body.aspectRatio === "9:16";
    const width = isVertical ? 720 : 1920;
    const height = isVertical ? 1280 : 1080;

    console.log("==================================================");
    console.log(`🎬 FINAL CINEMATIC RENDER STARTED`);
    console.log(`🎬 Scenes: ${videos.length}`);
    console.log(`🎬 Resolution: ${width}x${height}`);
    console.log("==================================================");

    const sceneFiles: string[] = [];

    for (let index = 0; index < videos.length; index++) {
      const duration = getSafeDuration(sceneDurations[index]);
      const voice = voices[index] ?? null;
      const musicTrack = music[index] ?? null;
      const sfxTrack = sfx[index] ?? null;

      try {
        const scenePath = await buildScene(
          videos[index],
          voice,
          musicTrack,
          sfxTrack,
          duration,
          index,
          tempDir,
          width,
          height
        );
        sceneFiles.push(scenePath);
      } catch (error) {
        console.error(`❌ Scene ${index + 1} render failed:`, error);
        throw error;
      }
    }

        const sceneConcatPath = path.join(tempDir, "scenes.txt");

    const concatContent = sceneFiles
      .map((file) => `file '${file.replace(/'/g, "'\''")}'`)
      .join("\n");

    await fs.writeFile(sceneConcatPath, concatContent, "utf8");

    const finalVideoPath = path.join(tempDir, "final-video.mp4");

    await runFFmpeg([
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      sceneConcatPath,
      "-map",
"0:v:0",
"-map",
"0:a:0",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      finalVideoPath,
    ]);

    if (!(await fileExists(finalVideoPath))) {
      throw new Error(
        "FFmpeg finished but final video file was not created."
      );
    }
    
await verifyAudioAsset(finalVideoPath, 0);

console.log("✅ FINAL VIDEO AUDIO VERIFIED SUCCESSFULLY.");

    const finalBuffer = await fs.readFile(finalVideoPath);

    return new NextResponse(finalBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'inline; filename="ai-director-masterpiece.mp4"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("\n❌ FINAL CINEMATIC RENDER FAILED:", message);
    return NextResponse.json(
      {
        success: false,
        code: "FINAL_RENDER_FAILED",
        message: "Final video rendering failed. " + message,
      },
      {
        status: 500,
      }
    );
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn("⚠️ Final render cleanup failed:", cleanupError);
    }
  }
}