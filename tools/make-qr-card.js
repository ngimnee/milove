/* --------------------------------------------------------------------------
   MAKE QR CARD - builds assets/qr-milove.png (the share card shown in the
   "Chia sẻ" dialog and handed out to other people).

   Usage (see README, section "Mã QR Chia Sẻ"):
     node tools/make-qr-card.js [url] [photo] [out]

   Defaults:
     url   https://ngimnee.github.io/milove/
     photo ./assets/images/anh-va-em-chibi.png
     out   ./assets/qr-milove.png

   Needs the npm packages `qrcode` and `sharp` (installed outside the project,
   so the site stays "no npm, no build"). The title and captions use fonts that
   ship with Windows: Lucida Calligraphy and Segoe UI Variable. On another OS
   install them or change the font stacks below.
   -------------------------------------------------------------------------- */

let QRCode;
let sharp;
try {
  QRCode = require('qrcode');
  sharp = require('sharp');
} catch (err) {
  console.error('Missing packages. Install them first: npm i qrcode sharp (see README, "Mã QR Chia Sẻ").');
  process.exit(1);
}

const [,, urlArg, photoArg, outArg] = process.argv;
const URL = urlArg || 'https://ngimnee.github.io/milove/';
const PHOTO = photoArg || './assets/images/anh-va-em-chibi.png';
const OUT = outArg || './assets/qr-milove.png';

// Texts on the card
const TITLE = 'Bức Tâm Thư';
const SUBTITLE = 'Một lá thư dành riêng cho em';
const CAPTION = 'Quét mã để mở thư';
const URL_LABEL = 'ngimnee.github.io/milove';

// Face crop taken from the source photo (a square around the face), then resized into the QR centre
const PHOTO_CROP = { left: 520, top: 40, width: 520, height: 520 };
const PHOTO_SIZE = 190;

// Fonts
const FONT_TITLE = "'Lucida Calligraphy', 'Monotype Corsiva', cursive";
const FONT_DISPLAY = "'Segoe UI Variable Display', 'Segoe UI', Arial, sans-serif";
const FONT_TEXT = "'Segoe UI Variable Text', 'Segoe UI', Arial, sans-serif";

