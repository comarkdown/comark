---
title: Integrating Comark with Nuxt UI
description: How this Nuxt 4 app parses Markdown in Nitro routes and renders it with Nuxt UI prose components.
pubDate: 2026-01-10
tags: [comark, nuxt, integration]
---

This example uses Nuxt 4 with Comark as the Markdown parser and renderer, and Nuxt UI for prose styling.

## How it works

Instead of chaining `gray-matter`, `remark`, and `rehype`, a Nitro server route parses Markdown and frontmatter in one step:

1. **Read Markdown files**: load `.md` files from `content/posts/` inside a server route.
2. **Parse with Comark**: call `parseMarkdown()` with `shiki()` to build the `MarkdownDocument` and read `tree.frontmatter`.
3. **Generate static pages**: run `nuxt generate` to pre-render all post routes.
4. **Render in Vue**: pass `post.tree` to the auto-imported `<MarkdownDocument>` component.

```ts
// server/api/posts/[slug].get.ts
import { parseMarkdown } from 'comark'
import shiki from 'comark/plugins/shiki'

const tree = await parseMarkdown(content, {
  plugins: [shiki()],
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
  <MarkdownDocument :value="post.tree" />
</template>
```

::alert{type="info"}
The `@comark/vue` Nuxt module detects `@nuxt/ui` and turns on its prose component set without extra configuration.
::

## Nuxt UI prose components

When both `@comark/vue` and `@nuxt/ui` are installed, the module sets `ui.prose = true`, registering Nuxt UI's `Prose*` components globally:

- `ProseH1`, `ProseH2`, and `ProseH3` for headings
- `ProseP` for paragraphs
- `ProseCode` and `ProsePre` for inline and fenced code
- `ProseUl`, `ProseOl`, and `ProseLi` for lists
- `ProseA`, `ProseBlockquote`, and `ProseTable` for links, quotes, and tables

`MarkdownDocument` resolves standard Markdown tags to these global components automatically.

## Custom components

Custom components in `app/components/` receive props and default slot content from the Comark document:

```vue
<!-- app/components/Alert.vue -->
<script setup lang="ts">
defineProps<{ type?: 'info' | 'warning' | 'success' | 'danger' }>()
</script>

<template>
  <UAlert :color="color" variant="soft" class="my-4">
    <template #description><slot /></template>
  </UAlert>
</template>
```

Because Nuxt registers components in `app/components/`, `MarkdownDocument` resolves `::alert` to `Alert.vue`.
