#!/usr/bin/env node
// Regenerates the "Built with Comark" screenshots on the ecosystem page.
// Requires the Playwright browsers to be installed (`npx playwright install chromium`)
// and `cwebp` (from libwebp) on PATH.
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/ecosystem-images')
mkdirSync(outDir, { recursive: true })

// 16:9 to match the UBlogPost card header; downscaled 2x for a sharp retina capture.
const VIEWPORT = '1280,720'
const OUT_SIZE = ['960', '540']

const shots = [
  { name: 'comark-dev', url: 'https://comark.dev' },
  { name: 'unifont-dev', url: 'https://unifont.dev' },
  { name: 'graphs-demo', url: 'https://comark-graphs-demo.vercel.app' },
  { name: 'kitchen-sink', url: 'https://v0-kitchen-sink-demo.vercel.app' },
  { name: 'roe-dev', url: 'https://roe.dev' },
]

for (const { name, url } of shots) {
  const png = join(outDir, `${name}.png`)
  const webp = join(outDir, `${name}.webp`)
  console.log(`Capturing ${url}`)
  execFileSync(
    'npx',
    [
      'playwright',
      'screenshot',
      '--viewport-size',
      VIEWPORT,
      '--color-scheme',
      'dark',
      '--wait-for-timeout',
      '2500',
      url,
      png,
    ],
    { stdio: 'inherit' }
  )
  execFileSync('cwebp', ['-q', '78', '-resize', ...OUT_SIZE, png, '-o', webp], { stdio: 'inherit' })
  rmSync(png)
  console.log(`-> ${webp}`)
}
