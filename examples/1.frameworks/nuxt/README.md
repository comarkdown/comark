---
title: Nuxt UI
description: A minimal example showing how to use Comark Syntax with Nuxt UI.
category: Frameworks
navigation.icon: i-simple-icons-nuxt
path: /examples/frameworks/nuxt-ui
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/1.frameworks/nuxt-ui
defaultValue: app/app.vue
---
::

This example demonstrates how to use Comark Syntax with Nuxt UI. Comark Syntax automatically detects when Nuxt UI is installed and uses its components for rendering. Simply add both `comark/nuxt` and `@nuxt/ui` modules to your Nuxt config, and the `Comark` component will use Nuxt UI components automatically.

## What does `comark/nuxt` module do

- Registers the `<Comark>` component in Nuxt for automatic import.
- Registers the `~/components/prose` directory in the app and all layers as a global components directory.
  - This allows users to override prose components by creating components in this directory.
- Detects Nuxt UI and tells Nuxt UI to register its Prose components
