import { bench, describe } from 'vitest'
import { createMarkdownParser } from 'comark'
import {
  adversarialMarkdown,
  componentHeavyMarkdown,
  incompleteMarkdown,
  largeMarkdown,
  mediumMarkdown,
  smallMarkdown,
} from './fixtures.ts'

const parse = createMarkdownParser()
const parseNoClose = createMarkdownParser({ autoClose: false })
const parseStreaming = createMarkdownParser()

// Warm once so CodSpeed samples steady-state parse, not cold plugin init.
await parse(mediumMarkdown)
await parseNoClose(mediumMarkdown)
await parseStreaming(mediumMarkdown, { streaming: true })

describe('comark parse', () => {
  bench('small', async () => {
    await parse(smallMarkdown)
  })

  bench('medium', async () => {
    await parse(mediumMarkdown)
  })

  bench('large', async () => {
    await parse(largeMarkdown)
  })

  bench('component-heavy', async () => {
    await parse(componentHeavyMarkdown)
  })

  bench('adversarial', async () => {
    await parse(adversarialMarkdown)
  })
})

describe('comark parse (autoClose: false)', () => {
  bench('medium', async () => {
    await parseNoClose(mediumMarkdown)
  })

  bench('incomplete', async () => {
    await parseNoClose(incompleteMarkdown)
  })
})

describe('comark parse (streaming)', () => {
  // Reset stream cache then feed growing prefixes so we measure real
  // incremental work, not the no-op reuse of an identical full string.
  async function streamingIncremental(markdown: string): Promise<void> {
    await parseStreaming('\n', { streaming: false })
    const steps = [0.25, 0.5, 0.75, 1].map((f) => markdown.slice(0, Math.floor(markdown.length * f)))
    for (const step of steps) {
      await parseStreaming(step, { streaming: true })
    }
  }

  bench('medium incremental', async () => {
    await streamingIncremental(mediumMarkdown)
  })

  bench('incomplete incremental', async () => {
    await streamingIncremental(incompleteMarkdown)
  })
})
