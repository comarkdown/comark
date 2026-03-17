---
title: Integrating Comark with Nuxt UI
description: How the Comark + Nuxt UI integration works under the hood.
pubDate: 2026-01-10
tags: [comark, nuxt, integration]
---

This example uses Nuxt 4 with Comark as the Markdown renderer and Nuxt UI for styled prose components.

## How it works

Instead of the typical `gray-matter` + `remark` + `rehype` pipeline, we use Comark's framework-agnostic API:

1. **Read markdown files** — Load `.md` files from the `content/posts/` directory via a server route
2. **Parse with Comark** — Call `parse()` to build the AST and extract frontmatter
3. **Static generation** — Use `nuxt generate` for full SSG
4. **Render with Vue** — Use `ComarkRenderer` from `@comark/nuxt` with auto-discovered components

```ts
// server/api/posts/[slug].get.ts
import { parse } from 'comark'
import highlight from 'comark/plugins/highlight'

const tree = await parse(content, {
  plugins: [highlight()],
})

return { slug, title, description, pubDate, tags, tree }
```

```vue
<!-- app/pages/blog/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)
</script>

<template>
  <ComarkRenderer :tree="post.tree" />
</template>
```

::alert{type="info"}
`@comark/nuxt` automatically detects Nuxt UI and enables its prose components — no extra configuration needed.
::

## Nuxt UI prose components

When both `@comark/nuxt` and `@nuxt/ui` are installed, the module sets `ui.content = true`. This registers Nuxt UI's `Prose*` components globally:

- `ProseH1`, `ProseH2`, `ProseH3` for headings
- `ProseP` for paragraphs
- `ProseCode`, `ProsePre` for code
- `ProseUl`, `ProseOl`, `ProseLi` for lists
- And more…

`ComarkRenderer` automatically picks these up — no manual wiring required.

## Custom components

You can still register custom components. Each one receives props and children from the Comark AST:

```vue
<!-- app/components/Alert.vue -->
<script setup lang="ts">
defineProps<{ type?: 'info' | 'warning' | 'success' | 'danger' }>()
</script>

<template>
  <UAlert :color="..." variant="soft" class="my-4">
    <template #description><slot /></template>
  </UAlert>
</template>
```

Since Nuxt auto-registers components in `app/components/`, `ComarkRenderer` resolves them automatically.
