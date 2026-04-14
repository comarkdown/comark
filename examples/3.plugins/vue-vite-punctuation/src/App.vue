<script setup lang="ts">
import { Comark } from '@comark/vue'
import punctuation from '@comark/vue/plugins/punctuation'

const markdown = `
# Punctuation Plugin Example

The punctuation plugin transforms plain-text punctuation into typographically correct Unicode characters.

## Smart Quotes

"Double quotes become curly" and 'single quotes too'.

Apostrophes in contractions like don't, won't, and it's are handled correctly.

## Dashes

An en-dash for ranges: pages 10--20, years 2020--2025.

An em-dash for parenthetical statements --- like this one --- adds emphasis.

## Ellipsis

Trailing off... becomes a proper ellipsis character.

## Symbols

- Copyright: (c) 2025 Comark Contributors
- Registered: Comark(r)
- Trademark: Comark(tm)
- Plus-minus: tolerance +-5%

## Code Is Preserved

Inline code like \`"hello" -- world...\` is not transformed.

\`\`\`
"Quotes" and -- dashes inside code blocks are also preserved.
\`\`\`

## Mixed Content

"She said 'hello' to the group" --- and then left... That's all (c) 2025.
`
</script>

<template>
  <Suspense>
    <Comark :plugins="[punctuation()]">
      {{ markdown }}
    </Comark>
  </Suspense>
</template>

<style>
body {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 720px;
  margin: 2rem auto;
  padding: 0 1rem;
  line-height: 1.6;
  color: #1a1a1a;
}

h1, h2, h3 {
  margin-top: 2rem;
}

code:not(pre code) {
  background: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

ul {
  padding-left: 1.5em;
}
</style>
