/**
 * diff-cases/v2 SPEC runner — single-file ESM, zero deps (Node built-ins only).
 *
 * Portable drop-in. Copy this file anywhere:
 *
 *   import {
 *     loadSpecCases,
 *     runSpecCases,
 *     compareSpecFile,
 *     sectionAwareMapOptions,
 *     toGenericAutoCloseOptions,
 *   } from "./spec-runner.mjs";
 *
 *   const report = compareSpecFile(path, [
 *     { name: "remend", fn: (input, opts) => remend(input, map(opts)) },
 *     { name: "comark", fn: (input, opts) => autoCloseMarkdown(input, map(opts)) },
 *   ], { mapOptions: sectionAwareMapOptions, section: "Bold" });
 *   // report.ranking sorted by matchRate, then speed
 *
 * Node ≥ 18.
 */

import { readFileSync } from 'node:fs'

// ─── options ─────────────────────────────────────────────────────────────────

const FORMAT = 'diff-cases/v2'

export const DEFAULT_SPEC_OPTIONS = {
  bold: true,
  italic: true,
  boldItalic: true,
  inlineCode: true,
  strikethrough: true,
  links: true,
  images: true,
  linkMode: 'protocol',
  incompleteLinkPlaceholder: 'auto-close:incomplete-link',
  incompleteImagePlaceholder: 'auto-close:incomplete-image',
  blockMath: true,
  inlineMath: false,
  htmlTags: true,
  tables: true,
  singleTilde: true,
  comparisonOperators: true,
  dropTrailingOpeners: false,
  setextGuard: false,
  streaming: false,
}

const CANONICAL_KEYS = new Set(Object.keys(DEFAULT_SPEC_OPTIONS))

const LEGACY_ALIASES = {
  katex: 'blockMath',
  math: 'inlineMath',
  inlineKatex: 'inlineMath',
}

const warnedLegacy = new Set()

function warnLegacy(name, canonical) {
  if (warnedLegacy.has(name)) return
  warnedLegacy.add(name)
  console.warn(`[spec-runner] deprecated option "${name}" — use "${canonical}" instead`)
}

export function resetLegacyWarnings() {
  warnedLegacy.clear()
}

function parseLiteral(raw) {
  const t = raw.trim()
  if (t === 'true') return true
  if (t === 'false') return false
  if (t.startsWith("'") && t.endsWith("'") && t.length >= 2) {
    return t.slice(1, -1)
  }
  if (t.startsWith('"') && t.endsWith('"') && t.length >= 2) {
    return t.slice(1, -1)
  }
  throw new Error(`unsupported opts literal: ${raw}`)
}

function splitPairs(src) {
  const parts = []
  let buf = ''
  let inQuote = null
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuote) {
      buf += ch
      if (ch === inQuote) inQuote = null
      continue
    }
    if (ch === "'" || ch === '"') {
      inQuote = ch
      buf += ch
      continue
    }
    if (ch === ',') {
      if (buf.trim()) parts.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  if (buf.trim()) parts.push(buf.trim())
  return parts
}

export function parseOptsAttribute(raw) {
  const out = {}
  if (!raw.trim()) return out

  for (const part of splitPairs(raw)) {
    const m = part.match(/^(\w+)\s*:\s*(.+)$/)
    if (!m) throw new Error(`malformed opts pair: ${part}`)
    let key = m[1]
    const value = parseLiteral(m[2])

    if (Object.hasOwn(LEGACY_ALIASES, key)) {
      const canonical = LEGACY_ALIASES[key]
      warnLegacy(key, canonical)
      key = canonical
    }

    if (!CANONICAL_KEYS.has(key)) {
      throw new Error(`unknown option: ${key}`)
    }

    out[key] = value
  }

  return out
}

export function resolveOptions(overrides = {}) {
  const streaming = overrides.streaming ?? DEFAULT_SPEC_OPTIONS.streaming

  return {
    ...DEFAULT_SPEC_OPTIONS,
    dropTrailingOpeners: streaming ? true : DEFAULT_SPEC_OPTIONS.dropTrailingOpeners,
    setextGuard: streaming ? true : DEFAULT_SPEC_OPTIONS.setextGuard,
    ...overrides,
    streaming,
  }
}

export function applySectionHints(section, opts) {
  const overrides = {}
  if (/trailing openers/i.test(section)) overrides.dropTrailingOpeners = true
  if (/text-only mode/i.test(section)) overrides.linkMode = 'text-only'
  if (Object.keys(overrides).length === 0) return opts
  return resolveOptions({ ...opts, ...overrides })
}

