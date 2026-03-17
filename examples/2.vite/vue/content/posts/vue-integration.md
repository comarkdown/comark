---
title: Integrating Comark with Vue + Vite
description: How the Comark + Vue + Vite integration works under the hood.
pubDate: 2026-01-10
tags: [comark, vue, integration]
---

This example uses Vue 3 + Vite with Comark as the Markdown renderer and Nuxt UI for styled components.

## How it works

Instead of the typical `gray-matter` + `remark` + `rehype` pipeline, we use Comark's framework-agnostic API:

1. **Load markdown files** — Use Vite's `import.meta.glob` with `?raw` to eagerly load `.md` files
2. **Parse with Comark** — Call `parse()` in the browser to build the AST and extract frontmatter
3. **Route with Vue Router** — Hash-based routing for a zero-config static SPA
4. **Render with Vue** — Use `ComarkRenderer` from `@comark/vue` with explicit component mapping

```ts
// src/lib/posts.ts
import { parse } from 'comark'
import highlight from 'comark/plugins/highlight'

const rawFiles = import.meta.glob(
  '../../content/posts/*.md',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>

export async function getPost(slug: string) {
  const content = Object.entries(rawFiles)
    .find(([path]) => path.endsWith(`${slug}.md`))?.[1]

  const tree = await parse(content!, { plugins: [highlight()] })
  const fm = tree.frontmatter as Record<string, unknown>
  return { slug, tree, title: fm.title as string, /* ... */ }
}
```

```vue
<!-- src/pages/blog/[slug].vue -->
<script setup lang="ts">
import { ComarkRenderer } from '@comark/vue'
import Alert from '@/components/Alert.vue'

const route = useRoute()
const post = ref(await getPost(route.params.slug as string))
</script>

<template>
  <ComarkRenderer :tree="post.tree" :components="{ Alert }" />
</template>
```

::Alert{type="info"}
Since this is a client-side SPA, `parse()` runs in the browser. Markdown files are bundled as raw strings at build time via `import.meta.glob`.
::

## Custom components

Pass custom components via the `components` prop on `ComarkRenderer`. Each component receives props and children from the Comark AST:

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

This makes it easy to extend your Markdown with reusable, styled components.
