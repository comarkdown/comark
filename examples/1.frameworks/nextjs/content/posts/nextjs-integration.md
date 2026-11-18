---
title: Integrating Comark with Next.js
description: How this blog renders Markdown with Comark and React Server Components.
pubDate: 2026-01-10
tags: [comark, nextjs, integration]
---

This example pairs the Next.js App Router with `parseMarkdown()` and `@comark/react`.

## How it works

Instead of chaining `gray-matter`, `remark`, and `rehype`, `lib/posts.ts` parses Markdown and frontmatter in a single call:

1. **Read Markdown files**: load `.md` files from `content/posts/` with `node:fs`.
2. **Parse with Comark**: call `parseMarkdown()` with `shiki()` to build the `MarkdownDocument` and read `tree.frontmatter`.
3. **Generate static routes**: return all post slugs from `generateStaticParams`.
4. **Render in a Server Component**: pass `tree` to `MarkdownDocument` from `@comark/react` with custom components.

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/react'
import shiki from 'comark/plugins/shiki'
import Alert from '@/components/Alert'
import CodeBlock from '@/components/CodeBlock'

const tree = await parseMarkdown(content, {
  plugins: [shiki()],
})

// Inside a Server Component:
// <MarkdownDocument value={tree} components={{ Alert, pre: CodeBlock }} />
```

::alert{type="info"}
Because Next.js Server Components execute at build time during static export, `parseMarkdown()` and Shiki never ship to the browser.
::

## Custom components

Register custom components on the `components` prop of `MarkdownDocument`. Each component receives resolved attributes and rendered children. For example, mapping `CodeBlock` to `pre` adds a client copy button while keeping code highlighting on the server:

```tsx
export default function Alert({ type = 'info', children }) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      {children}
    </div>
  )
}
```
