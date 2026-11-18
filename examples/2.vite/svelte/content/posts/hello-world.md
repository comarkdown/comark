---
title: Hello world
description: Getting started with Comark, Svelte 5, and Vite.
pubDate: 2025-12-01
tags: [comark, svelte]
---

Welcome to this blog built with **Comark**, Svelte 5, and Vite.

Comark adds component and attribute syntax to Markdown and renders nodes directly into Svelte 5 components.

::Alert{type="info"}
This alert renders through a Svelte component mapped in the `components` prop.
::

## Why pair Comark with Svelte

- **Native Svelte 5 components**: Comark renders into Svelte components, passing props and snippets directly without raw HTML injection.
- **Component syntax**: write `::Alert` blocks inside `.md` files and render them alongside standard Markdown.
- **Vite dev server**: bundles raw `.md` files with `import.meta.glob` and updates on save with HMR.

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/svelte'

const tree = await parseMarkdown(markdown)
// <MarkdownDocument value={tree} components={{ Alert }} />
```

::Alert{type="success"}
Svelte 5 runes manage reactive UI state while Comark parses Markdown and instantiates mapped components.
::
