import type {
  CandidateIndex,
  CipherGlyphEntry,
  CipherId,
  InternalCategory,
} from "@/lib/gameTypes";

const CATEGORY_CODE_POINTS: Record<InternalCategory, number> = {
  color: 0x1e865,
  quality: 0x1e822,
  quantity: 0x1e8a3,
  verb: 0x1e83d,
  humanNoun: 0x1e845,
  animalNoun: 0x1e83a,
};

const CANDIDATE_CODE_POINTS: Record<CandidateIndex, number> = {
  1: 0x1e854,
  2: 0x1e827,
};

function createGlyphText(
  category: InternalCategory,
  candidateIndex: CandidateIndex,
) {
  return String.fromCodePoint(
    CATEGORY_CODE_POINTS[category],
    CANDIDATE_CODE_POINTS[candidateIndex],
  );
}

export const CIPHER_GLYPHS = {
  "color-1": { cipherId: "color-1", glyphText: createGlyphText("color", 1) },
  "color-2": { cipherId: "color-2", glyphText: createGlyphText("color", 2) },
  "quality-1": {
    cipherId: "quality-1",
    glyphText: createGlyphText("quality", 1),
  },
  "quality-2": {
    cipherId: "quality-2",
    glyphText: createGlyphText("quality", 2),
  },
  "quantity-1": {
    cipherId: "quantity-1",
    glyphText: createGlyphText("quantity", 1),
  },
  "quantity-2": {
    cipherId: "quantity-2",
    glyphText: createGlyphText("quantity", 2),
  },
  "verb-1": { cipherId: "verb-1", glyphText: createGlyphText("verb", 1) },
  "verb-2": { cipherId: "verb-2", glyphText: createGlyphText("verb", 2) },
  "humanNoun-1": {
    cipherId: "humanNoun-1",
    glyphText: createGlyphText("humanNoun", 1),
  },
  "humanNoun-2": {
    cipherId: "humanNoun-2",
    glyphText: createGlyphText("humanNoun", 2),
  },
  "animalNoun-1": {
    cipherId: "animalNoun-1",
    glyphText: createGlyphText("animalNoun", 1),
  },
  "animalNoun-2": {
    cipherId: "animalNoun-2",
    glyphText: createGlyphText("animalNoun", 2),
  },
} satisfies Record<CipherId, CipherGlyphEntry>;

export const REQUIRED_MENDE_GLYPHS =
  Object.values(CIPHER_GLYPHS)
    .map((entry) => entry.glyphText)
    .join("") + " ";

export function getCipherGlyph(cipherId: CipherId) {
  return CIPHER_GLYPHS[cipherId];
}
