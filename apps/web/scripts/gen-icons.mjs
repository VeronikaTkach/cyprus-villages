/**
 * Generates PWA icon PNGs using only Node.js built-ins (zlib).
 * Run: node apps/web/scripts/gen-icons.mjs
 *
 * Design: teal (#12b886) background, white stylised "V" (for Villages).
 * The V is drawn as two thick line segments meeting at a rounded tip.
 */

import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, '../public/icons');

// ── PNG encoder ───────────────────────────────────────────────────────────────

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = (c >>> 8) ^ CRC_TABLE[(c ^ b) & 0xff];
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}
function encodePNG(w, h, pixels /* Uint8Array RGBA */) {
  const scanlines = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    scanlines[y * (1 + w * 4)] = 0; // filter: None
    for (let x = 0; x < w; x++) {
      const src = (y * w + x) * 4;
      const dst = y * (1 + w * 4) + 1 + x * 4;
      scanlines[dst] = pixels[src];
      scanlines[dst + 1] = pixels[src + 1];
      scanlines[dst + 2] = pixels[src + 2];
      scanlines[dst + 3] = pixels[src + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(scanlines)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

function setPixel(pixels, w, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= w || y < 0 || y >= w) return;
  const i = (y * w + x) * 4;
  pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = a;
}

function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Draw a thick anti-aliased line segment in white. */
function drawLine(pixels, w, ax, ay, bx, by, halfThick) {
  const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - halfThick - 1));
  const x1 = Math.min(w - 1, Math.ceil(Math.max(ax, bx) + halfThick + 1));
  const y0 = Math.max(0, Math.floor(Math.min(ay, by) - halfThick - 1));
  const y1 = Math.min(w - 1, Math.ceil(Math.max(ay, by) + halfThick + 1));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = distToSeg(x + 0.5, y + 0.5, ax, ay, bx, by);
      if (d <= halfThick + 0.5) {
        const alpha = Math.max(0, Math.min(1, halfThick + 0.5 - d));
        const ai = Math.round(alpha * 255);
        setPixel(pixels, w, x, y, 255, 255, 255, ai);
      }
    }
  }
}

/** Filled circle (for rounded V tip). */
function fillCircle(pixels, w, cx, cy, r) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d <= r + 0.5) {
        const alpha = Math.max(0, Math.min(1, r + 0.5 - d));
        setPixel(pixels, w, x, y, 255, 255, 255, Math.round(alpha * 255));
      }
    }
  }
}

// ── Icon drawing ──────────────────────────────────────────────────────────────

/**
 * Draw the Cyprus Villages "V" mark.
 * @param safe  fraction of size used as safe zone padding (0 = no padding).
 *              For maskable icons, set 0.1 (10% each side per spec).
 */
function drawIcon(size, safe = 0) {
  const pixels = new Uint8Array(size * size * 4);

  // Background: teal #12b886
  for (let i = 0; i < size * size; i++) {
    pixels[i * 4 + 0] = 0x12;
    pixels[i * 4 + 1] = 0xb8;
    pixels[i * 4 + 2] = 0x86;
    pixels[i * 4 + 3] = 0xff;
  }

  // Drawing canvas inset by safe zone
  const inset = size * safe;
  const s = size - inset * 2; // drawable size
  const ox = inset, oy = inset; // origin offset

  // V geometry (proportional to drawable size)
  const cx = ox + s / 2;              // center x
  const yTop = oy + s * 0.18;         // top of arms
  const yBottom = oy + s * 0.82;      // bottom tip
  const xLeft = ox + s * 0.12;        // left arm top-x
  const xRight = ox + s * 0.88;       // right arm top-x
  const thick = s * 0.095;            // half-thickness of arms

  // Left arm: top-left → tip
  drawLine(pixels, size, xLeft, yTop, cx, yBottom, thick);
  // Right arm: top-right → tip
  drawLine(pixels, size, xRight, yTop, cx, yBottom, thick);
  // Round the tip
  fillCircle(pixels, size, cx, yBottom, thick);

  return pixels;
}

// ── Generate files ────────────────────────────────────────────────────────────

const icons = [
  { name: 'icon-192.png',        size: 192, safe: 0    },
  { name: 'icon-512.png',        size: 512, safe: 0    },
  { name: 'icon-512-maskable.png', size: 512, safe: 0.1 },
  { name: 'apple-touch-icon.png', size: 180, safe: 0   },
];

for (const { name, size, safe } of icons) {
  const pixels = drawIcon(size, safe);
  const png = encodePNG(size, size, pixels);
  writeFileSync(join(OUT, name), png);
  console.log(`✓  ${name}  (${png.length} bytes)`);
}
