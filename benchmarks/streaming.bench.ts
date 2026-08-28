import { bench, describe } from 'vitest'
import { autoCloseMarkdown, createMarkdownParser } from 'comark'
import { largeMarkdown, mediumMarkdown, partialMarkdown, streamChunks } from './fixtures.ts'

const parse = createMarkdownParser()
const streamingParse = createMarkdownParser()

describe('auto-close', () => {
  bench('partial document', () => {
    autoCloseMarkdown(partialMarkdown, { frontmatter: true })
  })

  bench('medium document', () => {
    autoCloseMarkdown(mediumMarkdown, { frontmatter: true })
  })

  bench('large document', () => {
    autoCloseMarkdown(largeMarkdown, { frontmatter: true })
  })
})

describe('streaming', () => {
  bench('parse a partial document', async () => {
    await parse(partialMarkdown)
  })

  bench('parse a partial document in streaming mode', async () => {
    await streamingParse(partialMarkdown, { streaming: true })
  })

  // Re-parsing every growing chunk is what a renderer does while an LLM
  // streams tokens, and it is the hot path of the incremental parser.
  bench('parse a full stream of growing chunks', async () => {
    for (const chunk of streamChunks) {
      await streamingParse(chunk, { streaming: true })
    }
  })
})
