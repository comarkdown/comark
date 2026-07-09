#!/usr/bin/env node
/**
 * Run all benchmarks and save results to docs/public/benchmarks.json
 *
 * Usage:
 *   node scripts/bench.mjs           # run all benchmarks
 *   node scripts/bench.mjs <filter>  # run only benchmarks matching "<filter>"
 */

import { execSync } from 'node:child_process'
import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const benchDir = join(root, 'benchmarks')
const outFile = join(root, 'docs', 'public', 'benchmarks.json')

const filter = process.argv[2]

// Discover benchmark files
const files = readdirSync(benchDir)
  .filter((f) => f.endsWith('.ts'))
  .filter((f) => !filter || f.includes(filter))
  .sort()

if (files.length === 0) {
  console.error(`No benchmark files found${filter ? ` matching "${filter}"` : ''}.`)
  process.exit(1)
}

// Ensure output directory exists
const outDir = join(root, 'docs', 'public')
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true })
}

console.log(`Found ${files.length} benchmark(s):\n`)
files.forEach((f) => console.log(`  - ${f}`))
console.log()

const results = {}
const errors = []

for (const file of files) {
  const name = basename(file, '.ts')
  console.log(`▶ Running ${file}...`)

  try {
    // Strip ANSI codes from output for clean text
    const output = execSync(`npx tsx "${join(benchDir, file)}"`, {
      cwd: root,
      encoding: 'utf-8',
      timeout: 5 * 60 * 1000, // 5 minutes per benchmark
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // Strip any remaining ANSI escape codes
    const clean = output.replace(/\x1B\[[0-9;]*[a-z]/gi, '')

    results[name] = clean
    console.log(`  ✓ Done\n`)
  } catch (err) {
    const message = err.stderr?.toString() || err.message
    errors.push({ file, message })
    console.error(`  ✗ Failed: ${message.split('\n')[0]}\n`)
  }
}

// Generate a combined JSON summary with extracted stats
const summary = {
  generated: new Date().toISOString(),
  runtime: null,
  cpu: null,
  benchmarks: {},
}

for (const [name, output] of Object.entries(results)) {
  // Extract runtime info from first benchmark
  const cpuMatch = output.match(/cpu:\s*(.+)/)
  const runtimeMatch = output.match(/runtime:\s*(.+)/)
  if (cpuMatch) summary.cpu = cpuMatch[1].trim()
  if (runtimeMatch) summary.runtime = runtimeMatch[1].trim()

  // Extract benchmark groups and results
  const groups = []
  const lines = output.split('\n')

  let currentGroup = null

  for (const line of lines) {
    // Group header: • group name
    const groupMatch = line.match(/^•\s+(.+)$/)
    if (groupMatch) {
      currentGroup = { name: groupMatch[1], entries: [] }
      groups.push(currentGroup)
      continue
    }

    // Bench result: name    avg/iter
    // Format: "name                     123.45 ns/iter ..."
    if (currentGroup) {
      const benchMatch = line.match(/^(\S.*?)\s{2,}(\d[\d,.]*)\s+(ns|µs|ms|s)\/iter/)
      if (benchMatch) {
        const benchName = benchMatch[1].trim()
        const value = Number.parseFloat(benchMatch[2].replace(/,/g, ''))
        const unit = benchMatch[3]

        // Normalize to nanoseconds
        const multipliers = { ns: 1, µs: 1e3, ms: 1e6, s: 1e9 }
        const ns = value * (multipliers[unit] || 1)

        currentGroup.entries.push({
          name: benchName,
          avg: value,
          unit,
          avgNs: ns,
        })
      }
    }
  }

  summary.benchmarks[name] = groups
}

writeFileSync(outFile, JSON.stringify(summary, null, 2))
console.log('─'.repeat(50))
console.log(`\n✓ Results saved to docs/public/benchmarks.json`)

if (errors.length > 0) {
  console.log(`\n✗ ${errors.length} benchmark(s) failed:`)
  errors.forEach((e) => console.log(`  - ${e.file}: ${e.message.split('\n')[0]}`))
  process.exit(1)
}

console.log(`\n✓ All ${files.length} benchmarks completed successfully.`)
