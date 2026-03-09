---
title: Nuxt
description: A minimal example showing how to use Comark Syntax with Nuxt 4.
category: Frameworks
navigation.icon: i-simple-icons-nuxt
path: /examples/frameworks/nuxt
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/1.frameworks/nuxt
defaultValue: app/app.vue
---
::


This example demonstrates the simplest way to use Comark Syntax with Nuxt - just add the `comark/nuxt` module to your Nuxt config, and the `Comark` component will be automatically available in your templates. The module handles parsing and rendering automatically.

## What does `comark/nuxt` module do

- Registers the `<Comark>` components in Nuxt for automatic import.
- Registers the `~/components/prose` directory in the app and all layers as a global components directory.
  - This allows users to override prose components by creating components in this directory.
