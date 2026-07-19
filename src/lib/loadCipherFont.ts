import { mendeCipherFont } from "@/app/fonts";
import { REQUIRED_MENDE_GLYPHS } from "@/data/cipherGlyphs";

export async function loadMendeCipherFont() {
  if (typeof document === "undefined") {
    return false;
  }

  await document.fonts.ready;

  const loaded = await document.fonts.load(
    `16px ${mendeCipherFont.style.fontFamily}`,
    REQUIRED_MENDE_GLYPHS,
  );

  return loaded.length > 0;
}
