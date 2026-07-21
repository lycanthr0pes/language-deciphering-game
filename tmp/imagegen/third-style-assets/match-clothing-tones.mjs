import sharp from "sharp";

const jobs = [
  {
    input: "public/assets/images/masked-man-normal.png",
    output: "tmp/imagegen/third-style-assets/masked-man-normal-toned.png",
    redScale: [0.73, 0.51, 0.47],
    darkScale: [0.5, 0.5, 0.5],
    includeDark: () => true,
  },
  {
    input: "public/assets/images/masked-man-draw.png",
    output: "tmp/imagegen/third-style-assets/masked-man-draw-toned.png",
    redScale: [0.78, 0.88, 0.79],
    darkScale: [0.78, 0.77, 0.79],
    includeDark: (x) => x > 300,
  },
  {
    input: "public/assets/images/masked-man-aim-player.png",
    output: "tmp/imagegen/third-style-assets/masked-man-aim-player-toned.png",
    redScale: [0.89, 0.61, 0.64],
    darkScale: [0.84, 0.77, 0.85],
    includeDark: (x, y) => x < 430 || x > 820 || y > 1050,
  },
];

const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));

for (const job of jobs) {
  const { data, info } = await sharp(job.input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let y = 650; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const a = data[offset + 3];

      if (a === 0) continue;

      const isRedFabric = r > 35 && r > g * 1.45 && r > b * 1.18;
      const isNeutralDark =
        Math.max(r, g, b) < 70 &&
        Math.max(r, g, b) - Math.min(r, g, b) <= 8 &&
        b >= r - 2;

      const scale = isRedFabric
        ? job.redScale
        : isNeutralDark && job.includeDark(x, y)
          ? job.darkScale
          : null;

      if (!scale) continue;

      data[offset] = clamp(r * scale[0]);
      data[offset + 1] = clamp(g * scale[1]);
      data[offset + 2] = clamp(b * scale[2]);
    }
  }

  await sharp(data, { raw: info }).png().toFile(job.output);
}
