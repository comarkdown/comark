import { bench, run, group, barplot } from 'mitata'
import MarkdownIt from 'markdown-it'
import MarkdownExit from 'markdown-exit'
import pluginMdc from '@comark/markdown-it'
import { createParse } from 'comark'
import highlight, { getHighlighter } from '../packages/comark/src/plugins/highlight'
import { codeToHast } from 'shiki/core'

const short = `
# Quick Start

Install with:

\`\`\`bash
npm install comark
\`\`\`

Then use it:

\`\`\`javascript
import { parse } from 'comark'
const tree = await parse('# Hello')
\`\`\`
`

const medium = `
# API Reference

## Parse

\`\`\`typescript
import { parse } from 'comark'

interface ParseOptions {
  autoClose?: boolean
  streaming?: boolean
  plugins?: ComarkPlugin[]
}

const tree = await parse(markdown, {
  autoClose: true,
  plugins: [highlight()],
})
\`\`\`

## Render

\`\`\`vue
<script setup>
import { Comark } from '@comark/vue'
import highlight from '@comark/vue/plugins/highlight'
</script>

<template>
  <Suspense>
    <Comark :plugins="[highlight()]">{{ content }}</Comark>
  </Suspense>
</template>
\`\`\`

## Configuration

\`\`\`json
{
  "name": "my-project",
  "dependencies": {
    "comark": "^0.2.0",
    "@comark/vue": "^0.2.0"
  }
}
\`\`\`
`

const long = Array.from(
  { length: 20 },
  (_, i) => `
## Module ${i + 1}

\`\`\`typescript
export function module${i + 1}(input: string): string {
  const result = input.trim()
  return result.length > 0 ? result : 'default'
}
\`\`\`

\`\`\`bash
npm run build:module-${i + 1}
\`\`\`
`
).join('\n')

// markdown-it / markdown-exit produce flat tokens — to get syntax highlighting
// they still need shiki. We benchmark both pipelines with the same shiki work.
const markdownIt = new MarkdownIt({ html: true, linkify: true }).enable(['table', 'strikethrough']).use(pluginMdc)
const markdownExit = new MarkdownExit({ html: true, linkify: true }).enable(['table', 'strikethrough']).use(pluginMdc)

// comark: baseline vs highlight plugin
const comark = createParse()
const comarkHl = createParse({ plugins: [highlight()] })

// Pre-warm shiki so we benchmark steady-state, not cold-start
const shiki = await getHighlighter()

// Warm up comark highlight to ensure shiki languages are loaded
await comarkHl(medium)

// Helper: extract fence tokens from markdown-it/exit and highlight them with shiki
// This simulates what a real markdown-it + shiki pipeline does.
async function highlightTokens(tokens: any[]) {
  for (const token of tokens) {
    if (token.type === 'fence' && token.info) {
      await codeToHast(shiki, token.content, {
        lang: token.info.split(/\s/)[0],
        themes: { light: 'material-theme-lighter', dark: 'material-theme-palenight' },
      })
    }
  }
}

for (const [label, content] of [
  ['short (2 blocks)', short],
  ['medium (3 blocks)', medium],
  ['long (40 blocks)', long],
] as const) {
  barplot(() => {
    group(`highlight — ${label}`, () => {
      bench('comark', async () => {
        await comark(content)
      })
      bench('comark + highlight', async () => {
        await comarkHl(content)
      })
      bench('markdown-it + shiki', async () => {
        const tokens = markdownIt.parse(content, {})
        await highlightTokens(tokens)
      })
      bench('markdown-exit + shiki', async () => {
        const tokens = markdownExit.parse(content, {})
        await highlightTokens(tokens)
      })
    })
  })
}

console.log('🏃 Running benchmarks...\n')
await run()
