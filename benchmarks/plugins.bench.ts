import { bench, describe } from 'vitest'
import { createMarkdownParser } from 'comark'
import emoji from 'comark/plugins/emoji'
import footnotes from 'comark/plugins/footnotes'
import headings from 'comark/plugins/headings'
import punctuation from 'comark/plugins/punctuation'
import rangi from 'comark/plugins/rangi'
import security from 'comark/plugins/security'
import shiki from 'comark/plugins/shiki'
import summary from 'comark/plugins/summary'
import toc from 'comark/plugins/toc'
import { codeMarkdown, pluginMarkdown } from './fixtures.ts'

// Each parser runs the same input, so the gap between a plugin and `baseline`
// is that plugin's own cost.
const baseline = createMarkdownParser()
const withToc = createMarkdownParser({ plugins: [toc()] })
const withEmoji = createMarkdownParser({ plugins: [emoji()] })
const withPunctuation = createMarkdownParser({ plugins: [punctuation()] })
const withFootnotes = createMarkdownParser({ plugins: [footnotes()] })
const withHeadings = createMarkdownParser({ plugins: [headings()] })
const withSecurity = createMarkdownParser({ plugins: [security()] })
const withSummary = createMarkdownParser({ plugins: [summary()] })
const withAll = createMarkdownParser({
  plugins: [toc(), emoji(), punctuation(), footnotes(), headings(), security(), summary()],
})

const codeBaseline = createMarkdownParser()
const withShiki = createMarkdownParser({ plugins: [shiki()] })
const withRangi = createMarkdownParser({ plugins: [rangi()] })

// Warm every parser. For Shiki this also loads the shared highlighter, its
// themes and grammars, so the benchmark measures highlighting, not setup.
for (const parse of [
  baseline,
  withToc,
  withEmoji,
  withPunctuation,
  withFootnotes,
  withHeadings,
  withSecurity,
  withSummary,
  withAll,
]) {
  await parse(pluginMarkdown)
}
for (const parse of [codeBaseline, withShiki, withRangi]) {
  await parse(codeMarkdown)
}

describe('plugins', () => {
  bench('baseline (default plugins only)', async () => {
    await baseline(pluginMarkdown)
  })

  bench('toc', async () => {
    await withToc(pluginMarkdown)
  })

  bench('emoji', async () => {
    await withEmoji(pluginMarkdown)
  })

  bench('punctuation', async () => {
    await withPunctuation(pluginMarkdown)
  })

  bench('footnotes', async () => {
    await withFootnotes(pluginMarkdown)
  })

  bench('headings', async () => {
    await withHeadings(pluginMarkdown)
  })

  bench('security', async () => {
    await withSecurity(pluginMarkdown)
  })

  bench('summary', async () => {
    await withSummary(pluginMarkdown)
  })

  bench('all of the above combined', async () => {
    await withAll(pluginMarkdown)
  })
})

describe('highlight', () => {
  bench('baseline (no highlighter)', async () => {
    await codeBaseline(codeMarkdown)
  })

  bench('shiki', async () => {
    await withShiki(codeMarkdown)
  })

  bench('rangi', async () => {
    await withRangi(codeMarkdown)
  })
})
