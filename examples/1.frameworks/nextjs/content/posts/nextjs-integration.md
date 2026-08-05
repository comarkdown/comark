---
title: Integrating Comark with Next.js
description: How the Comark + Next.js integration works under the hood.
pubDate: 2026-01-10
tags: [comark, nextjs, integration]
---

This example uses Next.js App Router with Comark as the Markdown renderer.

## How it works

Instead of using the typical `gray-matter` + `remark` + `rehype` pipeline, we use Comark's framework-agnostic API:

1. **Read markdown files** — Load `.md` files from the `content/posts/` directory
2. **Parse with Comark** — Call `parseMarkdown()` to build the AST and extract frontmatter
3. **Static generation** — Use `generateStaticParams` for full SSG
4. **Render with React** — Use `MarkdownDocument` from `@comark/react` with custom components

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/react'
import shiki from 'comark/plugins/shiki'
import Alert from '@/components/Alert'

const tree = await parseMarkdown(content, {
  plugins: [shiki()],
})

// In your Server Component:
// <MarkdownDocument value={tree} components={{ Alert }} />
```

::alert{type="info"}
Since Next.js Server Components run on the server, Comark's `parseMarkdown()` is called at build time — zero JavaScript is sent to the client.
::

## Custom components

You can register any number of custom components. Each one receives props and children from the Comark AST:

```tsx
export default function Alert({ type = 'info', children }) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      {children}
    </div>
  )
}
```

This makes it easy to extend your Markdown with reusable, styled components.
