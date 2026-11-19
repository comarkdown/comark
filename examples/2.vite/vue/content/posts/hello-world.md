---
title: Hello world
description: Getting started with Comark, Vue 3, and Vite.
pubDate: 2025-12-01
tags: [comark, vue]
---

Welcome to this blog built with **Comark**, Vue 3, and Vite.

Comark adds component and attribute syntax to Markdown and renders nodes into Vue VNodes with `@comark/vue`.

::Alert{type="info"}
This alert renders through a Vue component mapped in the `:components` prop.
::

## Why pair Comark with Vue

- **Async Suspense support**: `<Markdown>` parses asynchronously inside Vue's `<Suspense>` boundary, while `<MarkdownDocument>` renders pre-parsed trees synchronously.
- **Component syntax**: write `::Alert` blocks inside `.md` files and map them to Vue single-file components.
- **Nuxt UI Vite plugin**: `@nuxt/ui/vite` provides styled UI and prose components in standalone Vue apps.
- **Vite dev server**: bundles raw `.md` files with `import.meta.glob` and updates on save with HMR.

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/vue'

const tree = await parseMarkdown(markdown)
// <MarkdownDocument :value="tree" :components="{ Alert }" />
```

::Alert{type="success"}
Vue manages reactive state and routing while Comark parses Markdown and renders mapped components.
::
