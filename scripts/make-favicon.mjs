import fs from 'node:fs';
import zlib from 'node:zlib';

// Create a 32x32 RGBA icon
const width = 32;
const height = 32;
const rgba = Buffer.alloc(width * height * 4);

// Background: #18181B (24, 24, 27)
const bg = [24, 24, 27, 255];
const border = [39, 39, 42, 255];
const bracket = [244, 244, 245, 255];
const slash = [16, 185, 129, 255]; // #10B981

function setPixel(x, y, [r, g, b, a]) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (y * width + x) * 4;
  rgba[idx] = r;
  rgba[idx + 1] = g;
  rgba[idx + 2] = b;
  rgba[idx + 3] = a;
}

function getPixel(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return [0, 0, 0, 0];
  const idx = (y * width + x) * 4;
  return [rgba[idx], rgba[idx + 1], rgba[idx + 2], rgba[idx + 3]];
}

function drawLine(x0, y0, x1, y1, color, thickness = 2.5) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 4;
  const rad = thickness / 2;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = x0 + (x1 - x0) * t;
    const cy = y0 + (y1 - y0) * t;
    for (let dy = -Math.ceil(rad); dy <= Math.ceil(rad); dy++) {
      for (let dx = -Math.ceil(rad); dx <= Math.ceil(rad); dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= rad) {
          const px = Math.round(cx + dx);
          const py = Math.round(cy + dy);
          setPixel(px, py, color);
        }
      }
    }
  }
}

// 1. Fill rounded rect
const radius = 7;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // Check rounded corner distance
    let inBounds = true;
    if (x < radius && y < radius) {
      if (Math.hypot(x - radius, y - radius) > radius) inBounds = false;
    } else if (x >= width - radius && y < radius) {
      if (Math.hypot(x - (width - radius - 1), y - radius) > radius) inBounds = false;
    } else if (x < radius && y >= height - radius) {
      if (Math.hypot(x - radius, y - (height - radius - 1)) > radius) inBounds = false;
    } else if (x >= width - radius && y >= height - radius) {
      if (Math.hypot(x - (width - radius - 1), y - (height - radius - 1)) > radius) inBounds = false;
    }

    if (inBounds) {
      // Check border (1px)
      const isBorder = (x === 0 || x === width - 1 || y === 0 || y === height - 1);
      setPixel(x, y, isBorder ? border : bg);
    } else {
      setPixel(x, y, [0, 0, 0, 0]);
    }
  }
}

// 2. Draw Chevrons & Slash
// Left Chevron (<): (10, 11) -> (5, 16) -> (10, 21)
drawLine(10, 11, 5, 16, bracket, 2.2);
drawLine(5, 16, 10, 21, bracket, 2.2);

// Right Chevron (>): (22, 11) -> (27, 16) -> (22, 21)
drawLine(22, 11, 27, 16, bracket, 2.2);
drawLine(27, 16, 22, 21, bracket, 2.2);

// Forward Slash (/): (18, 9) -> (14, 23)
drawLine(18, 9, 14, 23, slash, 2.2);

// Convert RGBA buffer to PNG
function createPNG(w, h, buffer) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    scanlines[y * (w * 4 + 1)] = 0; // filter None
    buffer.copy(scanlines, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }

  const idatData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc >>> 0, 8 + len);
  return buf;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

const pngBuffer = createPNG(width, height, rgba);

// Pack into ICO
function createICO(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2);  // color palette
  entry.writeUInt8(0, 3);  // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8); // size
  entry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

  return Buffer.concat([header, entry, png]);
}

const icoBuffer = createICO(pngBuffer);

fs.writeFileSync('app/favicon.ico', icoBuffer);
fs.writeFileSync('public/favicon.ico', icoBuffer);
console.log('Successfully generated app/favicon.ico and public/favicon.ico');
