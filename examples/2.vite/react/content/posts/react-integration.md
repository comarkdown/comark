---
title: Integrating Comark with React + Vite
description: How the Comark + React + Vite integration works under the hood.
pubDate: 2026-01-10
tags: [comark, react, integration]
---

This example uses React + Vite with Comark as the Markdown renderer.

## How it works

Instead of the typical `gray-matter` + `remark` + `rehype` pipeline, we use Comark's framework-agnostic API:

1. **Load markdown files** — Use Vite's `import.meta.glob` with `?raw` to eagerly load `.md` files
2. **Parse with Comark** — Call `parse()` in the browser to build the AST and extract frontmatter
3. **Route** — A tiny hash router for a zero-config static SPA
4. **Render with React** — Use `ComarkRenderer` from `@comark/react` with explicit component mapping

```ts
// src/lib/posts.ts
import { parse } from '@comark/react/parse'
import highlight from '@comark/react/plugins/highlight'

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

```tsx
// src/pages/BlogPost.tsx
import { ComarkRenderer } from '@comark/react'
import Alert from '../components/Alert'

const post = await getPost(slug)
// <ComarkRenderer tree={post.tree} components={{ Alert }} />
```

::Alert{type="info"}
Since this is a client-side SPA, `parse()` runs in the browser. Markdown files are bundled as raw strings at build time via `import.meta.glob`.
::

## Custom components

Pass custom components via the `components` prop on `ComarkRenderer`. Each component receives props and children from the Comark AST:

```tsx
// src/components/Alert.tsx
export default function Alert({ type = 'info', children }: {
  type?: 'info' | 'warning' | 'success' | 'danger'
  children?: React.ReactNode
}) {
  return <div className={`alert alert-${type}`} role="alert">{children}</div>
}
```

This makes it easy to extend your Markdown with reusable, styled components.