// ─── parse ───────────────────────────────────────────────────────────────────

export function decodeEscapes(s) {
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
      if (n === 'r') {
        out += '\r'
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

function fileLabel(filePath) {
  return filePath ? `spec file ${filePath}` : 'spec file'
}

function stripFrontmatter(md, filePath) {
  if (!md.startsWith('---')) {
    throw new Error(`${fileLabel(filePath)}: missing YAML frontmatter; expected format: ${FORMAT}`)
  }

  const end = md.indexOf('\n---', 3)
  if (end === -1) {
    throw new Error(`${fileLabel(filePath)}: unclosed YAML frontmatter`)
  }

  const front = md.slice(3, end)
  const hasFormat = front.split('\n').some((line) => {
    const m = line.match(/^\s*format\s*:\s*(.+?)\s*$/)
    return m !== null && m[1] === FORMAT
  })

  if (!hasFormat) {
    throw new Error(
      `${fileLabel(filePath)}: refuse to run — frontmatter must declare \`format: ${FORMAT}\` (got no match). Old runners must never silently misparse a v2 file.`
    )
  }

  const after = md.slice(end + 1)
  const bodyStart = after.indexOf('\n')
  return bodyStart === -1 ? '' : after.slice(bodyStart + 1)
}

function absoluteLine(full, body, bodyLineIndex) {
  const bodyOffset = full.length - body.length
  const prefix = full.slice(0, bodyOffset)
  const linesBefore = prefix.length === 0 ? 0 : prefix.split('\n').length - 1
  return linesBefore + bodyLineIndex + 1
}

const FENCE_OPEN = /^```diff(?:\s+opts="([^"]*)")?\s*$/

export function parseSpecCases(md, filePath) {
  const body = stripFrontmatter(md, filePath)
  const lines = body.split('\n')
  const cases = []
  let section = 'top'

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const lineNo = absoluteLine(md, body, i)

    const heading = line.match(/^##\s+(.+)$/)
    if (heading) {
      section = heading[1].trim()
      i++
      continue
    }

    const fence = line.match(FENCE_OPEN)
    if (fence) {
      const optsRaw = fence[1]
      let overrides = {}
      if (optsRaw !== undefined) overrides = parseOptsAttribute(optsRaw)

      i++
      let inputRaw = null
      let expectedRaw = null

      while (i < lines.length && lines[i].trim() !== '```') {
        const L = lines[i]
        if (L === '-' || L.startsWith('- ')) {
          inputRaw = L === '-' ? '' : L.slice(2)
        } else if (L === '+' || L.startsWith('+ ')) {
          expectedRaw = L === '+' ? '' : L.slice(2)
        }
        i++
      }

      if (inputRaw !== null && expectedRaw !== null) {
        cases.push({
          position: lineNo,
          section,
          input: decodeEscapes(inputRaw),
          expected: decodeEscapes(expectedRaw),
          options: resolveOptions(overrides),
        })
      } else if (inputRaw !== null || expectedRaw !== null) {
        throw new Error(`${fileLabel(filePath)}: incomplete diff case at line ${lineNo}`)
      }
      if (i < lines.length && lines[i].trim() === '```') i++
      continue
    }

    i++
  }

  return cases
}

export function loadSpecCases(filePath) {
  const md = readFileSync(filePath, 'utf8')
  return parseSpecCases(md, filePath)
}

// ─── run ─────────────────────────────────────────────────────────────────────

function median(values) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

function summarizeSections(results) {
  const order = []
  const map = new Map()

  for (const r of results) {
    const key = r.case.section
    let bucket = map.get(key)
    if (!bucket) {
      bucket = { total: 0, passed: 0, failed: 0, durationMs: 0 }
      map.set(key, bucket)
      order.push(key)
    }
    bucket.total++
    if (r.passed) bucket.passed++
    else bucket.failed++
    bucket.durationMs += r.durationMs
  }

  return order.map((section) => {
    const b = map.get(section)
    return {
      section,
      total: b.total,
      passed: b.passed,
      failed: b.failed,
      matchRate: b.total === 0 ? 100 : (b.passed / b.total) * 100,
      durationMs: b.durationMs,
    }
  })
}

function printFailure(r) {
  const { section, input, expected, position } = r.case
  console.log(`  ✗ ${section} › ${JSON.stringify(input)} → ${JSON.stringify(expected)}  (L${position})`)
  console.log(`      actual: ${JSON.stringify(r.actual)}`)
  if (r.error) console.log(`      error:  ${r.error}`)
}

