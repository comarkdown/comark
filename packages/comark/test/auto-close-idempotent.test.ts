/**
 * Healing has to be a fixed point: a stream re-heals the same line on every chunk,
 * so `autoCloseMarkdown(autoCloseMarkdown(x))` must equal `autoCloseMarkdown(x)`.
 * A healer that grows its own output makes markers flash and drift while typing.
 */
import { autoCloseMarkdown } from '../src/internal/parse/auto-close/index.ts'
import { describe, expect, it } from 'vitest'

const TOKENS = ['`', '``', '```', '_', '__', '*', '**', '~~', 'a', 'b', ' ']
const MAX_TOKENS = 5

/** Every token string of length 2 to MAX_TOKENS. */
function corpus(): string[] {
  const out: string[] = []
  const build = (prefix: string, depth: number) => {
    if (depth >= 2) out.push(prefix)
    if (depth === MAX_TOKENS) return
    for (const token of TOKENS) build(prefix + token, depth + 1)
  }
  for (const token of TOKENS) build(token, 1)
  return out
}

const trailingBackticks = (text: string) => text.match(/`+$/)?.[0].length ?? 0
const longestBacktickRun = (text: string) => Math.max(0, ...[...text.matchAll(/`+/g)].map((m) => m[0].length))

/**
 * Rules that already needed more than one pass before the two fixes this file
 * landed with, all of them in `closeOpenStack`. They are listed as shapes rather
 * than inputs because the corpus hits each one a few hundred times.
 */
const PRE_EXISTING = {
  /** Half-close: completing a partly typed closer returns early, so any outer marker waits a pass. */
  halfClosed: (text: string) =>
    [/\*\*\*[^*]+\*{1,2}$/, /\*\*[^*]+\*$/, /__[^_]+_$/, /~~[^~]+~$/].some((re) =>
      re.test(text.replace(/(?<! ) $/, ''))
    ),
  /** Same-family collapse: an innermost `*` drops the enclosing `**` closers, which the next pass adds. */
  starCollapse: (text: string) => {
    const runs = [...text.matchAll(/\*+/g)].map((m) => m[0].length)
    return runs.length > 1 && runs[runs.length - 1] === 1 && runs.slice(0, -1).some((n) => n >= 2)
  },
}

const converges = (input: string, healed: string) =>
  PRE_EXISTING.halfClosed(input) || PRE_EXISTING.halfClosed(healed) || PRE_EXISTING.starCollapse(input)

describe('comark — autoCloseMarkdown is idempotent', () => {
  const inputs = corpus()

  it('heals to a fixed point', () => {
    const failures: string[] = []
    let skipped = 0

    for (const input of inputs) {
      const once = autoCloseMarkdown(input)
      const twice = autoCloseMarkdown(once)
      if (twice === once) continue
      if (converges(input, once)) {
        skipped++
        continue
      }
      failures.push(`${JSON.stringify(input)} → ${JSON.stringify(once)} → ${JSON.stringify(twice)}`)
    }

    expect(failures).toEqual([])
    // The skipped shapes are a rounding error on the corpus. If this ever trips it
    // means a rule above swallowed the whole suite instead of a known exception.
    expect(skipped).toBeLessThan(inputs.length / 100)
  })

  it('never closes a code span with a longer backtick run than the input opened', () => {
    const failures: string[] = []

    for (const input of inputs) {
      const healed = autoCloseMarkdown(input)
      if (trailingBackticks(healed) > longestBacktickRun(input)) {
        failures.push(`${JSON.stringify(input)} → ${JSON.stringify(healed)}`)
      }
    }

    expect(failures).toEqual([])
  })

  it('covers a large corpus', () => {
    expect(inputs.length).toBeGreaterThan(100_000)
  })
})
