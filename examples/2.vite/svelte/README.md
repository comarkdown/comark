---
title: Svelte
description: A minimal example showing how to use Comark with Svelte and Vite.
navigation:
  icon:  i-simple-icons-svelte
category: Vite
path: /examples/vite/svelte
---

::CodeExplorer
---
org: comarkdown
repo: comark
path: examples/2.vite/svelte
defaultValue: src/App.svelte
---
::

::Browser{src="https://comark-svelte.vercel.app"}
::

This example demonstrates the simplest way to use Comark with Svelte - use the `Comark` component and pass it markdown content. The component handles parsing and rendering automatically using Svelte 5's `$state` and `$effect` runes.
