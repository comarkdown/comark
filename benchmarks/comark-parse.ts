import { bench, run, barplot, group } from 'mitata'
import MarkdownIt from 'markdown-it'
import MarkdownExit from 'markdown-exit'
import { markdownItComponents } from 'comark/plugins/components'
import { markdownItAttributes } from 'comark/plugins/attributes'
import { createMarkdownParser } from 'comark'

const sampleMarkdown = `---
title: Benchmark Test
---

# Hello World

This is a **markdown** document with *italic* text and [links](https://example.com).

## Features

- List item 1
- List item 2
- List item 3

### Code Block

\`\`\`javascript
const hello = 'world'
console.log(hello)
\`\`\`

### Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### MDC Components

::alert{type="info"}
This is an alert component
::

::card{title="My Card"}
Card content here
::

### More Content

1. Numbered list
2. Another item
3. Final item

> This is a blockquote with some **bold** text

~~Strikethrough text~~

`

const markdownIt = new MarkdownIt({
  html: true,
  linkify: true,
})
  .enable(['table', 'strikethrough'])
  .use(markdownItComponents)
  .use(markdownItAttributes)

const markdownExit = new MarkdownExit({
  html: true,
  linkify: true,
})
  .enable(['table', 'strikethrough'])
  .use(markdownItComponents)
  .use(markdownItAttributes)

const comark = createMarkdownParser()
const comarkNoClose = createMarkdownParser({ autoClose: false })
const comarkStreaming = createMarkdownParser()

barplot(() => {
  group('parse', () => {
    bench('markdown-it parse', () => {
      markdownIt.parse(sampleMarkdown, {})
    })

    bench('markdown-exit parse', () => {
      markdownExit.parse(sampleMarkdown, {})
    })

    bench('comark parse', async () => {
      await comark(sampleMarkdown)
    })

    bench('comark parse no close', async () => {
      await comarkNoClose(sampleMarkdown)
    })

    bench('comark parse streaming', async () => {
      await comarkStreaming(sampleMarkdown, { streaming: true })
    })
  })
})

console.log('🏃 Running benchmarks...\n')
await run()
