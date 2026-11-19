# Smart quotes and dashes in Vue and Vite

This example converts ASCII punctuation sequences into typographic characters in Vue and Vite using `@comark/vue/plugins/punctuation`.

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

## Run locally

From the monorepo root:

```bash
pnpm --filter comark-vue-vite-punctuation dev
```

## Learn more

- [Punctuation plugin documentation](https://comark.dev/plugins/built-in/punctuation)
- [Comark documentation](https://comark.dev)
