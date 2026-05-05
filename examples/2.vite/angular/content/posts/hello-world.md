---
title: Hello World
description: Getting started with Comark and Angular + Vite.
pubDate: 2025-12-01
tags: [comark, angular]
---

Welcome to this blog powered by **Comark** and Angular + Vite!

Comark extends standard Markdown with component syntax, and it integrates seamlessly with Angular's standalone components.

::alert{type="info"}
This alert is rendered using a custom Comark component mapped via the `components` input.
::

## Why Comark + Angular?

- **Standalone** — Uses Angular 17+ standalone components — no NgModules needed
- **Component syntax** — Embed custom Angular components directly in your Markdown
- **Content projection** — Children are projected via `<ng-content />`
- **Fast** — Powered by Vite + Analog for instant HMR

```ts
import { parse } from 'comark'
import { ComarkRendererComponent } from '@comark/angular'

const tree = await parse(markdown)
// <comark-renderer [tree]="tree" [components]="components" />
```

::alert{type="success"}
You get the best of both worlds: Angular's change detection for dynamic content and Comark for rich rendering.
::
