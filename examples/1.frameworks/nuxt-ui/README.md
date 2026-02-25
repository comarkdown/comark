---
title: Nuxt UI
description: A minimal example showing how to use Comark Syntax with Nuxt UI.
category: Frameworks
navigation.icon: i-simple-icons-nuxt
---

::code-tree{defaultValue="app/app.vue" expandAll}

```vue [app/app.vue]
<script setup lang="ts">
const markdown = `
# Comark + Nuxt UI

Comark Syntax automatically detects Nuxt UI and uses its components for rendering.

::callout{icon="i-lucide-square-play" color="neutral" to="/docs/getting-started/installation/nuxt"}
This is a `callout` with full **markdown** support.
::
`
</script>
<template>
  <Comark>{{ markdown }}</Comark>
</template>
```

```ts [nuxt.config.ts]
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['comark/nuxt', '@nuxt/ui'],
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true }
})
```

```css [app/assets/css/main.css]
@import "tailwindcss";
@import "@nuxt/ui";
```

```json [package.json]
{
  "name": "comark-nuxt-ui",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "@nuxt/ui": "^4.4.0",
    "comark": "^1.0.0",
    "nuxt": "^4.3.1",
    "tailwindcss": "^4.1.18"
  }
}
```

```json [tsconfig.json]
{
  // https://nuxt.com/docs/guide/concepts/typescript
  "files": [],
  "references": [
    {
      "path": "./.nuxt/tsconfig.app.json"
    },
    {
      "path": "./.nuxt/tsconfig.server.json"
    },
    {
      "path": "./.nuxt/tsconfig.shared.json"
    },
    {
      "path": "./.nuxt/tsconfig.node.json"
    }
  ]
}
```

::


This example demonstrates how to use Comark Syntax with Nuxt UI. Comark Syntax automatically detects when Nuxt UI is installed and uses its components for rendering. Simply add both `comark/nuxt` and `@nuxt/ui` modules to your Nuxt config, and the `Comark` component will use Nuxt UI components automatically.

## What does `comark/nuxt` module do

- Registers the `<Comark>` component in Nuxt for automatic import.
- Registers the `~/components/prose` directory in the app and all layers as a global components directory.
  - This allows users to override prose components by creating components in this directory.
- Detects Nuxt UI and tells Nuxt UI to register its Prose components
