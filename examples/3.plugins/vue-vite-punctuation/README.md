---
title: Punctuation
description: Example showing how to use Comark with the punctuation plugin for smart quotes, dashes, and symbols in Vue and Vite.
navigation:
  icon: i-lucide-quote
category: Plugins
path: /examples/plugins/vue-vite-punctuation
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/3.plugins/vue-vite-punctuation
defaultValue: src/App.vue
---
::

## Features

This example demonstrates the punctuation plugin in Vue:

- **Smart quotes**: `"text"` → “text”, `'text'` → ‘text’
- **Dashes**: `--` → – (en-dash), `---` → — (em-dash)
- **Ellipsis**: `...` → …
- **Symbols**: `(c)` → ©, `(r)` → ®, `(tm)` → ™, `+-` → ±

## Usage

```vue
<script setup lang="ts">
import { Comark } from '@comark/vue'
import punctuation from '@comark/vue/plugins/punctuation'
</script>

<template>
  <Suspense>
    <Comark :plugins="[punctuation()]">{{ markdown }}</Comark>
  </Suspense>
</template>
```

## Learn More

- [Punctuation Plugin Documentation](/plugins/built-in/punctuation)
- [Comark Documentation](https://comark.dev)
