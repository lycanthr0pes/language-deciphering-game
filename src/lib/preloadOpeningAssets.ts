import { OPENING_ASSET_PATHS } from "@/lib/openingAssets";

const openingAssets = [
  OPENING_ASSET_PATHS.backgroundRoom,
  OPENING_ASSET_PATHS.manNormal,
];

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load asset"));
    image.src = src;
  });
}

export async function preloadOpeningAssets() {
  await Promise.all(openingAssets.map(preloadImage));
}
