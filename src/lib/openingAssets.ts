const BACKGROUND_ROOM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#120f0c"/><rect x="0" y="720" width="1920" height="360" fill="#1a1410"/><rect x="700" y="760" width="520" height="140" fill="#2a2218"/><rect x="860" y="700" width="200" height="60" fill="#332a20"/></svg>`;

const MAN_NORMAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1080" viewBox="0 0 960 1080"><rect width="960" height="1080" fill="transparent"/><ellipse cx="480" cy="420" rx="120" ry="150" fill="#2a2520"/><rect x="360" y="520" width="240" height="320" rx="24" fill="#1f1b17"/><rect x="410" y="360" width="140" height="90" rx="18" fill="#3a3530"/><circle cx="445" cy="405" r="10" fill="#665544"/><circle cx="515" cy="405" r="10" fill="#665544"/></svg>`;

function svgDataUri(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const OPENING_ASSET_PATHS = {
  backgroundRoom: svgDataUri(BACKGROUND_ROOM_SVG),
  manNormal: svgDataUri(MAN_NORMAL_SVG),
} as const;
