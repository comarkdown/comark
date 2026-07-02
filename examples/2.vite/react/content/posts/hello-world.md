---
title: Hello World
description: Getting started with Comark and React + Vite.
pubDate: 2025-12-01
tags: [comark, react]
---

Welcome to this blog powered by **Comark** and React + Vite!

Comark extends standard Markdown with component syntax, and it renders to plain React elements — no `dangerouslySetInnerHTML`.

::Alert{type="info"}
This alert is rendered using a custom Comark component mapped via the `components` prop.
::

## Why Comark + React?

- **Real components** — Comark renders to React elements, so your custom components receive real props and children
- **Component syntax** — Embed custom components directly in your Markdown
- **Fast** — Powered by Vite for instant HMR and fast builds

```ts
import { parse } from '@comark/react/parse'
import { ComarkRenderer } from '@comark/react'

const tree = await parse(markdown)
// <ComarkRenderer tree={tree} components={{ Alert }} />
```

::Alert{type="success"}
You get the best of both worlds: React's component model for dynamic content and Comark for rich rendering.
::
