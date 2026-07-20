import { REQUIRED_MENDE_GLYPHS } from "@/data/cipherGlyphs";

export async function loadMendeCipherFont() {
  if (typeof document === "undefined") {
    return false;
  }

  await document.fonts.ready;
  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-mende-cipher")
    .trim();
  if (!fontFamily) return false;

  const loaded = await document.fonts.load(
    `16px ${fontFamily}`,
    REQUIRED_MENDE_GLYPHS,
  );

  return loaded.some((fontFace) => fontFace.status === "loaded");
}
