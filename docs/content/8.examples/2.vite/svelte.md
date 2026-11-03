---
title: 'Svelte Markdown Example with Vite'
description: 'A Svelte 5 and Vite app that renders a Markdown blog, a syntax showcase, and a live editor with Comark, a custom alert, and a lazy component.'
navigation:
  title: 'Svelte'
  icon:  i-simple-icons-svelte
---

::CodeExplorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/2.vite/svelte
defaultValue: src/App.svelte
---
::

::Browser{src="https://comark-svelte.vercel.app"}
::

This example shows the quickest way to use Comark with Svelte - use the `Markdown` component and pass it markdown content. The component handles parsing and rendering automatically using Svelte 5's `$state` and `$effect` runes.
