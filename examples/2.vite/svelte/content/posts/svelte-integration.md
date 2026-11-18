---
title: Integrating Comark with Svelte and Vite
description: How this client-side SPA pairs Svelte 5 and Vite with Comark.
pubDate: 2026-01-10
tags: [comark, svelte, integration]
---

This example uses Svelte 5 and Vite with `@comark/svelte` as the Markdown renderer.

## How it works

Instead of chaining `gray-matter`, `remark`, and `rehype`, `src/lib/posts.ts` parses Markdown and frontmatter in a single call:

1. **Load Markdown files**: bundle `.md` files as raw strings at build time using Vite's `import.meta.glob` with `?raw`.
2. **Parse with Comark**: call `parseMarkdown()` in the browser with `shiki()` to build the `MarkdownDocument` and read `tree.frontmatter`.
3. **Route**: switch views with a hash router for static SPA hosting.
4. **Render with Svelte**: pass `tree` and a `components` map to `MarkdownDocument` from `@comark/svelte`.

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
  return { slug, tree, title: fm.title as string /* remaining fields omitted */ }
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
Because this app runs as a client-side SPA, `parseMarkdown()` executes in the browser against raw Markdown strings bundled by `import.meta.glob`.
::

## Lazy-loaded components

Pass `componentsManifest` to resolve custom components dynamically on first use. Open the [Syntax](#/syntax) page to inspect a lazy-loaded `lazy-card` component.
