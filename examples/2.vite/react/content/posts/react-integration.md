---
title: Integrating Comark with React and Vite
description: How this client-side SPA pairs React and Vite with Comark.
pubDate: 2026-01-10
tags: [comark, react, integration]
---

This example uses React and Vite with `@comark/react` as the Markdown renderer.

## How it works

Instead of chaining `gray-matter`, `remark`, and `rehype`, `src/lib/posts.ts` parses Markdown and frontmatter in a single call:

1. **Load Markdown files**: bundle `.md` files as raw strings at build time using Vite's `import.meta.glob` with `?raw`.
2. **Parse with Comark**: call `parseMarkdown()` in the browser with `shiki()` to build the `MarkdownDocument` and read `tree.frontmatter`.
3. **Route**: switch views with a hash router for static SPA hosting.
4. **Render with React**: pass `post.tree` and a `components` map to `MarkdownDocument` from `@comark/react`.

```ts
// src/lib/posts.ts
import { parseMarkdown } from 'comark'
import shiki from '@comark/react/plugins/shiki'

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

```tsx
// src/pages/BlogPost.tsx
import { MarkdownDocument } from '@comark/react'
import Alert from '../components/Alert'

const post = await getPost(slug)
// <MarkdownDocument value={post.tree} components={{ Alert }} />
```

::Alert{type="info"}
Because this app runs as a client-side SPA, `parseMarkdown()` executes in the browser against raw Markdown strings bundled by `import.meta.glob`.
::

## Custom components

Pass custom components through the `components` prop on `MarkdownDocument`. Each component receives resolved attributes as props and nested nodes as `children`:

```tsx
// src/components/Alert.tsx
export default function Alert({ type = 'info', children }: {
  type?: 'info' | 'warning' | 'success' | 'danger'
  children?: React.ReactNode
}) {
  return <div className={`alert alert-${type}`} role="alert">{children}</div>
}
```
