---
title: Hello world
description: Getting started with Comark and Nuxt UI.
pubDate: 2025-12-01
tags: [comark, nuxt]
---

Welcome to this blog built with **Comark** and Nuxt UI.

Comark parses Markdown and custom `::` components in Nitro server routes and renders them on the server with `@comark/vue`.

::alert{type="info"}
This alert renders through `app/components/Alert.vue` on the server without extra component registration.
::

## Why pair Comark with Nuxt UI

- **Server-rendered**: Nitro routes call `parseMarkdown()`, and `MarkdownDocument` renders the parsed tree during SSR.
- **Static generation**: `nuxt generate` pre-renders every post route at build time.
- **Component syntax**: write `::alert` blocks directly in `.md` files and resolve them against `app/components/`.
- **Nuxt UI prose**: `@comark/vue` enables Nuxt UI's `Prose*` components for headings, paragraphs, code blocks, and lists.

```ts
import { parseMarkdown } from 'comark'

const tree = await parseMarkdown(markdown)
// <MarkdownDocument :value="tree" />
```

::alert{type="success"}
Nuxt handles routing, data fetching, and static generation while Comark parses Markdown and maps elements to Nuxt UI components.
::
