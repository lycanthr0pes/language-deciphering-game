import type { CipherId, InternalCategory } from "@/lib/gameTypes";

export const WORD_POOLS = {
  color: [
    { ja: "赤い", cipherId: "color-1" },
    { ja: "青い", cipherId: "color-2" },
  ],
  quality: [
    { ja: "大きな", cipherId: "quality-1" },
    { ja: "小さな", cipherId: "quality-2" },
  ],
  quantity: [
    { ja: "いくつかの", cipherId: "quantity-1" },
    { ja: "たくさんの", cipherId: "quantity-2" },
  ],
  verb: [
    { ja: "見る", cipherId: "verb-1" },
    { ja: "追う", cipherId: "verb-2" },
  ],
  humanNoun: [
    { ja: "男", cipherId: "humanNoun-1" },
    { ja: "女", cipherId: "humanNoun-2" },
  ],
  animalNoun: [
    { ja: "犬", cipherId: "animalNoun-1" },
    { ja: "猫", cipherId: "animalNoun-2" },
  ],
} as const satisfies Record<
  InternalCategory,
  readonly { ja: string; cipherId: CipherId }[]
>;
