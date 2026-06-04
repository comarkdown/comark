import { bench, run, group, barplot } from 'mitata'
import MarkdownIt from 'markdown-it'
import MarkdownExit from 'markdown-exit'
import { markdownItComark } from 'comark/plugins/syntax'
import { createParse } from 'comark'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'
import punctuation from '../packages/comark/src/plugins/punctuation'

// Test content (exercises ALL features: quotes, dashes, ellipsis, symbols, normalization)

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

// markdown-it: baseline vs typographer
const markdownIt = new MarkdownIt({ html: false, linkify: true, typographer: false })
  .enable(['table', 'strikethrough'])
  .use(markdownItComark)
const markdownItTypo = new MarkdownIt({ html: false, linkify: true, typographer: true })
  .enable(['table', 'strikethrough'])
  .use(markdownItComark)

// markdown-exit: baseline vs typographer
const markdownExit = new MarkdownExit({ html: false, linkify: true, typographer: false })
  .enable(['table', 'strikethrough'])
  .use(markdownItComark)
const markdownExitTypo = new MarkdownExit({ html: false, linkify: true, typographer: true })
  .enable(['table', 'strikethrough'])
  .use(markdownItComark)

// comark: baseline vs punctuation plugin
const comark = createParse()
const comarkPunct = createParse({ plugins: [punctuation()] })

// remark (unified): baseline vs smartypants
const remark = unified().use(remarkParse).use(remarkGfm)
const remarkSmarty = unified().use(remarkParse).use(remarkGfm).use(remarkSmartypants)


for (const [label, content] of [
  ['short text', short],
  ['medium text', medium],
  ['long text (50 sections)', long],
] as const) {
  barplot(() => {
    group(`punctuation — ${label}`, () => {
      bench('comark', async () => {
        await comark(content)
      })
      bench('comark + punctuation', async () => {
        await comarkPunct(content)
      })
      bench('markdown-it', () => {
        markdownIt.parse(content, {})
      })
      bench('markdown-it + typographer', () => {
        markdownItTypo.parse(content, {})
      })
      bench('markdown-exit', () => {
        markdownExit.parse(content, {})
      })
      bench('markdown-exit + typographer', () => {
        markdownExitTypo.parse(content, {})
      })
      bench('remark', () => {
        remark.parse(content)
      })
      bench('remark + smartypants', () => {
        remarkSmarty.runSync(remarkSmarty.parse(content))
      })
    })
  })
}

console.log('🏃 Running benchmarks...\n')
await run()
