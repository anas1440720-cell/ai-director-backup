
import { NextResponse } from "next/server";
import {
  generateStory,
  calculateSceneDurations,
} from "@/lib/ai-provider";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ========================================================
    // VALIDATE IDEA
    // ========================================================

    if (!body.idea || !body.idea.trim()) {
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

    const duration = Number(body.duration);

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
      body.voiceLanguage === "en" ? "en" : "ar";

    const aspectRatio =
      body.aspectRatio === "16:9" ? "16:9" : "9:16";

    // ========================================================
    // GENERATE STORY
    // ========================================================

    const result = await generateStory(
      provider,
      body.idea,
      duration,
      {
        videoType:
          typeof body.videoType === "string"
            ? body.videoType
            : "",

        audience:
          typeof body.audience === "string"
            ? body.audience
            : "",

        goal:
          typeof body.goal === "string"
            ? body.goal
            : "",

        character:
          typeof body.character === "string"
            ? body.character
            : "",

        style:
          typeof body.style === "string"
            ? body.style
            : "",

        voiceLanguage,
        aspectRatio,
      }
    );

    // ========================================================
    // PROVIDER FAILURE
    // ========================================================

    if (!result.success || !("text" in result)) {
      return NextResponse.json(result);
    }

    // ========================================================
    // PARSE AI JSON
    // ========================================================

    let json: any;

    try {
      let raw = (result.text || "").trim();

      // Remove markdown code fences if AI added them.
      if (raw.startsWith("```json")) {
        raw = raw
          .replace(/^```json/, "")
          .replace(/```$/, "")
          .trim();
      } else if (raw.startsWith("```")) {
        raw = raw
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();
      }

      // Find the first complete JSON object.
      const firstBrace = raw.indexOf("{");

      if (firstBrace !== -1) {
        let depth = 0;
        let endIndex = -1;

        for (let i = firstBrace; i < raw.length; i++) {
          if (raw[i] === "{") {
            depth++;
          } else if (raw[i] === "}") {
            depth--;

            if (depth === 0) {
              endIndex = i;
              break;
            }
          }
        }

        if (endIndex !== -1) {
          raw = raw.slice(firstBrace, endIndex + 1);
        }
      }

      json = JSON.parse(raw);
    } catch {
      console.error(
        "AI returned invalid JSON:",
        result.text
      );

      return NextResponse.json(
        {
          success: false,
          message: "AI returned invalid story data.",
        },
        { status: 500 }
      );
    }

    // ========================================================
    // SCENE PROCESSING
    // ========================================================

    const sceneDurations =
      calculateSceneDurations(duration);

    const generatedScenes = Array.isArray(json.scenes)
      ? json.scenes
      : [];

    const processedScenes = sceneDurations.map(
      (sceneDuration, index) => {
        const sceneNum = index + 1;
        const scene = generatedScenes[index] || {};

        // ----------------------------------------------------
        // PRESERVE REAL GENERATED VOICE
        // Never invent narrator speech.
        // ----------------------------------------------------

        const generatedVoice =
          typeof scene.voice === "string" &&
          scene.voice.trim()
            ? scene.voice.trim()
            : "";

        // ----------------------------------------------------
        // PRESERVE VALID CHARACTER DIALOGUE ONLY
        // Never create fake narrator dialogue.
        // ----------------------------------------------------

        const processedDialogue =
          Array.isArray(scene.dialogue)
            ? scene.dialogue
                .filter(
                  (d: any) =>
                    d &&
                    typeof d.line === "string" &&
                    d.line.trim() &&
                    typeof d.speakerName === "string" &&
                    d.speakerName.trim()
                )
                .map((d: any) => ({
                  speakerName: d.speakerName.trim(),

                  characterType:
                    typeof d.characterType === "string" &&
                    d.characterType.trim()
                      ? d.characterType.trim()
                      : "adult",

                  line: d.line.trim(),
                }))
            : [];

        // ----------------------------------------------------
        // VOICE SCRIPT
        // Dialogue has priority.
        // Otherwise preserve generated voice.
        // ----------------------------------------------------

        const dialogueVoice =
          processedDialogue.length > 0
            ? processedDialogue
                .map((d: any) => d.line)
                .join(" ")
            : generatedVoice;

        // ----------------------------------------------------
        // SCENE CHARACTERS
        // Preserve all generated character information.
        // Normalize gender only.
        // ----------------------------------------------------

        const sceneCharacters =
          Array.isArray(scene.characters)
            ? scene.characters.map((c: any) => ({
                ...c,

                gender:
                  typeof c.gender === "string" &&
                  c.gender.trim()
                    ? c.gender.trim().toLowerCase()
                    : "unknown",
              }))
            : [];

        // ----------------------------------------------------
        // FINAL PROCESSED SCENE
        // ----------------------------------------------------

        return {
          ...scene,

          title: `Scene ${sceneNum}`,

          duration: sceneDuration,

          voice: dialogueVoice,

          dialogue: processedDialogue,

          voiceLanguage,

          aspectRatio,

          characters: sceneCharacters,
        };
      }
    );

    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      provider: result.provider,

      hook:
        typeof json.hook === "string"
          ? json.hook
          : "",

      // ------------------------------------------------------
      // GLOBAL CHARACTERS
      // ------------------------------------------------------

      characters:
        Array.isArray(json.characters)
          ? json.characters.map((c: any) => ({
              ...c,

              gender:
                typeof c.gender === "string" &&
                c.gender.trim()
                  ? c.gender.trim().toLowerCase()
                  : "unknown",

              voiceType:
                typeof c.voiceType === "string" &&
                c.voiceType.trim()
                  ? c.voiceType.trim()
                  : "adult_male",
            }))
          : [],

      // ------------------------------------------------------
      // PROCESSED SCENES
      // ------------------------------------------------------

      scenes: processedScenes,
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
      typeof error.status === "number"
        ? error.status
        : 500;

    if (status === 429) {
      return NextResponse.json(
        {
          success: false,
          status: "quota_exceeded",
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
        message: "Story generation failed.",
      },
      { status: 500 }
    );
  }
}