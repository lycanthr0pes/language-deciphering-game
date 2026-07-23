import type {
  CipherGlyphEntry,
  CipherId,
  CipherSlotIndex,
  ShortCipherSlotIndex,
  WordCategory,
} from "@/lib/gameTypes";

const CATEGORY_CODE_POINTS: Record<WordCategory, number> = {
  color: 0x1e800,
  quality: 0x1e801,
  quantity: 0x1e802,
  noun: 0x1e803,
  verb: 0x1e804,
};

const WORD_CODE_POINTS: Record<CipherSlotIndex, number> = {
  1: 0x1e805,
  2: 0x1e806,
  3: 0x1e807,
  4: 0x1e808,
  5: 0x1e809,
  6: 0x1e80a,
  7: 0x1e80b,
  8: 0x1e80c,
};

export function createGlyphText(
  category: WordCategory,
  slotIndex: CipherSlotIndex,
) {
  return String.fromCodePoint(
    CATEGORY_CODE_POINTS[category],
    WORD_CODE_POINTS[slotIndex],
  );
}

function makeCipherGlyph(
  cipherId: CipherId,
  category: WordCategory,
  slotIndex: CipherSlotIndex,
): CipherGlyphEntry {
  return {
    cipherId,
    glyphText: createGlyphText(category, slotIndex),
  };
}

function shortCipherIds(
  prefix: "color" | "quality" | "quantity" | "verb",
): CipherId[] {
  return ([1, 2, 3, 4] as ShortCipherSlotIndex[]).map(
    (slot) => `${prefix}-${slot}` as CipherId,
  );
}

const ALL_CIPHER_IDS: CipherId[] = [
  ...shortCipherIds("color"),
  ...shortCipherIds("quality"),
  ...shortCipherIds("quantity"),
  ...([1, 2, 3, 4, 5, 6, 7, 8] as CipherSlotIndex[]).map(
    (slot) => `noun-${slot}` as CipherId,
  ),
  ...shortCipherIds("verb"),
];

export const CIPHER_GLYPHS = Object.fromEntries(
  ALL_CIPHER_IDS.map((cipherId) => {
    const [category, slotText] = cipherId.split("-") as [
      WordCategory,
      `${CipherSlotIndex}`,
    ];
    return [
      cipherId,
      makeCipherGlyph(cipherId, category, Number(slotText) as CipherSlotIndex),
    ];
  }),
) as Record<CipherId, CipherGlyphEntry>;

export const REQUIRED_MENDE_GLYPHS = [
  ...Object.values(CATEGORY_CODE_POINTS),
  ...Object.values(WORD_CODE_POINTS),
]
  .map((codePoint) => String.fromCodePoint(codePoint))
  .join("");

export function getCipherGlyph(cipherId: CipherId) {
  return CIPHER_GLYPHS[cipherId];
}
