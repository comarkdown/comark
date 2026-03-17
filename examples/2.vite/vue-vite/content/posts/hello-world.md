---
title: Hello World
description: Getting started with Comark and Vue + Vite.
pubDate: 2025-12-01
tags: [comark, vue]
---

Welcome to this blog powered by **Comark** and Vue + Vite!

Comark extends standard Markdown with component syntax, and it integrates seamlessly with Vue's reactivity system.

::Alert{type="info"}
This alert is rendered using a custom Comark component mapped via the `components` prop.
::

## Why Comark + Vue?

- **Reactive** — Comark parses asynchronously and integrates cleanly with Vue's `<Suspense>`
- **Component syntax** — Embed custom components directly in your Markdown
- **Nuxt UI** — Beautiful prose components out of the box via `@nuxt/ui/vite`
- **Fast** — Powered by Vite for instant HMR and fast builds

```ts
import { parse } from 'comark'
import { ComarkRenderer } from '@comark/vue'

const tree = await parse(markdown)
// <ComarkRenderer :tree="tree" :components="{ Alert }" />
```

::Alert{type="success"}
You get the best of both worlds: Vue's reactivity for dynamic content and Comark for rich rendering.
::
