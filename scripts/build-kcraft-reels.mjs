import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const [, , source, outputDir] = process.argv;
if (!source || !outputDir) {
  throw new Error('usage: node build-kcraft-reels.mjs <sprite-sheet> <output-dir>');
}

const metadata = await sharp(source).metadata();
const cellWidth = Math.floor(metadata.width / 2);
const cellHeight = Math.floor(metadata.height / 4);
const orders = [
  [0, 2, 4, 6, 1, 3, 5, 7],
  [1, 3, 5, 7, 0, 2, 4, 6],
  [4, 0, 6, 2, 5, 1, 7, 3],
];

const cells = await Promise.all(
  Array.from({ length: 8 }, (_, index) => {
    const square = Math.min(cellWidth, cellHeight);
    const left = (index % 2) * cellWidth + Math.floor((cellWidth - square) / 2);
    const top = Math.floor(index / 2) * cellHeight;
    return sharp(source)
      .extract({ left, top, width: square, height: square })
      .resize(400, 400, { fit: 'contain' })
      .extend({
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
        background: '#111417',
      })
      .png()
      .toBuffer();
  }),
);

const names = ['diamond', 'emerald', 'gold', 'redstone', 'creeper', 'golden-apple', 'nether-star', 'tnt'];
for (let index = 0; index < cells.length; index += 1) {
  await sharp(cells[index]).png({ compressionLevel: 9 }).toFile(path.join(outputDir, `${names[index]}.png`));
}

// The GLB reel UVs invert each tile vertically and horizontally on the cylinder.
// Rotate only the reel copies so symbols render upright; standalone UI icons stay unchanged.
const reelCells = await Promise.all(
  cells.map((cell) => sharp(cell).rotate(180).png().toBuffer()),
);

for (let reel = 0; reel < orders.length; reel += 1) {
  const composites = orders[reel].map((cell, row) => ({
    input: reelCells[cell],
    left: 0,
    top: row * 500,
  }));
  await sharp({
    create: { width: 500, height: 4000, channels: 3, background: '#111417' },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, `reel_${reel}.png`));
}
