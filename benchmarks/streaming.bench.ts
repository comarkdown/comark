import { bench, describe } from 'vitest'
import { autoCloseMarkdown, createMarkdownParser } from 'comark'
import type { ComarkParseFn } from 'comark'
import {
  adversarialMarkdown,
  chatMarkdown,
  largeMarkdown,
  mediumMarkdown,
  partialMarkdown,
  toStreamChunks,
} from './fixtures.ts'

const mediumChunks = toStreamChunks(mediumMarkdown, 12)
const chatChunks = toStreamChunks(chatMarkdown, 24)
const partialChunks = toStreamChunks(partialMarkdown, 8)

// One parser per benchmark: a streaming parser caches the previous input and
// output, so sharing one would make results depend on execution order.
const parsePartial = createMarkdownParser()
const streamPartial = createMarkdownParser()
const streamMedium = createMarkdownParser()
const streamChat = createMarkdownParser()

/**
 * Replays a whole stream from scratch. The non-streaming call clears the
 * parser's incremental cache; without it every iteration after the first would
 * see an identical input and return the cached document without parsing.
 */
async function replay(parse: ComarkParseFn, chunks: string[]): Promise<void> {
  await parse('', { streaming: false })
  for (const chunk of chunks) {
    await parse(chunk, { streaming: true })
  }
}

await parsePartial(partialMarkdown)
await replay(streamPartial, partialChunks)
await replay(streamMedium, mediumChunks)
await replay(streamChat, chatChunks)
autoCloseMarkdown(partialMarkdown, { frontmatter: true })

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

  bench('adversarial document', () => {
    autoCloseMarkdown(adversarialMarkdown, { frontmatter: true })
  })

  bench('partial document, dropping trailing openers', () => {
    autoCloseMarkdown(partialMarkdown, { frontmatter: true, dropTrailingOpeners: true })
  })
})

describe('streaming', () => {
  bench('parse a partial document', async () => {
    await parsePartial(partialMarkdown)
  })

  bench('stream a partial document', async () => {
    await replay(streamPartial, partialChunks)
  })

  // Headings in the tail force full reparses, so this tracks the worst case.
  bench('stream a medium document', async () => {
    await replay(streamMedium, mediumChunks)
  })

  // No headings: the tail is reparsed on its own and stable nodes are reused.
  bench('stream a chat answer (incremental reuse)', async () => {
    await replay(streamChat, chatChunks)
  })
})
