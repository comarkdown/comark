---
title: Integrating Comark with Vue and Vite
description: How this client-side SPA pairs Vue 3, Nuxt UI, and Vite with Comark.
pubDate: 2026-01-10
tags: [comark, vue, integration]
---

This example uses Vue 3 and Vite with `@comark/vue` as the Markdown renderer and Nuxt UI for component styling.

## How it works

Instead of chaining `gray-matter`, `remark`, and `rehype`, `src/lib/posts.ts` parses Markdown and frontmatter in a single call:

1. **Load Markdown files**: bundle `.md` files as raw strings at build time using Vite's `import.meta.glob` with `?raw`.
2. **Parse with Comark**: call `parseMarkdown()` in the browser with `shiki()` to build the `MarkdownDocument` and read `tree.frontmatter`.
3. **Route with Vue Router**: configure hash-based routing for static SPA hosting.
4. **Render with Vue**: pass `post.tree` and a `components` map to `MarkdownDocument` from `@comark/vue`.

```ts
// src/lib/posts.ts
import { parseMarkdown } from 'comark'
import shiki from 'comark/plugins/shiki'

const rawFiles = import.meta.glob(
  '../../content/posts/*.md',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>

export async function getPost(slug: string) {
  const content = Object.entries(rawFiles)
    .find(([path]) => path.endsWith(`${slug}.md`))?.[1]

  const tree = await parseMarkdown(content!, { plugins: [shiki()] })
  const fm = tree.frontmatter as Record<string, unknown>
  return { slug, tree, title: fm.title as string /* remaining fields omitted */ }
}
```

```vue
<!-- src/pages/blog/[slug].vue -->
<script setup lang="ts">
import { MarkdownDocument } from '@comark/vue'
import Alert from '@/components/Alert.vue'

const route = useRoute()
const post = ref(await getPost(route.params.slug as string))
</script>

<template>
  <MarkdownDocument :value="post.tree" :components="{ Alert }" />
</template>
```

::Alert{type="info"}
Because this app runs as a client-side SPA, `parseMarkdown()` executes in the browser against raw Markdown strings bundled by `import.meta.glob`.
::

## Custom components

Pass custom components through `:components` on `MarkdownDocument`. Each component receives resolved attributes as props and nested nodes in its `<slot />`:

```vue
<!-- src/components/Alert.vue -->
<script setup lang="ts">
const props = defineProps<{ type?: 'info' | 'warning' | 'success' | 'danger' }>()
const colorMap = { info: 'info', warning: 'warning', success: 'success', danger: 'error' }
const color = computed(() => colorMap[props.type ?? 'info'])
</script>

<template>
  <UAlert :color="color" variant="soft" class="my-4">
    <template #description><slot /></template>
  </UAlert>
</template>
```
