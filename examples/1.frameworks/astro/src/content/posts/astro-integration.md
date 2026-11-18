---
title: Integrating Comark with Astro
description: How this blog pairs Astro content collections with Comark and React components.
pubDate: 2026-01-10
tags: [comark, astro, integration]
---

This example pairs Astro content collections with `parseMarkdown()` and `@comark/react`.

## How it works

Instead of Astro's default remark and rehype pipeline, each post route parses raw Markdown directly with Comark:

1. **Define collections**: load `.md` files with Astro's `glob()` loader and validate frontmatter with Zod.
2. **Read the raw body**: access the unparsed Markdown string on `post.body`.
3. **Parse with Comark**: call `parseMarkdown()` with `shiki()` to produce a `MarkdownDocument`.
4. **Render on the server**: pass the document to `MarkdownDocument` from `@comark/react` along with custom components.

```astro
---
import { getCollection } from 'astro:content'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/react'
import shiki from 'comark/plugins/shiki'
import Alert from '../../components/Alert'

const document = await parseMarkdown(post.body!, {
  plugins: [shiki()],
})
---

<MarkdownDocument value={document} components={{ Alert }} />
```

::alert{type="info"}
Astro runs `parseMarkdown()` and renders `MarkdownDocument` at build time, so no JavaScript is sent to the browser for post content.
::

## Custom components

Map custom React components through the `components` prop on `MarkdownDocument`. Each component receives resolved attributes as props and nested Markdown as `children`:

```tsx
export default function Alert({ type = 'info', children }: {
  type?: 'info' | 'warning' | 'success' | 'danger'
  children?: React.ReactNode
}) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      {children}
    </div>
  )
}
```
