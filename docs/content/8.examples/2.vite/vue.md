---
title: 'Vue Markdown Example with Vite'
description: 'A Vue and Vite app that renders a Markdown blog, component syntax examples, and a live editor with Comark.'
navigation:
  title: 'Vue'
  icon: i-simple-icons-vuedotjs
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/2.vite/vue
defaultValue: content/posts/comark-syntax.md
---
::

::browser{src="https://comark-vue.vercel.app/#/blog/comark-syntax"}
::

This example renders a Markdown blog, component syntax examples, and a live editor in Vue 3 with Vite. Wrap `<Markdown>` from `@comark/vue` in `<Suspense>` to parse and render Markdown asynchronously, or pass a pre-parsed document to `<MarkdownDocument>`.
