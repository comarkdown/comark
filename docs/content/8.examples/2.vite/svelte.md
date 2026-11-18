---
title: 'Svelte Markdown Example with Vite'
description: 'A Svelte 5 and Vite app that renders a Markdown blog, component syntax examples, and a live editor with Comark and a lazy component.'
navigation:
  title: 'Svelte'
  icon: i-simple-icons-svelte
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/2.vite/svelte
defaultValue: src/App.svelte
---
::

::browser{src="https://comark-svelte.vercel.app"}
::

This example renders a Markdown blog, component syntax examples, and a live editor in Svelte 5 with Vite. Pass a Markdown string to `<Markdown value={content}>` from `@comark/svelte` to parse and render reactively with `$state` and `$effect` runes, or pass a pre-parsed document to `<MarkdownDocument>`.
