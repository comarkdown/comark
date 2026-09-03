// Shared markdown fixtures for the CodSpeed benchmark suite (`*.bench.ts`).
// They are intentionally deterministic so results stay comparable across runs.

/** A short document, close to a chat message or a README intro. */
export const smallMarkdown = `# Hello World

This is a **markdown** paragraph with *italic* text, \`inline code\` and a
[link](https://example.com).

- List item 1
- List item 2
- List item 3
`

/** A mid-sized document exercising most of the CommonMark + GFM surface. */
export const mediumMarkdown = `---
title: Benchmark Test
description: A document covering the common Markdown surface
tags:
  - markdown
  - benchmark
---

# Hello World

This is a **markdown** document with *italic* text and [links](https://example.com).

## Features

- List item 1
- List item 2 with \`inline code\`
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

### Components

::alert{type="info"}
This is an alert component with **bold** content.
::

::card{title="My Card"}
Card content here
::

A [span]{.text-primary} and an image ![alt](https://example.com/img.png).

### More Content

1. Numbered list
2. Another item
3. Final item

> This is a blockquote with some **bold** text

- [ ] An open task
- [x] A completed task

~~Strikethrough text~~

<div class="raw-html">
  <span>Inline <b>HTML</b> block</span>
</div>
`

/** A long document, representative of a full documentation page. */
export const largeMarkdown = `---
title: Large Benchmark Document
---

# API Reference

${Array.from(
  { length: 40 },
  (_, i) => `
## Module ${i + 1}

Paragraph ${i + 1} with **bold**, *italic*, \`code\` and a [link](https://example.com/${i}).

\`\`\`typescript
export function module${i + 1}(input: string): string {
  const result = input.trim()
  return result.length > 0 ? result : 'default'
}
\`\`\`

| Option | Type | Default |
|--------|------|---------|
| \`a\`  | \`string\` | \`'${i}'\` |
| \`b\`  | \`number\` | \`${i}\` |

::alert{type="info"}
Note ${i + 1} about **module ${i + 1}**.
::

- item ${i}.1
- item ${i}.2
- item ${i}.3

> Quote ${i + 1}
`
).join('\n')}
`

/**
 * Truncated markdown, as produced by an LLM mid-stream: unclosed emphasis,
 * an open code fence, a half written table and an unterminated component.
 */
export const partialMarkdown = `---
title: Streaming
---

# Streaming output

Here is some **bold text that is not

\`\`\`typescript
export function incomplete(input: string) {
  const value = input

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   |

::alert{type="info"}
An alert that is still *being writt
`

/** Progressive chunks of `mediumMarkdown`, used to simulate a stream. */
export const streamChunks: string[] = (() => {
  const chunks: string[] = []
  const size = Math.ceil(mediumMarkdown.length / 12)
  for (let i = size; i < mediumMarkdown.length; i += size) {
    chunks.push(mediumMarkdown.slice(0, i))
  }
  chunks.push(mediumMarkdown)
  return chunks
})()
