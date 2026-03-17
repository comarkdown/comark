---
title: Hello World
description: Getting started with Comark and Nuxt UI.
pubDate: 2025-12-01
tags: [comark, nuxt]
---

Welcome to this blog powered by **Comark** and Nuxt UI!

Comark extends standard Markdown with component syntax, and it integrates seamlessly with Nuxt's server-first architecture.

::alert{type="info"}
This alert is rendered using a custom Comark component — no client-side JavaScript required.
::

## Why Comark + Nuxt UI?

- **Server-rendered** — Comark parses and renders on the server via `parse()` and `ComarkRenderer`
- **Static generation** — Full SSG with `nuxt generate` for zero-latency delivery
- **Component syntax** — Embed custom components directly in your Markdown
- **Nuxt UI** — Beautiful prose components out of the box

```ts
import { parse } from 'comark'

const tree = await parse(markdown)
// <ComarkRenderer :tree="tree" />
```

::alert{type="success"}
You get the best of both worlds: Nuxt's static generation for performance and Comark for rich rendering.
::
