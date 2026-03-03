import { bench, run } from 'mitata'
import MarkdownIt from 'markdown-it'
import MarkdownExit from 'markdown-exit'
import pluginMdc from '@comark/markdown-it'
import { createParse } from './src/index'
import { renderHTML } from './src/string'

// Sample markdown content to test with
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

// Initialize markdown-it with MDC plugin
const markdownIt = new MarkdownIt({
  html: true,
  linkify: true,
})
  .enable(['table', 'strikethrough'])
  .use(pluginMdc)

// Initialize markdown-exit with MDC plugin
const markdownExit = new MarkdownExit({
  html: true,
  linkify: true,
})
  .enable(['table', 'strikethrough'])
  .use(pluginMdc)

const comark = createParse()
const comarkNoClose = createParse({ autoClose: false })

// Benchmark: markdown-it parsing
bench('markdown-it parse', () => {
  markdownIt.parse(sampleMarkdown, {})
})

// Benchmark: markdown-exit parsing
bench('markdown-exit parse', () => {
  markdownExit.parse(sampleMarkdown, {})
})

bench('comark parse', async () => {
  await comark(sampleMarkdown)
})

bench('comark parse no close', async () => {
  await comarkNoClose(sampleMarkdown)
})

// Benchmark: markdown-it render
bench('markdown-it render', () => {
  markdownIt.render(sampleMarkdown)
})

// Benchmark: markdown-exit render
bench('markdown-exit render', () => {
  markdownExit.render(sampleMarkdown)
})

// Benchmark: comark parse + renderHTML
bench('comark parse + renderHTML', async () => {
  const tree = await comark(sampleMarkdown)
  renderHTML(tree)
})

// Run all benchmarks
console.log('🏃 Running benchmarks...\n')
await run()
