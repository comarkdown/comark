// Shared inputs for the CodSpeed suite (`*.bench.ts`).
//
// Everything here is deterministic: CodSpeed compares each benchmark against
// the same benchmark on the base branch, so changing a fixture resets that
// benchmark's history. Prefer adding a new fixture over editing an existing one.

/** A short document, close to a chat message or a README intro. */
export const smallMarkdown = `# Hello World

This is a **markdown** paragraph with *italic* text, \`inline code\` and a
[link](https://example.com).

- List item 1
- List item 2
- List item 3
`

/** A mid-sized document exercising most of the CommonMark + GFM + Comark surface. */
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

/** Nested block and inline components with props — the Comark-specific syntax paths. */
export const componentHeavyMarkdown = `::parent{id="root"}
# Nested components

::child{variant="a"}
Inline :badge[hot]{color="red"} and :icon[star]{name="star"}.

:::nested
Deep content with **formatting** and a [link](https://example.com).
:::
::

::card{title="Card A" :count="3" .featured}
Body A with \`code\` and *emphasis*.

#footer
Slot content for the footer.
::

::card{title="Card B"}
Body B

- one
- two
::
::

Hello :world[Inline Component Content]{data-component="test"} again, with a
[styled span]{.text-primary #anchor} and **bold{.loud}** text.

::tabs
  :::tabs-item{label="npm"}
  \`\`\`bash
  npm install comark
  \`\`\`
  :::

  :::tabs-item{label="pnpm"}
  \`\`\`bash
  pnpm add comark
  \`\`\`
  :::
::
`

/**
 * Pathological input: long delimiter runs, deep bracket and component nesting.
 * The parser and auto-close aim for linear time, so a super-linear regression
 * shows up here first.
 */
export const adversarialMarkdown = `${'['.repeat(50)}text${']'.repeat(50)}

${'*'.repeat(40)}borderline emphasis${'*'.repeat(40)}

${'_a '.repeat(200)}

${'`'.repeat(30)}unbalanced code

\`\`\`js
${'// comment\n'.repeat(200)}\`\`\`

| ${'a | '.repeat(30)}
| ${'--- | '.repeat(30)}
| ${'b | '.repeat(30)}

${'> '.repeat(30)}deep quote

${'::wrapper\n'.repeat(20)}${'inner\n'.repeat(5)}${'::\n'.repeat(20)}
${':inline{a="1"}'.repeat(100)}
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

::alert{type="info"
An alert that is still *being writt
`

/**
 * A chat-style answer with no headings. A streaming tail that contains `#`
 * forces a full reparse (heading ids depend on the whole document), so this is
 * the fixture that exercises incremental node reuse.
 */
export const chatMarkdown = `Sure! Here is how streaming works in **Comark**, step by step.

First, the parser keeps the nodes it produced for the previous chunk. When the
next chunk arrives it checks that the new text *starts with* the old one.

${Array.from(
  { length: 12 },
  (_, i) =>
    `${i + 1}. Step ${i + 1} reuses every stable node and only reparses the tail, so the cost stays close to the size of the new text and not the whole answer.`
).join('\n')}

::alert{type="tip"}
Call the same parser instance for every chunk, and pass \`{ streaming: true }\`.
::

\`\`\`ts
const parse = createMarkdownParser()
for await (const text of stream) {
  render(await parse(text, { streaming: true }))
}
\`\`\`

${Array.from(
  { length: 8 },
  (_, i) =>
    `Paragraph ${i + 1} keeps going with **bold**, *italic*, \`code\` and a [link](https://example.com/${i}) so that every chunk lands in a different place.`
).join('\n\n')}

| Chunk | Reused | Reparsed |
|-------|--------|----------|
| 1     | 0      | all      |
| n     | most   | tail     |

That's it — let me know if you want a full example!
`

/** Splits `markdown` into `count` growing prefixes, ending with the full text. */
export function toStreamChunks(markdown: string, count: number): string[] {
  const chunks: string[] = []
  const size = Math.ceil(markdown.length / count)
  for (let i = size; i < markdown.length; i += size) {
    chunks.push(markdown.slice(0, i))
  }
  chunks.push(markdown)
  return chunks
}

/** Markdown exercising the optional (non-default) plugins. */
export const pluginMarkdown = `${mediumMarkdown}
## Extras :rocket: :tada:

"Smart quotes" -- with dashes... and a footnote[^1].

Another 'quoted' sentence --- with an em dash (c) 2026.

[^1]: The footnote body with **bold** text.

<script>alert('xss')</script>

[Link](javascript:alert(1))

<!-- more -->

## Afterwards

Content after the summary delimiter.
`

/** Code-heavy markdown for the syntax highlighting plugins. */
export const codeMarkdown = `# Highlighting

\`\`\`typescript
import { parseMarkdown } from 'comark'

interface Options {
  autoClose?: boolean
  streaming?: boolean
}

export async function render(source: string, options: Options = {}): Promise<string> {
  const tree = await parseMarkdown(source, options)
  return JSON.stringify(tree.nodes)
}
\`\`\`

\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Clicked {{ count }} times</button>
</template>
\`\`\`

\`\`\`json
{ "name": "comark", "version": "1.0.0", "private": false }
\`\`\`

\`\`\`bash
pnpm add comark && pnpm bench
\`\`\`

Inline \`const x = 1\`{lang="ts"} code.
`
