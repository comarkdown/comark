/**
 * Runs comark's autoCloseMarkdown against every ```diff case in SPEC/auto-close.md.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { autoCloseMarkdown, type AutoCloseOptions } from '../src/internal/parse/auto-close/index.ts'
import { describe, expect, it } from 'vitest'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPEC = readFileSync(join(__dirname, '../SPEC/auto-close.md'), 'utf8')

type Case = {
  section: string
  input: string
  expected: string
  note?: string
  skip?: boolean
}

/** Decode SPEC side of a diff line: `\n` → newline; keep `\\` escapes as single `\`. */
function decode(s: string): string {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const n = s[i + 1]
      if (n === 'n') {
        out += '\n'
        i++
        continue
      }
      if (n === 't') {
        out += '\t'
        i++
        continue
      }
      out += '\\'
      out += n
      i++
      continue
    }
    out += s[i]
  }
  return out
}

function parseSpec(md: string): Case[] {
  const cases: Case[] = []
  let section = 'top'
  const lines = md.split('\n')

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    const heading = line.match(/^##\s+(.+)/)
    if (heading) {
      section = heading[1].trim()
      i++
      continue
    }

    if (line.trim() === '```diff') {
      i++
      let input: string | null = null
      let expected: string | null = null
      let note: string | undefined
      let skip = false

      while (i < lines.length && lines[i].trim() !== '```') {
        const L = lines[i]
        if (L.startsWith('- ')) {
          input = L.slice(2)
        } else if (L.startsWith('+ ')) {
          const rest = L.slice(2)
          const optMatch = rest.match(/^(.*?)\s{2,}\((.+)\)$/)
          if (optMatch) {
            expected = optMatch[1]
            note = optMatch[2]
            if (/with (joke )?handler/i.test(optMatch[2])) {
              skip = true
            }
          } else {
            expected = rest
          }
        }
        i++
      }

      if (input !== null && expected !== null) {
        cases.push({
          section,
          input: decode(input),
          expected: decode(expected),
          note,
          skip,
        })
      }
      i++
      continue
    }

    i++
  }

  return cases
}

/** Map SPEC section to autoClose options. */
function optionsForSection(section: string): AutoCloseOptions {
  const base: AutoCloseOptions = { syntax: false }

  if (/text-only mode/i.test(section)) {
    return { ...base, linkMode: 'text-only' }
  }

  if (/Trailing openers/i.test(section)) {
    return { ...base, dropTrailingOpeners: true }
  }

  // Progressive streaming section mixes protocol and text-only link cases —
  // optionsForCase peeks at expected output to pick linkMode.
  return base
}

function optionsForCase(c: Case): AutoCloseOptions {
  const base = optionsForSection(c.section)

  // Inline math section: when expected equals input with a trailing `$…`, treat as math: false
  // (SPEC documents the off path after the default-on cases).
  if (/Inline math/i.test(c.section)) {
    if (c.expected === c.input && /\$/.test(c.input)) {
      return { ...base, math: false }
    }
    return { ...base, math: true }
  }

  // Streaming progressive section includes both protocol and text-only link examples.
  if (/Streaming chunks/i.test(c.section)) {
    // Text-only: expected has no `[` link markup for an input that had `[`.
    if (c.input.includes('[') && !c.input.includes('](') && !c.expected.includes('[') && !c.expected.includes('](')) {
      return { ...base, linkMode: 'text-only' }
    }
  }

  return base
}

const cases = parseSpec(SPEC)

const bySection = new Map<string, Case[]>()
for (const c of cases) {
  const list = bySection.get(c.section) ?? []
  list.push(c)
  bySection.set(c.section, list)
}

describe('comark — autoCloseMarkdown vs SPEC/auto-close.md', () => {
  it('parsed at least one case from SPEC', () => {
    expect(cases.length).toBeGreaterThan(50)
  })

  for (const [section, sectionCases] of bySection) {
    describe(section, () => {
      for (const c of sectionCases) {
        const label = `${JSON.stringify(c.input)} → ${JSON.stringify(c.expected)}${
          c.note ? ` (${c.note})` : ''
        }`

        if (c.skip) {
          it.skip(label, () => undefined)
          continue
        }

        it(label, () => {
          const got = autoCloseMarkdown(c.input, optionsForCase(c))
          expect(got).toBe(c.expected)
        })
      }
    })
  }
})
