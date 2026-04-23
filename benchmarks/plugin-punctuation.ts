import { bench, run, group, barplot } from 'mitata'
import MarkdownExit from 'markdown-exit'
import pluginMdc from '@comark/markdown-it'
import { createParse } from 'comark'
import { log } from '@comark/ansi'
import punctuation from '../packages/comark/src/plugins/punctuation'

// ── Test content (exercises ALL features: quotes, dashes, ellipsis, symbols, normalization) ──

const short = `"Hello" -- world... (c) 2025 what???? ok,,`

const medium = `
# Smart Typography

"She said 'hello' to the group" --- and then left... That's all (c) 2025.

Pages 10--20 cover the topic. The product(tm) is great.

Don't forget: it's a "beautiful" day. The tolerance is +-5%.

Copyright (c) 2025 Acme Corp(r). All rights reserved...

Really?.... wow!!!!! hmm,, ok
`

const long = Array.from(
  { length: 50 },
  (_, i) => `
## Section ${i + 1}

"Paragraph ${i + 1}" has some 'quoted text' and contractions like don't, won't, can't.

The range is ${i}--${i + 10} and the em-dash --- is used here... plus (c) (r) (tm) +-5%.

Another line with "double quotes" and 'single quotes' and more ellipsis...

Really????  Wow!!!!! hmm,, ok?.... end
`
).join('\n')

// ── markdown-it typographer ─────────────────────────────────────────────────

const parserTypographer = new MarkdownExit({
  html: false,
  linkify: true,
  typographer: true,
})
  .enable(['table', 'strikethrough'])
  .use(pluginMdc)

const parserNoTypographer = new MarkdownExit({
  html: false,
  linkify: true,
  typographer: false,
})
  .enable(['table', 'strikethrough'])
  .use(pluginMdc)

// ── comark with full punctuation plugin (all features) ──────────────────────

const comarkFull = createParse({ plugins: [punctuation()] })
const comarkBaseline = createParse()

// ── Benchmarks ──────────────────────────────────────────────────────────────

barplot(() => {
  group('short text (all features)', () => {
    bench('markdown-it typographer', () => {
      parserTypographer.parse(short, {})
    })
    bench('markdown-it baseline', () => {
      parserNoTypographer.parse(short, {})
    })
    bench('comark + punctuation (full)', async () => {
      await comarkFull(short)
    })
    bench('comark baseline', async () => {
      await comarkBaseline(short)
    })
  })
})

barplot(() => {
  group('medium text (all features)', () => {
    bench('markdown-it typographer', () => {
      parserTypographer.parse(medium, {})
    })
    bench('markdown-it baseline', () => {
      parserNoTypographer.parse(medium, {})
    })
    bench('comark + punctuation (full)', async () => {
      await comarkFull(medium)
    })
    bench('comark baseline', async () => {
      await comarkBaseline(medium)
    })
  })
})

barplot(() => {
  group('long text — 50 sections (all features)', () => {
    bench('markdown-it typographer', () => {
      parserTypographer.parse(long, {})
    })
    bench('markdown-it baseline', () => {
      parserNoTypographer.parse(long, {})
    })
    bench('comark + punctuation (full)', async () => {
      await comarkFull(long)
    })
    bench('comark baseline', async () => {
      await comarkBaseline(long)
    })
  })
})

// ── Output comparison ───────────────────────────────────────────────────────

function flattenText(nodes: any[]): string {
  let text = ''
  for (const node of nodes) {
    if (typeof node === 'string') text += node
    else if (Array.isArray(node) && node.length > 2) text += flattenText(node.slice(2))
  }
  return text
}

const testStr = `"Hello" -- world... (c) what???? ok,, really!.... hmm.....`

console.log('=== Output Comparison ===\n')
console.log('Input:', JSON.stringify(testStr))

const miTokens = parserTypographer.parse(testStr, {})
const miText = miTokens
  .filter((t: any) => t.type === 'inline')
  .map((t: any) => t.content)
  .join('')
console.log('markdown-it typographer:', JSON.stringify(miText))

const comarkTree = await comarkFull(testStr)
console.log('comark punctuation:     ', JSON.stringify(flattenText(comarkTree.nodes)))

console.log('\n🏃 Running benchmarks...\n')
await run()

await log(`> [!NOTE]
> The goal of this benchmark is to compare the additional time each parser takes when
> using punctuation plugins.
>
> Official plugin adds ~100% the execution time, while comark adds ~25% execution time`)
