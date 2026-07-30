---
title: Hello World
description: Getting started with Comark and Svelte + Vite.
pubDate: 2025-12-01
tags: [comark, svelte]
---

Welcome to this blog powered by **Comark** and Svelte + Vite!

Comark extends standard Markdown with component syntax, and it renders to real Svelte components.

::Alert{type="info"}
This alert is rendered using a custom Comark component mapped via the `components` prop.
::

## Why Comark + Svelte?

- **Real components** — Comark renders to Svelte components, so your custom components receive real props and children
- **Component syntax** — Embed custom components directly in your Markdown
- **Fast** — Powered by Vite for instant HMR and fast builds

```ts
import { parse } from '@comark/svelte/parse'
import { MarkdownParsed } from '@comark/svelte'

const tree = await parse(markdown)
// <MarkdownParsed value={tree} components={{ Alert }} />
```

::Alert{type="success"}
You get the best of both worlds: Svelte's reactivity for dynamic content and Comark for rich rendering.
::
