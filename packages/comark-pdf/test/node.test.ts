import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { renderPdfToBuffer, renderPdfToFile } from '../src/node.ts'
import math, { Math as MathComponent } from '../src/plugins/math.ts'
import { BASIC_MARKDOWN, ADVANCED_MARKDOWN } from './fixtures/markdown.ts'

const OUTPUT_DIR = fileURLToPath(new URL('./output/', import.meta.url))

beforeAll(async () => {
  await mkdir(OUTPUT_DIR, { recursive: true })
})

const isPdf = (bytes: Uint8Array) =>
  Buffer.from(bytes.slice(0, 4)).toString('ascii') === '%PDF'

describe('renderPdfToBuffer', () => {
  it('basic — returns a valid PDF buffer', async () => {
    const buffer = await renderPdfToBuffer(BASIC_MARKDOWN)
    expect(buffer).toBeInstanceOf(Uint8Array)
    expect(buffer.length).toBeGreaterThan(0)
    expect(isPdf(buffer)).toBe(true)
  }, 30_000)

  it('advanced — returns a valid PDF buffer with math plugin', async () => {
    const buffer = await renderPdfToBuffer(ADVANCED_MARKDOWN, {
      plugins: [math()],
      components: { Math: MathComponent },
    })
    expect(buffer).toBeInstanceOf(Uint8Array)
    expect(buffer.length).toBeGreaterThan(0)
    expect(isPdf(buffer)).toBe(true)
  }, 30_000)
})

describe('renderPdfToFile', () => {
  it('basic — writes output/basic.pdf', async () => {
    const path = join(OUTPUT_DIR, 'basic.pdf')
    await renderPdfToFile(BASIC_MARKDOWN, path)
    expect(existsSync(path)).toBe(true)
  }, 30_000)

  it('advanced — writes output/advanced.pdf with page footer and math plugin', async () => {
    const path = join(OUTPUT_DIR, 'advanced.pdf')
    await renderPdfToFile(ADVANCED_MARKDOWN, path, {
      pdf: { footer: 'Page {{ page }} of {{ totalPages }}' },
      plugins: [math()],
      components: { Math: MathComponent },
    })
    expect(existsSync(path)).toBe(true)
  }, 30_000)
})
