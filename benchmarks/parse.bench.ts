import { bench, describe } from 'vitest'
import { createMarkdownParser, parseMarkdown } from 'comark'
import { largeMarkdown, mediumMarkdown, smallMarkdown } from './fixtures.ts'

// Parsers are created once: `createMarkdownParser()` is the documented way to
// reuse a configured parser, so the benchmarks measure parsing only.
const parse = createMarkdownParser()
const parseWithoutAutoClose = createMarkdownParser({ autoClose: false })
const parseWithoutDefaultPlugins = createMarkdownParser({ registerDefaultPlugins: false })

describe('parse', () => {
  bench('small document', async () => {
    await parse(smallMarkdown)
  })

  bench('medium document', async () => {
    await parse(mediumMarkdown)
  })

  bench('large document', async () => {
    await parse(largeMarkdown)
  })
})

describe('parse options', () => {
  bench('medium document without auto-close', async () => {
    await parseWithoutAutoClose(mediumMarkdown)
  })

  bench('medium document without default plugins', async () => {
    await parseWithoutDefaultPlugins(mediumMarkdown)
  })

  bench('medium document with a fresh parser instance', async () => {
    await parseMarkdown(mediumMarkdown)
  })
})
