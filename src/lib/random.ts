export type RandomSource = () => number;

function hashSeed(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createSeededRandom(seedText: string): RandomSource {
  let value = hashSeed(seedText);

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(
  source: readonly T[],
  random: RandomSource,
): T[] {
  const result = [...source];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function createRunSeed() {
  const values = crypto.getRandomValues(new Uint32Array(4));
  return Array.from(values, (value) => value.toString(16).padStart(8, "0")).join(
    "",
  );
}
