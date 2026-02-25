---
title: Hello World
description: Getting started with Comark and Astro content collections.
pubDate: 2025-12-01
tags: [comark, astro]
---

Welcome to this blog powered by **Comark** and Astro content collections!

Comark extends standard Markdown with component syntax, and it integrates seamlessly with Astro's server-first architecture.

::alert{type="info"}
This alert is rendered using a custom Comark component — no client-side JavaScript required.
::

## Why Comark + Astro?

- **Server-rendered** — Comark parses and renders on the server via `parse()` and `renderHTML()`
- **Content collections** — Full frontmatter validation with Zod schemas
- **Component syntax** — Embed custom components directly in your Markdown

```ts
import { parse } from 'comark'
import { renderHTML } from 'comark/string'

const tree = await parse(markdown)
const html = renderHTML(tree, { components: { alert } })
```

::alert{type="success"}
You get the best of both worlds: Astro's content layer for structure and Comark for rendering.
::
