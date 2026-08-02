---
title: Integrating Comark with Astro
description: How the Comark + Astro integration works under the hood.
pubDate: 2026-01-10
tags: [comark, astro, integration]
---

This example uses Astro's content collections with Comark as the Markdown renderer.

## How it works

Instead of using Astro's built-in remark/rehype pipeline, we use Comark's framework-agnostic API:

1. **Define collections** — Use `glob()` loader to load `.md` files with Zod-validated frontmatter
2. **Get the body** — Access the raw Markdown via `entry.body`
3. **Parse with Comark** — Call `parseMarkdown()` to build the AST
4. **Render to HTML** — Call `renderHtmlFromDocument()` with custom component renderers

```ts
import { parseMarkdown } from 'comark'
import { renderHtmlFromDocument } from '@comark/html'

const doc = await parseMarkdown(entry.body)
const html = await renderHtmlFromDocument(doc, {
  components: {
    alert: async ([tag, attrs, ...children], { render }) => {
      return `<div class="alert">${await render(children)}</div>`
    },
  },
})
```

::alert{type="info"}
Since Astro components run on the server, Comark's `parseMarkdown()` and `renderHtmlFromDocument()` are called at build time — zero JavaScript is sent to the client.
::

## Custom components

You can register any number of custom components. Each one receives the Comark AST element and a `render` helper to process children:

```ts
const badge: ComponentRenderFn = async ([tag, attrs, ...children], { render }) => {
  const color = attrs.color || 'blue'
  return `<span class="badge badge-${color}">${await render(children)}</span>`
}
```

This makes it easy to extend your Markdown with reusable, styled components.
