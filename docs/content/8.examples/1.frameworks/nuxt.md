---
title: 'Nuxt UI Markdown Example with Comark'
description: 'A minimal Nuxt app that renders Comark component syntax with Nuxt UI components through the @comark/vue Nuxt module.'
navigation:
  title: 'Nuxt'
  icon:  i-simple-icons-nuxt
---

::code-explorer
---
org: comarkdown
repo: comark@afa4b18a806217d4b6a09696377435e77b582870
path: examples/1.frameworks/nuxt
defaultValue: content/posts/comark-syntax.md
---
::

::Browser{src="https://comark-nuxt.vercel.app/blog/comark-syntax"}
::

This example demonstrates how to use Comark Syntax with Nuxt UI. Comark Syntax automatically detects when Nuxt UI is installed and uses its components for rendering. Simply add both `@comark/vue` and `@nuxt/ui` modules to your Nuxt config, and the `Markdown` component will use Nuxt UI components automatically.

## What does the `@comark/vue` Nuxt module do

- Auto-imports the `<Markdown>` and `<MarkdownDocument>` components.
- Auto-imports the `defineMarkdownComponent()` and `defineMarkdownDocumentComponent()` helpers.
- Detects Nuxt UI and tells Nuxt UI to register its Prose components.
