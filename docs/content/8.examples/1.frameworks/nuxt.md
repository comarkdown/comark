---
title: 'Nuxt UI Markdown Example with Comark'
description: 'Render Comark component syntax with Nuxt UI prose components through the @comark/vue Nuxt module.'
navigation:
  title: 'Nuxt'
  icon: i-simple-icons-nuxt
---

::code-explorer
---
org: comarkdown
repo: comark@afa4b18a806217d4b6a09696377435e77b582870
path: examples/1.frameworks/nuxt
defaultValue: content/posts/comark-syntax.md
---
::

::browser{src="https://comark-nuxt.vercel.app/blog/comark-syntax"}
::

This example renders Markdown blog posts in Nuxt with `@comark/vue` and Nuxt UI. When both `@comark/vue` and `@nuxt/ui` are listed in `modules` in `nuxt.config.ts`, `<Markdown>` and `<MarkdownDocument>` render standard Markdown elements with Nuxt UI prose components.

## How it works

- **Auto-imported components**: `@comark/vue/nuxt` registers `<Markdown>` and `<MarkdownDocument>` in your Nuxt app.
- **Auto-imported helpers**: `defineMarkdownComponent()`, `defineMarkdownDocumentComponent()`, `parseMarkdown()`, and `createMarkdownParser()` are available in app code and server routes.
- **Nuxt UI integration**: the module detects `@nuxt/ui` and enables its `Prose*` component set.
