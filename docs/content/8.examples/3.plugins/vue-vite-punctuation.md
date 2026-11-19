---
title: 'Smart Quotes and Dashes in Vue Markdown'
description: Convert plain-text quotes, dashes, ellipses, and symbols into typographic characters in Vue and Vite with the punctuation plugin.
navigation:
  title: 'Punctuation'
  icon: i-lucide-quote
---

::code-explorer
---
org: comarkdown
repo: comark@c78885ca7504b38afc7ced59aac1a3c6b3cc5425
path: examples/3.plugins/vue-vite-punctuation
defaultValue: src/App.vue
---
::

This example converts ASCII punctuation sequences into typographic characters in Vue and Vite with `@comark/vue/plugins/punctuation`.

## Replacements

- **Smart quotes**: `"text"` → “text”, `'text'` → ‘text’
- **Dashes**: `--` → – (en dash), `---` → — (em dash)
- **Ellipsis**: `...` → …
- **Symbols**: `(c)` → ©, `(r)` → ®, `(tm)` → ™, `+-` → ±

## Usage

```vue
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import punctuation from '@comark/vue/plugins/punctuation'
</script>

<template>
  <Suspense>
    <Markdown :plugins="[punctuation()]">{{ markdown }}</Markdown>
  </Suspense>
</template>
```

## Learn more

- [Punctuation plugin documentation](/plugins/built-in/punctuation)
- [Vue rendering](/rendering/vue)
