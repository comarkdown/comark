---
title: Hello world
description: Getting started with Comark and Astro content collections.
pubDate: 2025-12-01
tags: [comark, astro]
---

Welcome to this blog built with **Comark** and Astro content collections.

Comark adds component and attribute syntax to Markdown while rendering everything on the server during `astro build`.

::alert{type="info"}
This alert renders through a custom React component on the server, with no client-side bundle.
::

## Why pair Comark with Astro

- **Server-rendered**: `parseMarkdown()` and `MarkdownDocument` run at build time and emit static HTML.
- **Typed frontmatter**: Astro content collections validate post metadata with Zod schemas.
- **Component syntax**: write `::alert{type="info"}` blocks directly in `.md` files and render them with React components.

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/react'

const document = await parseMarkdown(markdown)
// <MarkdownDocument value={document} components={{ Alert }} />
```

::alert{type="success"}
Astro manages collection loading and routing while Comark parses Markdown and renders custom components.
::
