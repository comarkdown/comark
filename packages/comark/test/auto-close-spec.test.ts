/**
 * Runs comark's autoCloseMarkdown against every ```diff case in SPEC/auto-close.md
 * via the portable diff-cases/v2 spec-runner.
 *
 * Filter by section — Vitest rejects unknown CLI flags, so pass via env or the
 * tiny wrapper (which sets the env and strips `--section` before Vitest sees it):
 *
 *   SPEC_SECTION="Bold + italic" pnpm vitest run test/auto-close-spec.test.ts
 *   node test/auto-close-spec-cli.mjs --section="Bold + italic"
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { autoCloseMarkdown } from '../src/internal/parse/auto-close/index.ts'
import { describe, expect, it } from 'vitest'
import {
  compareSpecFile,
  formatCompareMarkdown,
  sectionAwareMapOptions,
  toGenericAutoCloseOptions,
} from './spec-runner.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPEC_PATH = join(__dirname, '../SPEC/auto-close.md')

/** Section filter from `SPEC_SECTION` / `SECTION` (set by the CLI wrapper or shell). */
function sectionFromEnv(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const raw = env.SPEC_SECTION ?? env.SECTION
  if (raw === undefined) return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/** Map portable SPEC options onto comark's AutoCloseOptions. */
function map(opts: Record<string, unknown>): Record<string, unknown> {
  const generic = toGenericAutoCloseOptions(opts)
  return {
    ...generic,
    // Pass block/inline math independently (comark supports both flags).
    blockMath: generic.blockMath === true,
    inlineMath: generic.inlineMath === true,
    // SPEC is CommonMark/GFM — disable Comark component closing.
    syntax: false,
    frontmatter: false,
  }
}

const section = sectionFromEnv()

const report = compareSpecFile(
  SPEC_PATH,
  [{ name: 'comark', fn: (input, opts) => autoCloseMarkdown(input, map(opts)) }],
  {
    mapOptions: sectionAwareMapOptions,
    ...(section !== undefined ? { section } : {}),
  }
)

describe('comark — autoCloseMarkdown vs SPEC/auto-close.md', () => {
  it(section ? `reports SPEC results [${section}]` : 'reports SPEC results', () => {
    console.log('\n' + formatCompareMarkdown(report))

    expect(report.caseCount).toBeGreaterThan(0)
    expect(report.candidates[0].failed).toBe(0)
    expect(report.ranking[0]).toMatchObject({
      name: 'comark',
      passed: expect.any(Number),
      failed: expect.any(Number),
      matchRate: expect.any(Number),
      durationMs: expect.any(Number),
      meanMs: expect.any(Number),
      opsPerSec: expect.any(Number),
    })

    expect(report).toMatchObject({
      filePath: SPEC_PATH,
      caseCount: expect.any(Number),
      candidates: [
        expect.objectContaining({
          name: 'comark',
          total: report.caseCount,
          passed: expect.any(Number),
          failed: expect.any(Number),
          matchRate: expect.any(Number),
          bySection: expect.any(Array),
          failures: expect.any(Array),
          results: expect.any(Array),
        }),
      ],
      ranking: expect.any(Array),
    })

    // When a section is selected, require a clean pass so `--section` is useful for bisection.
    // Full-SPEC runs keep going green while implementation gaps remain (tracked in the report).
    if (section !== undefined) {
      expect(
        report.candidates.every((c: { failed: number }) => c.failed === 0),
        'all candidates should pass'
      ).toBe(true)
    }
  })
})
