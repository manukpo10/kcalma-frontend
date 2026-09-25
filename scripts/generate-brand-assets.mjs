// Regenerates every brand-derived asset (Login hero logo, header mark, PWA
// icons, apple-touch-icon, favicon) from the real logo at brand/logo.png
// (kept inside this package so the frontend repo is self-contained once it
// is split out — left untouched, never write to it).
//
// The source PNG has a soft glow/fringe around its shapes (alpha values up
// to roughly 70% just outside the crisp edges). ALPHA_THRESHOLD removes it:
// alpha at or below the threshold is dropped to 0, and the remaining range
// is linearly remapped back to 0-255 so the true edge anti-aliasing stays
// smooth instead of a hard cliff. Re-run `node _tmp_bbox` style analysis
// (git history) if the source logo ever changes shape/composition — the
// FULL_BBOX/MARK_BBOX crop rectangles below are specific to the current file.
//
// Usage: node scripts/generate-brand-assets.mjs

import sharp from 'sharp'
import sharpIco from 'sharp-ico'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.resolve(ROOT, 'brand', 'logo.png')
const PUBLIC_DIR = path.join(ROOT, 'public')
const BRAND_DIR = path.join(ROOT, 'src', 'assets', 'brand')

const THRESHOLD = 180 // ~70% alpha; see header comment
const DARK_BG = '#121110' // matches --bg in src/index.css

// Pixel rectangles within the 1254x1254 source (measured on the cleaned
// alpha channel): the full lockup (K mark + "kcalma" wordmark) and the K
// mark alone, excluding the wordmark.
const FULL_BBOX = { left: 131, top: 69, width: 1001, height: 1106 }
const MARK_BBOX = { left: 333, top: 69, width: 680, height: 845 }

async function cleanedSource() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const range = 255 - THRESHOLD
  for (let i = 0; i < data.length; i += channels) {
    const a = data[i + channels - 1]
    data[i + channels - 1] = a <= THRESHOLD ? 0 : Math.round(((a - THRESHOLD) / range) * 255)
  }
  return sharp(Buffer.from(data), { raw: { width, height, channels } })
}

/** Fits the K mark into `fillRatio` of a `size`x`size` canvas on a solid, fully opaque background. */
async function iconCanvas(markPngBuf, size, fillRatio) {
  const boxSize = Math.round(size * fillRatio)
  const markFitted = await sharp(markPngBuf)
    .resize({ width: boxSize, height: boxSize, fit: 'inside' })
    .toBuffer()
  const meta = await sharp(markFitted).metadata()
  const left = Math.round((size - meta.width) / 2)
  const top = Math.round((size - meta.height) / 2)
  return sharp({ create: { width: size, height: size, channels: 4, background: DARK_BG } })
    .composite([{ input: markFitted, left, top }])
    .flatten({ background: DARK_BG })
    .removeAlpha() // flatten alone leaves a (fully opaque) alpha channel on composited images
    .png()
}

async function main() {
  fs.mkdirSync(BRAND_DIR, { recursive: true })

  const fullPngBuf = await (await cleanedSource()).extract(FULL_BBOX).png().toBuffer()
  const markPngBuf = await (await cleanedSource()).extract(MARK_BBOX).png().toBuffer()

  // 1. Login hero: full lockup, transparent, ~512px tall.
  const fullResized = sharp(fullPngBuf).resize({ height: 512, withoutEnlargement: true })
  await fullResized.clone().png({ compressionLevel: 9 }).toFile(path.join(BRAND_DIR, 'logo-full.png'))
  await fullResized.clone().webp({ quality: 92 }).toFile(path.join(BRAND_DIR, 'logo-full.webp'))

  // 2. Header mark: K mark only, transparent, ~640px tall (displayed small via CSS).
  const markResized = sharp(markPngBuf).resize({ height: 640, withoutEnlargement: true })
  await markResized.clone().png({ compressionLevel: 9 }).toFile(path.join(BRAND_DIR, 'mark.png'))
  await markResized.clone().webp({ quality: 92 }).toFile(path.join(BRAND_DIR, 'mark.webp'))

  // 3. Standard app icons — comfortable padding.
  for (const size of [64, 192, 512]) {
    await (await iconCanvas(markPngBuf, size, 0.72)).toFile(path.join(PUBLIC_DIR, `pwa-${size}x${size}.png`))
  }

  // 4. Maskable icon — conservative fill so the mark survives any OS mask shape.
  await (await iconCanvas(markPngBuf, 512, 0.56)).toFile(path.join(PUBLIC_DIR, 'maskable-icon-512x512.png'))

  // 5. Apple touch icon — solid bg required, iOS does not support transparency.
  await (await iconCanvas(markPngBuf, 180, 0.72)).toFile(path.join(PUBLIC_DIR, 'apple-touch-icon-180x180.png'))

  // 6. favicon.ico (16/32/48), slightly larger fill so the mark stays legible that small.
  const icoBuffers = []
  for (const size of [16, 32, 48]) {
    icoBuffers.push(await (await iconCanvas(markPngBuf, size, 0.78)).toBuffer())
  }
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), sharpIco.encode(icoBuffers))

  // 7. Transparent, full-resolution K mark kept as the source for pwa-assets.config.ts.
  await sharp(markPngBuf).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC_DIR, 'logo-mark-source.png'))

  console.log('Brand assets regenerated in public/ and src/assets/brand/.')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
