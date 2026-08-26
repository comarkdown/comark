/**
 * Shared fixture inputs for CodSpeed / Vitest benches.
 * Isolated Comark-only workloads — no markdown-it/exit comparisons.
 */

/** Small CommonMark document (~few hundred chars). */
export const smallMarkdown = `# Hello

This is a **bold** paragraph with *italic* text and a [link](https://example.com).

- item one
- item two
`

/** Medium document: headings, lists, table, code, blockquote, components. */
export const mediumMarkdown = `---
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

/** Large synthetic document (~100 sections). */
export const largeMarkdown = Array.from({ length: 100 })
  .fill(
    `# Heading

This is a paragraph with **bold**, *italic*, and a [link](https://example.com).

- list item a
- list item b

\`\`\`js
const x = 1
\`\`\`
`
  )
  .join('\n')

/** Nested block / inline components — exercises the components + attributes plugins. */
export const componentHeavyMarkdown = `::parent{id="root"}
# Nested components

::child{variant="a"}
Inline :badge[hot]{color="red"} and :icon[star]{name="star"}.

:::nested
Deep content with **formatting** and a [link](https://example.com).
:::
::

::card{title="Card A"}
Body A with \`code\` and *emphasis*.
::

::card{title="Card B"}
Body B

- one
- two
::
::

Hello :world[Inline Component Content]{data-component="test"} again.
`

/**
 * Incomplete / streaming-style markdown (unclosed emphasis, fence, component).
 * Used with autoClose on/off and streaming mode.
 */
export const incompleteMarkdown = `# Streaming draft

This has **unclosed bold and a list:

- item 1
- item 2

\`\`\`ts
function incomplete(

::alert{type="warning"
Partial component body
`

/** Pathological nesting and long runs that stress the scanner. */
export const adversarialMarkdown = `${'['.repeat(50)}text${']'.repeat(50)}

${'*'.repeat(40)}borderline emphasis${'*'.repeat(40)}

\`\`\`js
${'// comment\n'.repeat(200)}
\`\`\`

| ${'a | '.repeat(30)}
| ${'--- | '.repeat(30)}
| ${'b | '.repeat(30)}

${'::wrapper\n'.repeat(20)}${'inner\n'.repeat(5)}${'::\n'.repeat(20)}
`
