import { bench, describe } from 'vitest'
import { createMarkdownParser, parseMarkdown } from 'comark'
import {
  adversarialMarkdown,
  componentHeavyMarkdown,
  largeMarkdown,
  mediumMarkdown,
  smallMarkdown,
} from './fixtures.ts'

// Parsers are created once (the documented way to reuse a configuration) and
// warmed at module load, so samples measure steady-state parsing rather than
// first-call plugin and JIT setup.
const parse = createMarkdownParser()
const parseWithoutAutoClose = createMarkdownParser({ autoClose: false })
const parseWithoutDefaultPlugins = createMarkdownParser({ registerDefaultPlugins: false })

for (const markdown of [smallMarkdown, mediumMarkdown, largeMarkdown, componentHeavyMarkdown, adversarialMarkdown]) {
  await parse(markdown)
}
await parseWithoutAutoClose(mediumMarkdown)
await parseWithoutDefaultPlugins(mediumMarkdown)
await parseMarkdown(mediumMarkdown)

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

  bench('component-heavy document', async () => {
    await parse(componentHeavyMarkdown)
  })

  bench('adversarial document', async () => {
    await parse(adversarialMarkdown)
  })
})

describe('parse options', () => {
  bench('medium document without auto-close', async () => {
    await parseWithoutAutoClose(mediumMarkdown)
  })

  bench('medium document without default plugins', async () => {
    await parseWithoutDefaultPlugins(mediumMarkdown)
  })

  // `parseMarkdown()` resolves its options and plugins on every call (the
  // markdown-exit instance itself is shared). The gap with `parse` above is
  // the per-call overhead `createMarkdownParser()` saves.
  bench('medium document with parseMarkdown()', async () => {
    await parseMarkdown(mediumMarkdown)
  })
})
