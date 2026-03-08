/**
 * Icon generation script
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install sharp (dev only)
 *
 * Reads: public/logo-icon-green.png
 * Writes: public/icons/icon-{size}.png for all required sizes
 */
import { createRequire } from 'module';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('Sharp not installed. Run: npm install sharp --save-dev');
  process.exit(1);
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE = join(__dirname, '..', 'public', 'logo-icon-green.png');
const OUT_DIR = join(__dirname, '..', 'public', 'icons');

// iOS icon sizes (placed in public/icons/apple/)
const IOS_SIZES = [
  { size: 20,   scale: 1 }, { size: 20,   scale: 2 }, { size: 20,   scale: 3 },
  { size: 29,   scale: 1 }, { size: 29,   scale: 2 }, { size: 29,   scale: 3 },
  { size: 40,   scale: 1 }, { size: 40,   scale: 2 }, { size: 40,   scale: 3 },
  { size: 60,   scale: 2 }, { size: 60,   scale: 3 },
  { size: 76,   scale: 1 }, { size: 76,   scale: 2 },
  { size: 83.5, scale: 2 },
  { size: 1024, scale: 1 },
];

async function run() {
  if (!existsSync(SOURCE)) {
    console.error('Source not found:', SOURCE);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(join(OUT_DIR, 'apple'), { recursive: true });

  // PWA / Android icons
  for (const size of SIZES) {
    const out = join(OUT_DIR, `icon-${size}.png`);
    await sharp(SOURCE).resize(size, size).png({ quality: 95 }).toFile(out);
    console.log('OK', `icon-${size}.png`);
  }

  // Maskable icons (with 20% safe-area padding = visible on round Android icons)
  for (const size of [192, 512]) {
    const padded = Math.round(size * 0.8);
    const out = join(OUT_DIR, `icon-maskable-${size}.png`);
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 58, g: 79, b: 74, alpha: 1 } }
    })
      .composite([{ input: await sharp(SOURCE).resize(padded, padded).toBuffer(), gravity: 'center' }])
      .png({ quality: 95 })
      .toFile(out);
    console.log('OK', `icon-maskable-${size}.png`);
  }

  // iOS icons
  for (const { size, scale } of IOS_SIZES) {
    const px  = Math.round(size * scale);
    const tag = `${size}@${scale}x`;
    const out = join(OUT_DIR, 'apple', `icon-${tag}.png`);
    await sharp(SOURCE).resize(px, px).png({ quality: 95 }).toFile(out);
    console.log('OK', `apple/icon-${tag}.png`);
  }

  // 1024x1024 App Store icon (no alpha, no rounded corners - Apple adds them)
  const appStoreOut = join(OUT_DIR, 'apple', 'app-store-1024.png');
  await sharp(SOURCE)
    .resize(1024, 1024)
    .flatten({ background: { r: 244, g: 242, b: 238 } }) // remove alpha
    .png({ quality: 100 })
    .toFile(appStoreOut);
  console.log('OK', 'apple/app-store-1024.png (App Store icon)');

  console.log('\nAll icons generated in public/icons/');
  console.log('Upload apple/app-store-1024.png to App Store Connect manually');
}

run().catch(console.error);
