export const LEVEL_1_EXAMPLE_TEMPLATES: string[][] = [
  ["raka", "huka"],
  ["rami", "huka"],
  ["raka", "humi"],
];

export const LEVEL_NEW_EXAMPLE_TEMPLATES: Partial<Record<number, string[][]>> = {
  2: [["raka", "kemi"]],
  3: [["doka", "keka"]],
  4: [["tami", "kemi"]],
  5: [["huka", "vimi"]],
  6: [["raka", "domi", "humi"]],
  7: [["taka", "huka", "vika"]],
  8: [["tami", "rami", "domi", "keka", "vimi"]],
};

export function getExampleTemplatesForLevel(level: number): string[][] {
  if (level === 1) {
    return LEVEL_1_EXAMPLE_TEMPLATES;
  }

  return LEVEL_NEW_EXAMPLE_TEMPLATES[level] ?? [];
}
