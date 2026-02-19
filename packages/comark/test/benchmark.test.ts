import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

// Helper to measure memory usage
function getMemoryUsage(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    return usage.heapUsed
  }
  // Fallback for environments without process.memoryUsage
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize
  }
  return 0
}

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

// Helper to measure execution time
function measureTime(fn: () => void): number {
  const start = performance.now()
  fn()
  const end = performance.now()
  return end - start
}

// Test cases for benchmarking
const benchmarkCases = [
  {
    name: 'simple heading',
    content: '# Hello World',
  },
  {
    name: 'multiple paragraphs',
    content: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
  },
  {
    name: 'complex markdown',
    content: `# Main Title

This is a paragraph with **bold** and *italic* text.

## Subsection

- List item 1
- List item 2
- List item 3

\`\`\`javascript
const x = 1;
\`\`\`

> This is a blockquote.

[Link](https://example.com)

![Image](https://example.com/image.png)
`,
  },
  {
    name: 'component with content',
    content: '::component\nThis is a component with content.\n::',
  },
  {
    name: 'nested components',
    content: ':::parent\n::child\n::\n:::',
  },
  {
    name: 'inline components',
    content: 'Hello :world[Inline Component Content]{data-component="test"}',
  },
  {
    name: 'large document',
    content: Array.from({ length: 100 }).fill('# Heading\n\nThis is a paragraph with some content.').join('\n\n'),
  },
]

