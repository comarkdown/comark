---
title: Integrating Comark with Svelte + Vite
description: How the Comark + Svelte + Vite integration works under the hood.
pubDate: 2026-01-10
tags: [comark, svelte, integration]
---

This example uses Svelte 5 + Vite with Comark as the Markdown renderer.

## How it works

Instead of the typical `gray-matter` + `remark` + `rehype` pipeline, we use Comark's framework-agnostic API:

1. **Load markdown files** — Use Vite's `import.meta.glob` with `?raw` to eagerly load `.md` files
2. **Parse with Comark** — Call `parseMarkdown()` in the browser to build the AST and extract frontmatter
3. **Route** — A tiny hash router for a zero-config static SPA
4. **Render with Svelte** — Use `MarkdownDocument` from `@comark/svelte` with explicit component mapping

```ts
// src/lib/posts.ts
import { parseMarkdown } from 'comark'
import shiki from '@comark/svelte/plugins/shiki'

const rawFiles = import.meta.glob(
  '../../content/posts/*.md',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>

export async function getPost(slug: string) {
  const content = Object.entries(rawFiles)
    .find(([path]) => path.endsWith(`${slug}.md`))?.[1]

  const tree = await parseMarkdown(content!, { plugins: [shiki()] })
  const fm = tree.frontmatter as Record<string, unknown>
  return { slug, tree, title: fm.title as string, /* ... */ }
}
```

```svelte
<!-- src/pages/BlogPost.svelte -->
<script lang="ts">
  import { MarkdownDocument } from '@comark/svelte'
  import Alert from '../components/Alert.svelte'

  let { tree } = $props()
</script>

<MarkdownDocument value={tree} components={{ Alert }} />
```

::Alert{type="info"}
Since this is a client-side SPA, `parseMarkdown()` runs in the browser. Markdown files are bundled as raw strings at build time via `import.meta.glob`.
::

## Lazy-loaded components

The `componentsManifest` prop resolves missing components on demand — see the [Syntax](#/syntax) page for a live `lazy-card` example.
