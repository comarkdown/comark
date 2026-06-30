---
title: Vue
description: A minimal example showing how to use Comark with Vue and Vite.
navigation:
  icon:  i-simple-icons-vuedotjs
category: Vite
path: /examples/vite/vue
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/2.vite/vue
defaultValue: content/posts/comark-syntax.md
---
::

::Browser{src="https://comark-vue.vercel.app/#/blog/comark-syntax"}
::

This example demonstrates the simplest way to use Comark with Vue - use the `h()` render function with the `Comark` component and pass it markdown content. The component handles parsing and rendering automatically.