(async () => {
  // Error correction H (30%) lets the centre photo cover modules without breaking the scan
  const qr = QRCode.create(URL, { errorCorrectionLevel: 'H' });
  const N = qr.modules.size;
  const isDark = (x, y) => qr.modules.get(x, y);

  // Card geometry (px)
  const W = 1080;
  const PANEL = 800;      // white square holding the QR
  const PAD = 56;         // white padding inside the panel
  const PANEL_X = (W - PANEL) / 2;
  const PANEL_Y = 290;
  const H = PANEL_Y + PANEL + 226;
  const cell = (PANEL - 2 * PAD) / N;
  const ox = PANEL_X + PAD;
  const oy = PANEL_Y + PAD;
  const cx = ox + N * cell / 2;
  const cy = oy + N * cell / 2;

  // Modules close to the centre are left out to make room for the photo
  const CLEAR_RADIUS = cell * 4.6;
  const inFinder = (x, y) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);

  // Data modules become round dots (radius slightly above half a cell so neighbours touch)
  let dots = '';
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!isDark(x, y) || inFinder(x, y)) continue;
      const mx = ox + (x + 0.5) * cell;
      const my = oy + (y + 0.5) * cell;
      if (Math.hypot(mx - cx, my - cy) < CLEAR_RADIUS) continue;
      dots += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${(cell * 0.52).toFixed(1)}"/>`;
    }
  }

  // The three finder squares (corner "eyes") become rounded squares
  const r1 = cell * 2.2;
  const r2 = cell * 1.2;
  const finder = (fx, fy) => {
    const x = ox + fx * cell;
    const y = oy + fy * cell;
    const s = 7 * cell;
    const a = s - cell * 4.4;
    return `<path fill-rule="evenodd" d="M${x + r1},${y} h${a} a${r1},${r1} 0 0 1 ${r1},${r1} v${a} a${r1},${r1} 0 0 1 -${r1},${r1} h-${a} a${r1},${r1} 0 0 1 -${r1},-${r1} v-${a} a${r1},${r1} 0 0 1 ${r1},-${r1} z M${x + r1},${y + cell} h${a} a${r2},${r2} 0 0 1 ${r2},${r2} v${a} a${r2},${r2} 0 0 1 -${r2},${r2} h-${a} a${r2},${r2} 0 0 1 -${r2},-${r2} v-${a} a${r2},${r2} 0 0 1 ${r2},-${r2} z"/>` +
      `<rect x="${x + cell * 2}" y="${y + cell * 2}" width="${cell * 3}" height="${cell * 3}" rx="${cell * 0.9}"/>`;
  };

  const face = await sharp(PHOTO).extract(PHOTO_CROP).resize(PHOTO_SIZE, PHOTO_SIZE).png().toBuffer();
  const faceUri = 'data:image/png;base64,' + face.toString('base64');
  const d = PHOTO_SIZE;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150d2e"/><stop offset="1" stop-color="#0a0616"/></linearGradient>
    <radialGradient id="blobA" cx="0%" cy="0%" r="80%"><stop offset="0" stop-color="#ff3d94" stop-opacity=".55"/><stop offset="1" stop-color="#ff3d94" stop-opacity="0"/></radialGradient>
    <radialGradient id="blobB" cx="100%" cy="100%" r="85%"><stop offset="0" stop-color="#7b3fe4" stop-opacity=".6"/><stop offset="1" stop-color="#7b3fe4" stop-opacity="0"/></radialGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7eb6" stop-opacity=".9"/><stop offset=".5" stop-color="#ff7eb6" stop-opacity=".12"/><stop offset="1" stop-color="#9b6bff" stop-opacity=".9"/></linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffc2dc"/></linearGradient>
    <linearGradient id="ink" gradientUnits="userSpaceOnUse" x1="${ox}" y1="${oy}" x2="${ox + N * cell}" y2="${oy + N * cell}"><stop offset="0" stop-color="#c2185b"/><stop offset="1" stop-color="#4a1d8f"/></linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7eb6"/><stop offset="1" stop-color="#9b6bff"/></linearGradient>
    <path id="heart" d="M0,0.45 C-0.55,0.05 -0.6,-0.25 -0.35,-0.4 C-0.18,-0.5 -0.03,-0.42 0,-0.25 C0.03,-0.42 0.18,-0.5 0.35,-0.4 C0.6,-0.25 0.55,0.05 0,0.45 Z"/>
    <linearGradient id="lineL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8fc0" stop-opacity="0"/><stop offset="1" stop-color="#ff8fc0" stop-opacity=".9"/></linearGradient>
    <linearGradient id="lineR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8fc0" stop-opacity=".9"/><stop offset="1" stop-color="#ff8fc0" stop-opacity="0"/></linearGradient>
    <filter id="titleGlow" x="-20%" y="-40%" width="140%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#ff69b4" flood-opacity=".55"/></filter>
    <filter id="panelShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="26" flood-color="#ff3d94" flood-opacity=".35"/></filter>
  </defs>

  <!-- Background, colour blobs and gradient border -->
  <rect width="${W}" height="${H}" rx="56" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" rx="56" fill="url(#blobA)"/>
  <rect width="${W}" height="${H}" rx="56" fill="url(#blobB)"/>
  <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="55" fill="none" stroke="url(#edge)" stroke-width="3"/>

  <!-- Title and subtitle with small ornaments -->
  <text x="${W / 2}" y="160" text-anchor="middle" font-family="${FONT_TITLE}" font-size="92" fill="url(#title)" filter="url(#titleGlow)">${TITLE}</text>
  <rect x="130" y="205" width="166" height="2" fill="url(#lineL)"/>
  <rect x="784" y="205" width="166" height="2" fill="url(#lineR)"/>
  <use href="#heart" transform="translate(308 207) scale(15)" fill="#ff8fc0"/>
  <use href="#heart" transform="translate(772 207) scale(15)" fill="#ff8fc0"/>
  <text x="${W / 2}" y="216" text-anchor="middle" font-family="${FONT_TEXT}" font-weight="400" font-size="31" letter-spacing="0.6" fill="#d9c8f5">${SUBTITLE}</text>

  <!-- QR panel: dots + finder squares + centre photo -->
  <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL}" height="${PANEL}" rx="52" fill="#ffffff" filter="url(#panelShadow)"/>
  <g fill="url(#ink)">${dots}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</g>
  <circle cx="${cx}" cy="${cy}" r="${d / 2 + 22}" fill="#ffffff"/>
  <circle cx="${cx}" cy="${cy}" r="${d / 2 + 12}" fill="url(#ring)"/>
  <circle cx="${cx}" cy="${cy}" r="${d / 2 + 5}" fill="#ffffff"/>
  <clipPath id="photoClip"><circle cx="${cx}" cy="${cy}" r="${d / 2}"/></clipPath>
  <image href="${faceUri}" x="${cx - d / 2}" y="${cy - d / 2}" width="${d}" height="${d}" clip-path="url(#photoClip)"/>

  <!-- Caption and address -->
  <text x="${W / 2}" y="${PANEL_Y + PANEL + 88}" text-anchor="middle" font-family="${FONT_DISPLAY}" font-weight="600" font-size="35" fill="#ffffff">${CAPTION}</text>
  <text x="${W / 2}" y="${PANEL_Y + PANEL + 136}" text-anchor="middle" font-family="${FONT_TEXT}" font-weight="400" font-size="27" letter-spacing="0.8" fill="#b9a6dd">${URL_LABEL}</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(OUT);
  console.log(`Created ${OUT} (${W}x${H}) for ${URL}`);
})();
