import { assetPath } from "./assetPath";

function preloadImage(path: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load image: ${path}`));
    image.src = assetPath(path);
  });
}

export async function loadOpeningAssets(
  paths: readonly string[],
  timeoutMs: number,
) {
  if (paths.length === 0) return true;
  if (typeof window === "undefined") return false;

  let timeoutId: number | undefined;
  const timeout = new Promise<false>((resolve) => {
    timeoutId = window.setTimeout(() => resolve(false), timeoutMs);
  });

  try {
    return await Promise.race([
      Promise.all(paths.map(preloadImage)).then(() => true as const),
      timeout,
    ]);
  } catch {
    return false;
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}
