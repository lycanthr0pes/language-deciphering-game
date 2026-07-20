import type { ExampleRecord, NotebookSpread } from "./gameTypes";

export function buildNotebookSpreads(
  examples: ExampleRecord[],
  maxExamplesPerSpread: number,
): NotebookSpread[] {
  const capacity = Math.max(2, Math.floor(maxExamplesPerSpread));

  if (examples.length === 0) {
    return [{ left: [], right: [] }];
  }

  const spreadCount = Math.ceil(examples.length / capacity);
  const leftPageCapacity = Math.ceil(capacity / 2);

  return Array.from({ length: spreadCount }, (_, spreadIndex) => {
    const start = spreadIndex * capacity;
    const spreadExamples = examples.slice(start, start + capacity);

    return {
      left: spreadExamples.slice(0, leftPageCapacity),
      right: spreadExamples.slice(leftPageCapacity),
    };
  });
}
