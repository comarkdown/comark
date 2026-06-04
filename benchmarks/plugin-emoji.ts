import { bench, run, group, barplot } from 'mitata'
import MarkdownIt from 'markdown-it'
import MarkdownExit from 'markdown-exit'
import { markdownItComark } from 'comark/plugins/syntax'
import { full as markdownItEmoji } from 'markdown-it-emoji'
import { createParse } from 'comark'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkEmoji from 'remark-emoji'
import emoji from '../packages/comark/src/plugins/emoji'

const short = `Hello :wave: world :rocket: that's :100: percent :fire:`

const medium = `
# Welcome :tada:

This is a **great** day :sunny: for coding :computer:

## Features :sparkles:

- Fast parsing :rocket:
- Easy to use :thumbsup:
- Great docs :books:

> "Keep it simple" :smile: -- someone wise :nerd_face:

Check out our :star: project on :octocat: GitHub!

Don't :x: forget to :heart: the repo :pray:
`

const long = Array.from(
  { length: 50 },
  (_, i) => `
## Section ${i + 1} :bookmark:

Paragraph ${i + 1} has some :smile: emoji and :rocket: inline codes.

- Item :thumbsup: with emoji
- Another :star: item
- Final :checkered_flag: item

> Quote with :heart: and :fire: emoji :100:
`
).join('\n')

// markdown-it: baseline vs emoji
const markdownIt = new MarkdownIt({ html: false, linkify: true })
  .enable(['table', 'strikethrough'])
  .use(markdownItComark)
const markdownItEm = new MarkdownIt({ html: false, linkify: true })
  .enable(['table', 'strikethrough'])
  .use(markdownItComark)
  .use(markdownItEmoji)

// markdown-exit: baseline vs emoji
const markdownExit = new MarkdownExit({ html: false, linkify: true })
  .enable(['table', 'strikethrough'])
  .use(markdownItComark)
const markdownExitEm = new MarkdownExit({ html: false, linkify: true })
  .enable(['table', 'strikethrough'])
  .use(markdownItComark)
  .use(markdownItEmoji)

// comark: baseline vs emoji plugin
const comark = createParse()
const comarkEm = createParse({ plugins: [emoji()] })

// remark (unified): baseline vs emoji
const remark = unified().use(remarkParse).use(remarkGfm)
const remarkEm = unified().use(remarkParse).use(remarkGfm).use(remarkEmoji)

for (const [label, content] of [
  ['short text', short],
  ['medium text', medium],
  ['long text (50 sections)', long],
] as const) {
  barplot(() => {
    group(`emoji — ${label}`, () => {
      bench('comark', async () => {
        await comark(content)
      })
      bench('comark + emoji', async () => {
        await comarkEm(content)
      })
      bench('markdown-it', () => {
        markdownIt.parse(content, {})
      })
      bench('markdown-it + emoji', () => {
        markdownItEm.parse(content, {})
      })
      bench('markdown-exit', () => {
        markdownExit.parse(content, {})
      })
      bench('markdown-exit + emoji', () => {
        markdownExitEm.parse(content, {})
      })
      bench('remark', () => {
        remark.parse(content)
      })
      bench('remark + emoji', () => {
        remarkEm.runSync(remarkEm.parse(content))
      })
    })
  })
}

console.log('🏃 Running benchmarks...\n')
await run()
