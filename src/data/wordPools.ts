import type { InternalCategory } from "@/lib/gameTypes";

export const WORD_POOLS = {
  color: [
    { ja: "赤い", cipher: "raka" },
    { ja: "青い", cipher: "rami" },
  ],
  quality: [
    { ja: "大きな", cipher: "doka" },
    { ja: "小さな", cipher: "domi" },
  ],
  quantity: [
    { ja: "いくつかの", cipher: "taka" },
    { ja: "たくさんの", cipher: "tami" },
  ],
  verb: [
    { ja: "見る", cipher: "vika" },
    { ja: "追う", cipher: "vimi" },
  ],
  humanNoun: [
    { ja: "男", cipher: "huka" },
    { ja: "女", cipher: "humi" },
  ],
  animalNoun: [
    { ja: "犬", cipher: "keka" },
    { ja: "猫", cipher: "kemi" },
  ],
} as const satisfies Record<
  InternalCategory,
  readonly { ja: string; cipher: string }[]
>;