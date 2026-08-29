"use client";

type CharacterData = {
  characterId?: string;
  name?: string;
  age?: string;
  appearance?: string;
  faceStructure?: string;
  skinTone?: string;
  hair?: string;
  eyes?: string;
  bodyType?: string;
  distinctiveFeatures?: string;
  clothing?: string;
  footwear?: string;
  accessories?: string;
  visualIdentity?: string;
  action?: string;
  emotion?: string;
  positionInFrame?: string;
};

type CharacterEngineProps = {
  idea: string;
  character: string;
  style: string;
  goal?: string;
  audience?: string;
  characters?: CharacterData[];
};

export default function CharacterEngine({
  idea,
  character,
  style,
  goal,
  audience,
  characters = [],
}: CharacterEngineProps) {
  const realCharacters = characters.filter(
    (item) => item.name && item.name.trim().length > 0
  );

  const fallbackCharacters: CharacterData[] =
    character === "One Main Character"
      ? [
          {
            name: "Protagonist",
            age: audience === "Kids" ? "10 years old child" : "Young adult",
            appearance:
              style === "3D"
                ? "3D cinematic hero character, expressive eyes, defined facial features"
                : "Realistic cinematic character with detailed facial structure",
            clothing: "Locked adventure outfit tailored for strict scene continuity",
            visualIdentity: "Consistent visual anchor throughout the storyline",
          },
        ]
      : character === "Multiple Characters"
      ? [
          {
            name: "Adventure Cast",
            age: "Diverse age group",
            appearance: "Distinct cast of cinematic characters with preserved individual traits",
            clothing: "Coordinated thematic outfits with individual color identities",
            visualIdentity: "Multiple locked visual anchors across the storyline",
          },
        ]
      : character === "Animals"
      ? [
          {
            name: "Hero Companion",
            age: "Young animal",
            appearance: "Cinematic expressive animal with distinct fur and eye features",
            clothing: "Natural appearance",
            visualIdentity: "Preserved creature anatomy across all scenes",
          },
        ]
      : [];

  const displayCharacters =
    realCharacters.length > 0 ? realCharacters : fallbackCharacters;

  return (
    <div className="mt-8 rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">👤 Character Consistency Engine</h3>
          <p className="mt-1 text-sm text-gray-400">
            Immutable identity, clothing, and facial features anchors.
          </p>
        </div>
        <span className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-bold text-purple-300">
          {displayCharacters.length} Character{displayCharacters.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {displayCharacters.map((char, index) => (
          <div
            key={char.characterId || char.name || index}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="text-lg font-bold text-white">
                👤 {char.name || `Character ${index + 1}`}
              </h4>
              <span className="rounded-lg bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400">
                🔒 Identity Locked
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-gray-300 md:grid-cols-2">
              {char.age && <p>🎂 Age: <span className="font-semibold text-white">{char.age}</span></p>}
              {char.appearance && <p>👀 Appearance: <span className="font-semibold text-white">{char.appearance}</span></p>}
              {char.clothing && <p>👕 Locked Outfit: <span className="font-semibold text-cyan-300">{char.clothing}</span></p>}
              {char.hair && <p>💇 Hair: <span className="font-semibold text-white">{char.hair}</span></p>}
              {char.eyes && <p>👁 Eyes: <span className="font-semibold text-white">{char.eyes}</span></p>}
              {char.faceStructure && <p>📐 Facial Structure: <span className="font-semibold text-white">{char.faceStructure}</span></p>}
              {char.accessories && <p>🎒 Accessories: <span className="font-semibold text-white">{char.accessories}</span></p>}
              {char.visualIdentity && <p>🎨 Visual Anchor: <span className="font-semibold text-white">{char.visualIdentity}</span></p>}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3.5">
              <p className="text-xs font-semibold text-gray-400">🎯 Master Prompt Anchor</p>
              <p className="mt-1 text-xs text-gray-200">
                {[
                  style,
                  char.name,
                  char.appearance,
                  char.visualIdentity,
                  char.clothing,
                  char.hair,
                  char.eyes,
                  char.distinctiveFeatures,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}