import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegPath from "ffmpeg-static";

const ROOT = process.cwd();
const TEST_DIR = path.join(ROOT, "test-assets-final-render");

fs.mkdirSync(TEST_DIR, { recursive: true });

if (!ffmpegPath) {
  throw new Error("ffmpeg-static was not found.");
}

console.log("==================================================");
console.log("🎬 AI DIRECTOR — LOCAL FINAL RENDER TEST");
console.log("==================================================");
console.log("🚫 No Gemini");
console.log("🚫 No ElevenLabs");
console.log("🚫 No Music provider");
console.log("🚫 No SFX provider");
console.log("🚫 No WaveSpeed");
console.log("✅ FFmpeg local test assets only");
console.log("==================================================");

function runFFmpeg(args) {
  console.log("\n▶ FFmpeg:", args.join(" "));

  const result = spawnSync(ffmpegPath, args, {
    stdio: "inherit",
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(
      `FFmpeg failed with exit code ${result.status}`
    );
  }
}

function toDataUri(filePath, mimeType) {
  const base64 = fs.readFileSync(filePath).toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

/*
 * ========================================================
 * 1. CREATE LOCAL TEST VIDEO — SCENE 1
 * ========================================================
 */

const scene1 = path.join(TEST_DIR, "scene-1.mp4");

runFFmpeg([
  "-y",
  "-f",
  "lavfi",
  "-i",
  "color=c=blue:s=1280x720:r=30",
  "-t",
  "5",
  "-an",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  scene1,
]);

/*
 * ========================================================
 * 2. CREATE LOCAL TEST VIDEO — SCENE 2
 * ========================================================
 */

const scene2 = path.join(TEST_DIR, "scene-2.mp4");

runFFmpeg([
  "-y",
  "-f",
  "lavfi",
  "-i",
  "color=c=red:s=1280x720:r=30",
  "-t",
  "5",
  "-an",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  scene2,
]);

/*
 * ========================================================
 * 3. CREATE LOCAL TEST VOICE — SCENE 1
 * ========================================================
 */

const voice1 = path.join(TEST_DIR, "voice-1.mp3");

runFFmpeg([
  "-y",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=440:sample_rate=44100",
  "-t",
  "5",
  "-c:a",
  "libmp3lame",
  "-b:a",
  "128k",
  voice1,
]);

/*
 * ========================================================
 * 4. CREATE LOCAL TEST VOICE — SCENE 2
 * ========================================================
 */

const voice2 = path.join(TEST_DIR, "voice-2.mp3");

runFFmpeg([
  "-y",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=660:sample_rate=44100",
  "-t",
  "5",
  "-c:a",
  "libmp3lame",
  "-b:a",
  "128k",
  voice2,
]);

/*
 * ========================================================
 * 5. CREATE LOCAL TEST MUSIC
 * ========================================================
 */

const music = path.join(TEST_DIR, "music.mp3");

runFFmpeg([
  "-y",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=220:sample_rate=44100",
  "-t",
  "10",
  "-c:a",
  "libmp3lame",
  "-b:a",
  "128k",
  music,
]);

/*
 * ========================================================
 * 6. CREATE LOCAL TEST SFX
 * ========================================================
 */

const sfx = path.join(TEST_DIR, "sfx.mp3");

runFFmpeg([
  "-y",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=880:sample_rate=44100",
  "-t",
  "10",
  "-c:a",
  "libmp3lame",
  "-b:a",
  "128k",
  sfx,
]);

console.log("\n==================================================");
console.log("✅ LOCAL TEST ASSETS CREATED");
console.log("==================================================");

const videos = [
  toDataUri(scene1, "video/mp4"),
  toDataUri(scene2, "video/mp4"),
];

const voices = [
  toDataUri(voice1, "audio/mpeg"),
  toDataUri(voice2, "audio/mpeg"),
];

const musicData = toDataUri(music, "audio/mpeg");
const sfxData = toDataUri(sfx, "audio/mpeg");

/*
 * ========================================================
 * TEST 1
 * VIDEO + VOICE ONLY
 *
 * This confirms:
 * Video
 * + Scene durations
 * + Voice
 * + Concatenation
 *
 * WITHOUT MUSIC/SFX
 * ========================================================
 */

console.log("\n==================================================");
console.log("🧪 TEST 1 — VIDEO + VOICE ONLY");
console.log("==================================================");

const response1 = await fetch(
  "http://localhost:3000/api/render-video",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videos,
      voices,
      music: [],
      sfx: [],
      sceneDurations: [5, 5],
      aspectRatio: "16:9",
    }),
  }
);

if (!response1.ok) {
  const errorText = await response1.text();

  throw new Error(
    `TEST 1 failed: HTTP ${response1.status}\n${errorText}`
  );
}

const output1 = path.join(
  TEST_DIR,
  "FINAL-TEST-1-video-voice.mp4"
);

fs.writeFileSync(
  output1,
  Buffer.from(await response1.arrayBuffer())
);

console.log("\n✅ TEST 1 PASSED");
console.log(`📁 ${output1}`);

/*
 * ========================================================
 * TEST 2
 * VIDEO + VOICE + MUSIC + SFX
 *
 * EVERYTHING IS LOCAL.
 *
 * NO EXTERNAL PROVIDER IS CALLED.
 * ========================================================
 */

console.log("\n==================================================");
console.log("🧪 TEST 2 — FULL LOCAL AUDIO MIX");
console.log("==================================================");

const response2 = await fetch(
  "http://localhost:3000/api/render-video",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videos,
      voices,
      music: [musicData],
      sfx: [sfxData],
      sceneDurations: [5, 5],
      aspectRatio: "16:9",
    }),
  }
);

if (!response2.ok) {
  const errorText = await response2.text();

  throw new Error(
    `TEST 2 failed: HTTP ${response2.status}\n${errorText}`
  );
}

const output2 = path.join(
  TEST_DIR,
  "FINAL-TEST-2-full-audio-mix.mp4"
);

fs.writeFileSync(
  output2,
  Buffer.from(await response2.arrayBuffer())
);

console.log("\n==================================================");
console.log("🎉 ALL LOCAL FINAL RENDER TESTS PASSED");
console.log("==================================================");

console.log("\nTEST 1:");
console.log(output1);

console.log("\nTEST 2:");
console.log(output2);

console.log("\n🚫 No AI provider was used.");
console.log("🚫 No paid/free provider quota was consumed.");
console.log("✅ Final Render pipeline is functioning.");
console.log("==================================================");