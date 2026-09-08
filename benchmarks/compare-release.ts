/**
 * Side-by-side parse benchmark: current workspace vs latest published release (0.6.2).
 *
 * Usage:
 *   pnpm exec tsx benchmarks/compare-release.ts
 *
 * Expects /tmp/comark-bench-compare/release-0.6.2 (from `npm pack comark@0.6.2`).
 */
import { bench, run, barplot, group } from 'mitata'
import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const RELEASE_ROOT = process.env.COMARK_RELEASE_ROOT ?? '/tmp/comark-bench-compare/release-0.6.2'

const release = await import(pathToFileURL(resolve(RELEASE_ROOT, 'dist/index.js')).href)
const current = await import(pathToFileURL(resolve(root, 'packages/comark/src/index.ts')).href)

const releaseParse = release.createMarkdownParser()
const releaseNoClose = release.createMarkdownParser({ autoClose: false })
const releaseStreaming = release.createMarkdownParser()

const currentParse = current.createMarkdownParser()
const currentNoClose = current.createMarkdownParser({ autoClose: false })
const currentStreaming = current.createMarkdownParser()

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

// HTML-heavy sample (relevant to feat/html-block-2 work)
const htmlMarkdown = `# Docs

<div class="callout">
  Hello **world** and a [link](https://example.com)
</div>

<details>
<summary>Open me</summary>

Paragraph inside details with *emphasis*.

- a
- b

</details>

<table>
  <tr><td>**bold cell**</td><td>plain</td></tr>
</table>

::note
Nested HTML:

<div>
  <p>inside component</p>
</div>
::
`

const largeMarkdown = Array.from(
  { length: 50 },
  (_, i) => `
## Section ${i}

Paragraph **${i}** with *italic* and a [link](https://example.com/${i}).

- item one
- item two
- item three

\`\`\`ts
export const n = ${i}
console.log(n)
\`\`\`

| A | B |
|---|---|
| ${i} | ${i * 2} |

::card{title="Card ${i}"}
Body ${i}
::
`
).join('\n')

function jsonSize(v: unknown): number {
  return Buffer.byteLength(JSON.stringify(v), 'utf8')
}

function countNodes(nodes: unknown[]): number {
  let n = 0
  const walk = (x: unknown) => {
    n++
    if (Array.isArray(x) && typeof x[0] === 'string') {
      for (let i = 2; i < x.length; i++) walk(x[i])
    } else if (Array.isArray(x)) {
      for (const c of x) walk(c)
    }
  }
  for (const node of nodes) walk(node)
  return n
}

async function sanity() {
  const r = await releaseParse('# sanity')
  const c = await currentParse('# sanity')
  console.log('release nodes:', JSON.stringify(r.nodes))
  console.log('current nodes:', JSON.stringify(c.nodes))
  console.log(`release: ${RELEASE_ROOT}`)
  console.log(`current:  workspace packages/comark (src via tsx)`)

  for (const [label, md] of [
    ['sample', sampleMarkdown],
    ['html-heavy', htmlMarkdown],
    ['large×50', largeMarkdown],
  ] as const) {
    const rd = await releaseParse(md)
    const cd = await currentParse(md)
    console.log(
      `ast ${label.padEnd(12)} release nodes=${String(countNodes(rd.nodes)).padStart(5)} size=${String(jsonSize(rd.nodes)).padStart(7)}B  |  current nodes=${String(countNodes(cd.nodes)).padStart(5)} size=${String(jsonSize(cd.nodes)).padStart(7)}B`
    )
  }
  console.log('')
}

await sanity()

barplot(() => {
  group('parse — sample (components + gfm)', () => {
    bench('release 0.6.2', async () => {
      await releaseParse(sampleMarkdown)
    })
    bench('current (HEAD)', async () => {
      await currentParse(sampleMarkdown)
    })
    bench('release no autoClose', async () => {
      await releaseNoClose(sampleMarkdown)
    })
    bench('current  no autoClose', async () => {
      await currentNoClose(sampleMarkdown)
    })
    bench('release streaming', async () => {
      await releaseStreaming(sampleMarkdown, { streaming: true })
    })
    bench('current  streaming', async () => {
      await currentStreaming(sampleMarkdown, { streaming: true })
    })
  })

  group('parse — html-heavy', () => {
    bench('release 0.6.2', async () => {
      await releaseParse(htmlMarkdown)
    })
    bench('current (HEAD)', async () => {
      await currentParse(htmlMarkdown)
    })
  })

  group('parse — large ×50 sections', () => {
    bench('release 0.6.2', async () => {
      await releaseParse(largeMarkdown)
    })
    bench('current (HEAD)', async () => {
      await currentParse(largeMarkdown)
    })
  })
})

console.log('🏃 Comparing release 0.6.2 vs current HEAD...\n')
await run()
