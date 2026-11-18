---
title: Hello world
description: Getting started with Comark and Next.js Server Components.
pubDate: 2025-12-01
tags: [comark, nextjs]
---

Welcome to this blog built with **Comark** and the Next.js App Router.

Comark adds component and attribute syntax to Markdown and renders through React Server Components at build time.

::alert{type="info"}
This alert renders on the server through a custom React component, without shipping parser code to the client.
::

## Why pair Comark with Next.js

- **Server-rendered**: `parseMarkdown()` and `MarkdownDocument` run inside Server Components.
- **Static export**: `generateStaticParams` pre-renders every post to static HTML at build time.
- **Component syntax**: write `::alert` and `::feature-card` blocks directly in `.md` files.

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/react'

const tree = await parseMarkdown(markdown)
// <MarkdownDocument value={tree} components={{ Alert }} />
```

::alert{type="success"}
Next.js handles routing and static export while Comark parses frontmatter, highlights code, and renders React components.
::
