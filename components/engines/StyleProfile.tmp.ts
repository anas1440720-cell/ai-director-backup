// Temporary Fallback Style Profile Engine
export type VisualStyle =
  | "Realistic"
  | "3D"
  | "Anime"
  | "Pixar"
  | "Fantasy"
  | "Cartoon";

export function normalizeVisualStyle(style: string = "Realistic"): VisualStyle {
  const key = String(style || "").trim().toLowerCase();
  
  if (key.includes("3d")) return "3D";
  if (key.includes("anime")) return "Anime";
  if (key.includes("pixar")) return "Pixar";
  if (key.includes("fantasy")) return "Fantasy";
  if (key.includes("cartoon")) return "Cartoon";

  return "Realistic";
}

export function getStyleProfile(
  style: string = "Realistic",
  aspectRatio: string = "9:16"
) {
  const normalizedStyle = normalizeVisualStyle(style);
  const formatDesc =
    aspectRatio === "9:16"
      ? "vertical 9:16 full-frame composition"
      : "16:9 widescreen cinematic composition";

  // Temporary minimal profiles
  return {
    name: `${normalizedStyle.toUpperCase()} (TEMP)`,
    positive: `STRICT VISUAL STYLE: ${normalizedStyle.toUpperCase()}. ${formatDesc}.`,
    negative: "low quality, distorted, bad resolution.",
  };
}