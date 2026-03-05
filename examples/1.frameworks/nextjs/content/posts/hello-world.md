---
title: Hello World
description: Getting started with Comark and Next.js.
pubDate: 2025-12-01
tags: [comark, nextjs]
---

Welcome to this blog powered by **Comark** and Next.js!

Comark extends standard Markdown with component syntax, and it integrates seamlessly with Next.js's server-first architecture.

::alert{type="info"}
This alert is rendered using a custom Comark component — no client-side JavaScript required.
::

## Why Comark + Next.js?

- **Server-rendered** — Comark parses and renders on the server via `parse()` and `ComarkRenderer`
- **Static generation** — Full SSG with `generateStaticParams` for zero-latency delivery
- **Component syntax** — Embed custom components directly in your Markdown

```ts
import { parse } from 'comark'
import { ComarkRenderer } from 'comark/react/components/ComarkRenderer'

const tree = await parse(markdown)
// <ComarkRenderer tree={tree} components={{ Alert }} />
```

::alert{type="success"}
You get the best of both worlds: Next.js's static generation for performance and Comark for rich rendering.
::
