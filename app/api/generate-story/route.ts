import { NextResponse } from "next/server";
import {
generateStory,
calculateSceneDurations,
} from "@/lib/ai-provider";

/*

* ========================================================
* SAFE JSON EXTRACTION
* ========================================================
*
* Gemini may sometimes return JSON surrounded by markdown
* fences or additional text.
*
* This function extracts the outer JSON object without
* relying on a simple first/last brace assumption.
  */
  function extractJsonObject(text: string): string {
  let raw = (text || "").trim();

// Remove markdown code fences.
raw = raw
.replace(/^`json\s*/i, "")
    .replace(/^`\s*/i, "")
.replace(/\s*```$/i, "")
.trim();

const firstBrace = raw.indexOf("{");

if (firstBrace === -1) {
throw new Error(
"No JSON object found in AI response."
);
}

let depth = 0;
let inString = false;
let escaped = false;

for (
let i = firstBrace;
i < raw.length;
i++
) {
const char = raw[i];

if (escaped) {
  escaped = false;
  continue;
}

if (char === "\\") {
  escaped = true;
  continue;
}

if (char === '"') {
  inString = !inString;
  continue;
}

if (inString) {
  continue;
}

if (char === "{") {
  depth++;
} else if (char === "}") {
  depth--;

  if (depth === 0) {
    return raw.slice(
      firstBrace,
      i + 1
    );
  }
}
}

throw new Error(
"AI response contains an incomplete JSON object."
);
}

/*

* ========================================================
* STORY JSON NORMALIZATION
* ========================================================
*
* Gemini occasionally produces a malformed scene array
* where it closes "scenes" too early and places another
* scene object after the closing "]".
*
* We do NOT blindly repair arbitrary JSON here.
*
* The primary strategy is:
* 1. Parse normally.
* 2. If parsing fails, attempt a conservative repair
* specifically for scene-array termination.
  */
  function parseStoryJson(text: string): any {
  const extracted = extractJsonObject(text);

try {
return JSON.parse(extracted);
} catch (firstError) {
/*
* Conservative repair:
*
* Example malformed structure:
*
* "scenes": [
*   {...},
*   {...},
*   {...}
* ],
* {
*   "title": "المشهد الرابع"
* }
*
* The scene object after the closing scenes array
* should be moved back into the scenes array.
*
* This repair is intentionally limited to the exact
* structural pattern that Gemini sometimes creates.
*/

const scenesKey =
  extracted.indexOf('"scenes"');

if (scenesKey === -1) {
  throw firstError;
}

const scenesArrayStart =
  extracted.indexOf(
    "[",
    scenesKey
  );

if (scenesArrayStart === -1) {
  throw firstError;
}

/*
 * Find the matching closing bracket for the scenes
 * array while respecting strings.
 */
let bracketDepth = 0;
let inString = false;
let escaped = false;
let scenesArrayEnd = -1;

for (
  let i = scenesArrayStart;
  i < extracted.length;
  i++
) {
  const char = extracted[i];

  if (escaped) {
    escaped = false;
    continue;
  }

  if (char === "\\") {
    escaped = true;
    continue;
  }

  if (char === '"') {
    inString = !inString;
    continue;
  }

  if (inString) {
    continue;
  }

  if (char === "[") {
    bracketDepth++;
  } else if (char === "]") {
    bracketDepth--;

    if (bracketDepth === 0) {
      scenesArrayEnd = i;
      break;
    }
  }
}

if (scenesArrayEnd === -1) {
  throw firstError;
}

const afterScenesEnd =
  extracted
    .slice(scenesArrayEnd + 1)
    .trim();

/*
 * Look for an object immediately following the
 * scenes array.
 *
 * We only repair when the remainder contains exactly
 * one scene-like object before the final root "}".
 */
if (
  afterScenesEnd.startsWith(",") &&
  afterScenesEnd.includes("{")
) {
  const candidate =
    afterScenesEnd
      .slice(1)
      .trim();

  const candidateObjectStart =
    candidate.indexOf("{");

  const candidateObjectEnd =
    candidate.lastIndexOf("}");

  if (
    candidateObjectStart === 0 &&
    candidateObjectEnd !== -1
  ) {
    const candidateObject =
      candidate.slice(
        candidateObjectStart,
        candidateObjectEnd + 1
      );

    try {
      const parsedCandidate =
        JSON.parse(candidateObject);

      /*
       * A scene object should at least have one of
       * these fields.
       */
      const looksLikeScene =
        parsedCandidate &&
        typeof parsedCandidate ===
          "object" &&
        (
          typeof parsedCandidate.title ===
            "string" ||
          typeof parsedCandidate.action ===
            "string" ||
          typeof parsedCandidate.sceneObjective ===
            "string" ||
          typeof parsedCandidate.storyPurpose ===
            "string"
        );

      if (looksLikeScene) {
        const arrayContent =
          extracted.slice(
            scenesArrayStart + 1,
            scenesArrayEnd
          ).trim();

        const repairedScenes =
          arrayContent
            ? `${arrayContent},${candidateObject}`
            : candidateObject;

        const prefix =
          extracted.slice(
            0,
            scenesArrayStart + 1
          );

        const rootClosingBrace =
          extracted.lastIndexOf("}");

        const suffix =
          extracted
            .slice(
              candidateObjectEnd + 1,
              rootClosingBrace
            )
            .trim();

        const repaired =
          `${prefix}${repairedScenes}]${suffix}}`;

        return JSON.parse(repaired);
      }
    } catch {
      // Fall through to original parse error.
    }
  }
}

throw firstError;
}
}

export async function POST(request: Request) {
try {
const body = await request.json();

// ========================================================
// VALIDATE IDEA
// ========================================================

if (
  !body.idea ||
  !body.idea.trim()
) {
  return NextResponse.json(
    {
      success: false,
      message: "Idea is required.",
    },
    { status: 400 }
  );
}

// ========================================================
// PROVIDER
// ========================================================

const provider =
  body.provider === "openai" ||
  body.provider === "claude" ||
  body.provider === "gemini"
    ? body.provider
    : "gemini";

// ========================================================
// DURATION
// ========================================================

const duration = Number(
  body.duration
);

if (
  !Number.isInteger(duration) ||
  duration < 5 ||
  duration > 1800
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Video duration must be between 5 and 1800 seconds.",
    },
    { status: 400 }
  );
}

// ========================================================
// DIRECTOR OPTIONS
// ========================================================

const voiceLanguage =
  body.voiceLanguage === "en"
    ? "en"
    : "ar";

const aspectRatio =
  body.aspectRatio === "16:9"
    ? "16:9"
    : "9:16";

// ========================================================
// GENERATE STORY
// ========================================================

const result =
  await generateStory(
    provider,
    body.idea,
    duration,
    {
      videoType:
        typeof body.videoType ===
        "string"
          ? body.videoType
          : "",

      audience:
        typeof body.audience ===
        "string"
          ? body.audience
          : "",

      goal:
        typeof body.goal ===
        "string"
          ? body.goal
          : "",

      character:
        typeof body.character ===
        "string"
          ? body.character
          : "",

      style:
        typeof body.style ===
        "string"
          ? body.style
          : "",

      voiceLanguage,
      aspectRatio,
    }
  );

// ========================================================
// PROVIDER FAILURE
// ========================================================

if (
  !result.success ||
  !("text" in result)
) {
  return NextResponse.json(
    result
  );
}

// ========================================================
// PARSE AI JSON
// ========================================================

let json: any;

try {
  json = parseStoryJson(
    result.text || ""
  );

  if (
    !json ||
    typeof json !== "object"
  ) {
    throw new Error(
      "AI returned an invalid story object."
    );
  }

  if (
    !Array.isArray(json.scenes)
  ) {
    throw new Error(
      "AI story does not contain a valid scenes array."
    );
  }
} catch (error) {
  console.error(
    "AI returned invalid JSON:",
    error
  );

  console.error(
    "Raw AI response:",
    result.text
  );

  return NextResponse.json(
    {
      success: false,
      message:
        "AI returned invalid story data.",
    },
    { status: 500 }
  );
}

// ========================================================
// SCENE PROCESSING
// ========================================================

/*
 * AUTHORITATIVE SCENE PLAN
 *
 * The number and duration of scenes come ONLY from
 * the requested production duration.
 *
 * Gemini must return exactly the same number of scenes.
 * We never create missing/empty scenes here.
 */
const sceneDurations =
  calculateSceneDurations(
    duration
  );

const generatedScenes =
  Array.isArray(json.scenes)
    ? json.scenes
    : [];

// ========================================================
// STRICT SCENE COUNT VALIDATION
// ========================================================

/*
 * Never silently create an empty scene when Gemini
 * returns fewer scenes than required.
 *
 * Never silently discard extra scenes either.
 *
 * The production plan is authoritative.
 */
if (
  generatedScenes.length !==
  sceneDurations.length
) {
  throw new Error(
    `AI returned ${generatedScenes.length} scenes, but ${sceneDurations.length} scenes are required for ${duration}s.`
  );
}

// ========================================================
// STRICT SCENE VALIDATION
// ========================================================

/*
 * Every required scene must be a real object.
 *
 * We intentionally fail here instead of allowing an
 * incomplete scene to continue into image/video generation.
 */
generatedScenes.forEach(
  (
    scene: any,
    index: number
  ) => {
    const sceneNum =
      index + 1;

    if (
      !scene ||
      typeof scene !== "object" ||
      Array.isArray(scene)
    ) {
      throw new Error(
        `AI returned an invalid object for Scene ${sceneNum}.`
      );
    }

    const requiredStringFields = [
      "title",
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
      "sfxPrompt",
      "musicMood",
      "visual",
      "camera",
    ];

    for (
      const field of
        requiredStringFields
    ) {
      if (
        typeof scene[field] !==
          "string" ||
        !scene[field].trim()
      ) {
        throw new Error(
          `AI returned an incomplete Scene ${sceneNum}: missing "${field}".`
        );
      }
    }

    if (
      !scene.environment ||
      typeof scene.environment !==
        "object" ||
      Array.isArray(
        scene.environment
      )
    ) {
      throw new Error(
        `AI returned an incomplete Scene ${sceneNum}: missing "environment".`
      );
    }

    const requiredEnvironmentFields = [
      "description",
      "objects",
      "lighting",
      "timeOfDay",
    ];

    for (
      const field of
        requiredEnvironmentFields
    ) {
      if (
        typeof scene
          .environment[field] !==
          "string" ||
        !scene.environment[field].trim()
      ) {
        throw new Error(
          `AI returned an incomplete Scene ${sceneNum}: missing "environment.${field}".`
        );
      }
    }

    if (
      !Array.isArray(
        scene.characters
      ) ||
      scene.characters.length === 0
    ) {
      throw new Error(
        `AI returned an incomplete Scene ${sceneNum}: missing scene.characters.`
      );
    }

    if (
      !Array.isArray(
        scene.dialogue
      )
    ) {
      throw new Error(
        `AI returned an incomplete Scene ${sceneNum}: missing dialogue array.`
      );
    }
  }
);

// ========================================================
// PROCESS EVERY AUTHORITATIVE SCENE
// ========================================================

/*
 * At this point:
 *
 * generatedScenes.length === sceneDurations.length
 *
 * Therefore there is NO fallback to {}.
 */
const processedScenes =
  sceneDurations.map(
    (
      sceneDuration,
      index
    ) => {
      const sceneNum =
        index + 1;

      const scene =
        generatedScenes[index];

      // --------------------------------------------------
      // PRESERVE REAL GENERATED VOICE
      // --------------------------------------------------

      const generatedVoice =
        typeof scene.voice ===
          "string" &&
        scene.voice.trim()
          ? scene.voice.trim()
          : "";

      // --------------------------------------------------
      // PRESERVE VALID CHARACTER DIALOGUE ONLY
      // --------------------------------------------------

      const processedDialogue =
        Array.isArray(
          scene.dialogue
        )
          ? scene.dialogue
              .filter(
                (d: any) =>
                  d &&
                  typeof d.line ===
                    "string" &&
                  d.line.trim() &&
                  typeof d.speakerName ===
                    "string" &&
                  d.speakerName.trim()
              )
              .map(
                (d: any) => ({
                  speakerName:
                    d.speakerName.trim(),

                  characterType:
                    typeof d.characterType ===
                      "string" &&
                    d.characterType.trim()
                      ? d.characterType.trim()
                      : "adult",

                  line:
                    d.line.trim(),
                })
              )
          : [];

      // --------------------------------------------------
      // VOICE SCRIPT
      // --------------------------------------------------

      const dialogueVoice =
        processedDialogue.length >
        0
          ? processedDialogue
              .map(
                (d: any) =>
                  d.line
              )
              .join(" ")
          : generatedVoice;

      // --------------------------------------------------
      // SCENE CHARACTERS
      // --------------------------------------------------

      const sceneCharacters =
        Array.isArray(
          scene.characters
        )
          ? scene.characters.map(
              (c: any) => ({
                ...c,

                gender:
                  typeof c.gender ===
                    "string" &&
                  c.gender.trim()
                    ? c.gender
                        .trim()
                        .toLowerCase()
                    : "unknown",
              })
            )
          : [];

      // --------------------------------------------------
      // FINAL PROCESSED SCENE
      // --------------------------------------------------

      return {
        ...scene,

        /*
         * The title is normalized by the server.
         * Gemini cannot change scene numbering.
         */
        title:
          `Scene ${sceneNum}`,

        /*
         * The duration is ALWAYS taken from the
         * authoritative production plan.
         */
        duration:
          sceneDuration,

        /*
         * Voice is derived from the validated dialogue
         * or preserved generated voice field.
         */
        voice:
          dialogueVoice,

        dialogue:
          processedDialogue,

        voiceLanguage,

        aspectRatio,

        characters:
          sceneCharacters,
      };
    }
  );

// ========================================================
// FINAL SCENE PLAN ASSERTION
// ========================================================

/*
 * Final safety check before returning the story.
 *
 * The downstream pipeline must never receive a scene
 * count or duration that differs from the production plan.
 */
if (
  processedScenes.length !==
  sceneDurations.length
) {
  throw new Error(
    `Internal scene processing error: expected ${sceneDurations.length} scenes but produced ${processedScenes.length}.`
  );
}

const processedTotalDuration =
  processedScenes.reduce(
    (
      total: number,
      scene: any
    ) =>
      total +
      Number(
        scene.duration || 0
      ),
    0
  );

if (
  processedTotalDuration !==
  duration
) {
  throw new Error(
    `Internal duration synchronization error: expected ${duration}s but processed scenes total ${processedTotalDuration}s.`
  );
}

// ========================================================
// FINAL RESPONSE
// ========================================================

return NextResponse.json({
  success: true,

  provider:
    result.provider,

  hook:
    typeof json.hook ===
    "string"
      ? json.hook
      : "",

  // ------------------------------------------------------
  // GLOBAL CHARACTERS
  // ------------------------------------------------------

  characters:
    Array.isArray(
      json.characters
    )
      ? json.characters.map(
          (c: any) => ({
            ...c,

            gender:
              typeof c.gender ===
                "string" &&
              c.gender.trim()
                ? c.gender
                    .trim()
                    .toLowerCase()
                : "unknown",

            voiceType:
              typeof c.voiceType ===
                "string" &&
              c.voiceType.trim()
                ? c.voiceType.trim()
                : "adult_male",
          })
        )
      : [],

  // ------------------------------------------------------
  // PROCESSED SCENES
  // ------------------------------------------------------

  scenes:
    processedScenes,
});

} catch (error) {
console.error(
"Story generation API Error:",
error
);

// ========================================================
// QUOTA ERROR
// ========================================================

const status =
  error &&
  typeof error === "object" &&
  "status" in error &&
  typeof error.status ===
    "number"
    ? error.status
    : 500;

if (status === 429) {
  return NextResponse.json(
    {
      success: false,
      status:
        "quota_exceeded",
      message:
        "AI API quota exceeded. Please try again later.",
    },
    { status: 429 }
  );
}

// ========================================================
// GENERIC ERROR
// ========================================================

return NextResponse.json(
  {
    success: false,
    message:
      "Story generation failed.",
  },
  { status: 500 }
);
}
}