/** True when the case section matches the filter (string | RegExp | string[]). */
export function matchesSection(sectionTitle, filter) {
  if (typeof filter === 'string') return sectionTitle === filter
  if (filter instanceof RegExp) return filter.test(sectionTitle)
  return filter.includes(sectionTitle)
}

/** Apply `section` + `filter` options to a case list. */
export function selectCases(cases, options = {}) {
  let out = cases
  if (options.section !== undefined) {
    const section = options.section
    out = out.filter((c) => matchesSection(c.section, section))
  }
  if (options.filter) {
    const pred = options.filter
    out = out.filter(pred)
  }
  return out
}

export function runSpecCases(cases, fn, options = {}) {
  const selected = selectCases(cases, options)
  const verbose = options.verbose !== false
  const mapOptions = options.mapOptions ?? ((o) => o)
  const warmup = options.warmup ?? 0

  for (let w = 0; w < warmup; w++) {
    for (const c of selected) {
      try {
        fn(c.input, mapOptions(c.options, c))
      } catch {
        // ignore during warmup
      }
    }
  }

  const results = []
  const t0 = performance.now()

  for (const c of selected) {
    const opts = mapOptions(c.options, c)
    const start = performance.now()
    let actual = ''
    let error
    let passed = false

    try {
      actual = fn(c.input, opts)
      passed = actual === c.expected
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
      actual = ''
      passed = false
    }

    const durationMs = performance.now() - start
    results.push({ case: c, actual, passed, durationMs, error })
  }

  const durationMs = performance.now() - t0
  const passed = results.filter((r) => r.passed).length
  const failed = results.length - passed
  const durations = results.map((r) => r.durationMs)
  const sumDurations = durations.reduce((a, b) => a + b, 0)
  const bySection = summarizeSections(results)
  const failures = results.filter((r) => !r.passed)

  if (verbose) {
    for (const sec of bySection) {
      const mark = sec.failed === 0 ? '✓' : '✗'
      console.log(`${mark} ${sec.section}: ${sec.passed}/${sec.total} (${sec.matchRate.toFixed(1)}%)`)
    }
    if (failures.length) {
      console.log('\nFailures:')
      for (const f of failures) printFailure(f)
    }
    console.log(
      `\n${passed}/${results.length} passed (${((passed / Math.max(results.length, 1)) * 100).toFixed(1)}%) in ${durationMs.toFixed(2)} ms`
    )
  }

  return {
    total: results.length,
    passed,
    failed,
    matchRate: results.length === 0 ? 100 : (passed / results.length) * 100,
    durationMs,
    meanMs: results.length === 0 ? 0 : sumDurations / results.length,
    medianMs: median(durations),
    opsPerSec: sumDurations === 0 ? 0 : (results.length / sumDurations) * 1000,
    bySection,
    failures,
    results,
  }
}

// ─── compare ─────────────────────────────────────────────────────────────────

function pad(s, n) {
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length)
}

export function printCompareTable(report) {
  console.log('\n════════════════════════════════════════')
  console.log(`SPEC: ${report.filePath}`)
  console.log(`Cases: ${report.caseCount}`)
  console.log('────────────────────────────────────────')
  console.log(
    pad('Library', 24) +
      pad('Pass', 8) +
      pad('Fail', 8) +
      pad('Rate', 10) +
      pad('Time', 12) +
      pad('µs/op', 10) +
      'ops/s'
  )

  for (const r of report.ranking) {
    const us = (r.meanMs * 1000).toFixed(2)
    console.log(
      pad(r.name, 24) +
        pad(String(r.passed), 8) +
        pad(String(r.failed), 8) +
        pad(`${r.matchRate.toFixed(1)}%`, 10) +
        pad(`${r.durationMs.toFixed(1)} ms`, 12) +
        pad(us, 10) +
        r.opsPerSec.toFixed(0)
    )
  }
  console.log('════════════════════════════════════════\n')
}