describe('benchmark parse vs parse', () => {
  it('should benchmark execution time', () => {
    const results: Array<{
      testCase: string
      parseTime: number
      markdownItTime: number
      speedup: number
    }> = []

    for (const testCase of benchmarkCases) {
      // Warm up
      parse(testCase.content)
      parse(testCase.content)

      // Measure parse
      const parseTimes: number[] = []
      for (let i = 0; i < 10; i++) {
        parseTimes.push(measureTime(() => parse(testCase.content)))
      }
      const avgParseTime = parseTimes.reduce((a, b) => a + b, 0) / parseTimes.length

      // Measure parse
      const markdownItTimes: number[] = []
      for (let i = 0; i < 10; i++) {
        markdownItTimes.push(measureTime(() => parse(testCase.content)))
      }
      const avgMarkdownItTime = markdownItTimes.reduce((a, b) => a + b, 0) / markdownItTimes.length

      const speedup = avgParseTime / avgMarkdownItTime

      results.push({
        testCase: testCase.name,
        parseTime: avgParseTime,
        markdownItTime: avgMarkdownItTime,
        speedup,
      })
    }

    // Log results
    console.log('\n=== Execution Time Benchmark ===')
    console.log('Test Case'.padEnd(30), 'parse (ms)'.padEnd(15), 'markdown-it (ms)'.padEnd(15), 'Speedup')
    console.log('-'.repeat(80))
    for (const result of results) {
      const speedupStr = result.speedup > 1
        ? `${result.speedup.toFixed(2)}x faster (markdown-it)`
        : `${(1 / result.speedup).toFixed(2)}x faster (parse)`
      console.log(
        result.testCase.padEnd(30),
        result.parseTime.toFixed(3).padEnd(15),
        result.markdownItTime.toFixed(3).padEnd(15),
        speedupStr,
      )
    }

    // Test passes - we're just benchmarking
    expect(results.length).toBeGreaterThan(0)
  })

  it('should benchmark memory usage', async () => {
    const results: Array<{
      testCase: string
      parseMemory: number
      markdownItMemory: number
      memoryDiff: number
    }> = []

    for (const testCase of benchmarkCases) {
      // Measure parse memory (run multiple times and average)
      let parseMemorySum = 0
      let parseMemoryCount = 0
      for (let i = 0; i < 5; i++) {
        if (global.gc)
          global.gc()
        const beforeParse = getMemoryUsage()
        const parseResult = await parse(testCase.content)
        const afterParse = getMemoryUsage()
        const memory = afterParse - beforeParse
        if (memory > 0 && Number.isFinite(memory)) {
          parseMemorySum += memory
          parseMemoryCount++
        }
        // Keep reference
        const _ = parseResult
      }
      const parseMemory = parseMemoryCount > 0 ? parseMemorySum / parseMemoryCount : 0

      // Measure parse memory (run multiple times and average)
      let markdownItMemorySum = 0
      let markdownItMemoryCount = 0
      for (let i = 0; i < 5; i++) {
        if (global.gc)
          global.gc()
        const beforeMarkdownIt = getMemoryUsage()
        const markdownItResult = await parse(testCase.content)
        const afterMarkdownIt = getMemoryUsage()
        const memory = afterMarkdownIt - beforeMarkdownIt
        if (memory > 0 && Number.isFinite(memory)) {
          markdownItMemorySum += memory
          markdownItMemoryCount++
        }
        // Keep reference
        const _ = markdownItResult
      }
      const markdownItMemory = markdownItMemoryCount > 0 ? markdownItMemorySum / markdownItMemoryCount : 0

      const memoryDiff = parseMemory - markdownItMemory

      results.push({
        testCase: testCase.name,
        parseMemory,
        markdownItMemory,
        memoryDiff,
      })
    }

    // Log results
    console.log('\n=== Memory Usage Benchmark ===')
    console.log('Test Case'.padEnd(30), 'parse'.padEnd(20), 'markdown-it'.padEnd(20), 'Difference')
    console.log('-'.repeat(90))
    for (const result of results) {
      let diffStr = 'N/A'
      if (Number.isFinite(result.memoryDiff) && !Number.isNaN(result.memoryDiff)) {
        if (result.memoryDiff > 0) {
          diffStr = `+${formatBytes(result.memoryDiff)} (markdown-it uses less)`
        }
        else if (result.memoryDiff < 0) {
          diffStr = `${formatBytes(Math.abs(result.memoryDiff))} (parse uses less)`
        }
        else {
          diffStr = 'Equal'
        }
      }
      const parseMemStr = result.parseMemory > 0 && Number.isFinite(result.parseMemory)
        ? formatBytes(result.parseMemory)
        : 'N/A'
      const markdownItMemStr = result.markdownItMemory > 0 && Number.isFinite(result.markdownItMemory)
        ? formatBytes(result.markdownItMemory)
        : 'N/A'
      console.log(
        result.testCase.padEnd(30),
        parseMemStr.padEnd(20),
        markdownItMemStr.padEnd(20),
        diffStr,
      )
    }

    // Test passes - we're just benchmarking
    expect(results.length).toBeGreaterThan(0)
  })

  it('should benchmark combined time and memory', async () => {
    const results: Array<{
      testCase: string
      parseTime: number
      markdownItTime: number
      parseMemory: number
      markdownItMemory: number
      parseScore: number // Lower is better (time * memory)
      markdownItScore: number
    }> = []

    for (const testCase of benchmarkCases) {
      // Warm up
      parse(testCase.content)
      parse(testCase.content)

      // Measure parse time
      const parseTimes: number[] = []
      for (let i = 0; i < 10; i++) {
        parseTimes.push(measureTime(() => parse(testCase.content)))
      }
      const avgParseTime = parseTimes.reduce((a, b) => a + b, 0) / parseTimes.length

      // Measure parse memory (average of multiple runs)
      let parseMemorySum = 0
      let parseMemoryCount = 0
      for (let i = 0; i < 5; i++) {
        if (global.gc)
          global.gc()
        const beforeParse = getMemoryUsage()
        const parseResult = await parse(testCase.content)
        const afterParse = getMemoryUsage()
        const memory = afterParse - beforeParse
        if (memory > 0 && Number.isFinite(memory)) {
          parseMemorySum += memory
          parseMemoryCount++
        }
        const _ = parseResult
      }
      const parseMemory = parseMemoryCount > 0 ? parseMemorySum / parseMemoryCount : 0

      // Measure parse time
      const markdownItTimes: number[] = []
      for (let i = 0; i < 10; i++) {
        markdownItTimes.push(measureTime(() => parse(testCase.content)))
      }
      const avgMarkdownItTime = markdownItTimes.reduce((a, b) => a + b, 0) / markdownItTimes.length

      // Measure parse memory (average of multiple runs)
      let markdownItMemorySum = 0
      let markdownItMemoryCount = 0
      for (let i = 0; i < 5; i++) {
        if (global.gc)
          global.gc()
        const beforeMarkdownIt = getMemoryUsage()
        const markdownItResult = await parse(testCase.content)
        const afterMarkdownIt = getMemoryUsage()
        const memory = afterMarkdownIt - beforeMarkdownIt
        if (memory > 0 && Number.isFinite(memory)) {
          markdownItMemorySum += memory
          markdownItMemoryCount++
        }
        const _ = markdownItResult
      }
      const markdownItMemory = markdownItMemoryCount > 0 ? markdownItMemorySum / markdownItMemoryCount : 0

      // Calculate scores (time * memory, lower is better)
      const parseScore = avgParseTime * parseMemory
      const markdownItScore = avgMarkdownItTime * markdownItMemory

      results.push({
        testCase: testCase.name,
        parseTime: avgParseTime,
        markdownItTime: avgMarkdownItTime,
        parseMemory,
        markdownItMemory,
        parseScore,
        markdownItScore,
      })
    }

    // Log results
    console.log('\n=== Combined Time & Memory Benchmark ===')
    console.log('Test Case'.padEnd(30), 'parse (time×mem)'.padEnd(20), 'markdown-it (time×mem)'.padEnd(20), 'Winner')
    console.log('-'.repeat(90))
    for (const result of results) {
      const winner = result.parseScore < result.markdownItScore ? 'parse' : 'markdown-it'
      const scoreDiff = Math.abs(result.parseScore - result.markdownItScore)
      const scoreDiffPercent = ((scoreDiff / Math.max(result.parseScore, result.markdownItScore)) * 100).toFixed(1)
      console.log(
        result.testCase.padEnd(30),
        result.parseScore.toFixed(2).padEnd(20),
        result.markdownItScore.toFixed(2).padEnd(20),
        `${winner} (${scoreDiffPercent}% difference)`,
      )
    }

    // Test passes - we're just benchmarking
    expect(results.length).toBeGreaterThan(0)
  })
})