export function formatCompareMarkdown(report) {
  const lines = []
  lines.push(`# SPEC compare — ${report.filePath}`)
  lines.push('')
  lines.push(`Cases: **${report.caseCount}**`)
  lines.push('')
  lines.push('| Library | Pass | Fail | Rate | Time | µs/op | ops/s |')
  lines.push('|---|---:|---:|---:|---:|---:|---:|')
  for (const r of report.ranking) {
    lines.push(
      `| **${r.name}** | ${r.passed} | ${r.failed} | **${r.matchRate.toFixed(1)}%** | ${r.durationMs.toFixed(1)} ms | ${(r.meanMs * 1000).toFixed(2)} | ${r.opsPerSec.toFixed(0)} |`
    )
  }
  lines.push('')

  for (const c of report.candidates) {
    if (c.failures.length === 0) continue
    lines.push(`## ${c.name} failures (${c.failures.length})`)
    lines.push('')
    const bySec = new Map()
    for (const f of c.failures) {
      bySec.set(f.case.section, (bySec.get(f.case.section) ?? 0) + 1)
    }
    for (const [sec, n] of [...bySec.entries()].sort((a, b) => b[1] - a[1])) {
      lines.push(`- ${sec}: ${n}`)
    }
    lines.push('')
    lines.push(`<details><summary>${c.name} failure details</summary>`)
    lines.push('')
    for (const f of c.failures) {
      lines.push(`#### ${f.case.section} (L${f.case.position})`)
      lines.push('```')
      lines.push(`input:    ${JSON.stringify(f.case.input)}`)
      lines.push(`expected: ${JSON.stringify(f.case.expected)}`)
      lines.push(`got:      ${JSON.stringify(f.actual)}`)
      if (f.error) lines.push(`error:    ${f.error}`)
      lines.push('```')
      lines.push('')
    }
    lines.push('</details>')
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Higher-order entry: load SPEC, run N candidates, rank by matchRate then speed.
 *
 *   const report = compareSpecFile(path, [
 *     { name: "remend", fn: (input, opts) => remend(input, map(opts)) },
 *     { name: "comark", fn: (input, opts) => autoCloseMarkdown(input, map(opts)) },
 *   ]);
 *   // report.ranking sorted by matchRate, then speed
 */
export function compareSpecFile(filePath, candidates, options = {}) {
  // Apply section/filter once so caseCount reflects the selection.
  const cases = selectCases(loadSpecCases(filePath), options)
  const printSummary = options.printSummary !== false

  const normalized = candidates.map((c, i) => {
    if (typeof c === 'function') return { name: `fn${i}`, fn: c }
    return c
  })

  const summaries = []

  for (const candidate of normalized) {
    if (printSummary) {
      console.log(`\n━━ ${candidate.name} ━━━━━━━━━━━━━━━━━━━━━━━`)
    }
    // section/filter already applied — don't re-filter in runSpecCases
    const run = runSpecCases(cases, candidate.fn, {
      verbose: options.verbose,
      warmup: options.warmup,
      mapOptions: options.mapOptions,
    })
    summaries.push({ name: candidate.name, ...run })
  }

  const ranking = [...summaries]
    .map((s) => ({
      name: s.name,
      matchRate: s.matchRate,
      passed: s.passed,
      failed: s.failed,
      durationMs: s.durationMs,
      meanMs: s.meanMs,
      opsPerSec: s.opsPerSec,
    }))
    .sort((a, b) => {
      if (b.matchRate !== a.matchRate) return b.matchRate - a.matchRate
      return a.durationMs - b.durationMs
    })

  const report = {
    filePath,
    caseCount: cases.length,
    candidates: summaries,
    ranking,
  }

  if (printSummary) printCompareTable(report)
  return report
}

// ─── helpers ─────────────────────────────────────────────────────────────────

export function toGenericAutoCloseOptions(opts) {
  return {
    bold: opts.bold,
    italic: opts.italic,
    boldItalic: opts.boldItalic,
    inlineCode: opts.inlineCode,
    strikethrough: opts.strikethrough,
    links: opts.links,
    images: opts.images,
    linkMode: opts.linkMode,
    incompleteLinkPlaceholder: opts.incompleteLinkPlaceholder,
    incompleteImagePlaceholder: opts.incompleteImagePlaceholder,
    math: opts.blockMath || opts.inlineMath,
    blockMath: opts.blockMath,
    inlineMath: opts.inlineMath,
    htmlTags: opts.htmlTags,
    tables: opts.tables,
    singleTilde: opts.singleTilde,
    comparisonOperators: opts.comparisonOperators,
    dropTrailingOpeners: opts.dropTrailingOpeners,
    setextGuard: opts.setextGuard,
    streaming: opts.streaming,
  }
}

export function sectionAwareMapOptions(opts, testCase) {
  return applySectionHints(testCase.section, opts)
}
