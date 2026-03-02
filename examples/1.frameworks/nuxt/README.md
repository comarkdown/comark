---
title: Nuxt
description: A minimal example showing how to use Comark Syntax with Nuxt 4.
category: Frameworks
navigation.icon: i-simple-icons-nuxt
path: /examples/frameworks/nuxt
---

::code-tree{defaultValue="app/app.vue" expandAll}

```vue [app/app.vue]
<script setup lang="ts">
const markdown = `
# Comark + Nuxt

Comark automatically detects Components in \`~/components/prose/\` directory and uses them for rendering.
`
</script>

<template>
  <Comark>{{ markdown }}</Comark>
</template>
```

```vue [app/components/ProseP.vue]
<template>
  <p>
    <slot />
  </p>
</template>

<style scoped>
p {
  color: #333;
  line-height: 1.5;
}
p::first-letter {
  text-transform: capitalize;
  font-size: 20px;
  color: red;
  font-family: 'Monoton', sans-serif;
  vertical-align: middle;
}
</style>
```

```ts [nuxt.config.ts]
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['comark/nuxt'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
```

```json [package.json]
{
  "name": "comark-nuxt",
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
    "nuxt": "^4.3.1",
    "vue": "^3.5.28",
    "comark": "^1.0.0"
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


This example demonstrates the simplest way to use Comark Syntax with Nuxt - just add the `comark/nuxt` module to your Nuxt config, and the `Comark` component will be automatically available in your templates. The module handles parsing and rendering automatically.

## What does `comark/nuxt` module do

- Registers the `<Comark>` components in Nuxt for automatic import.
- Registers the `~/components/prose` directory in the app and all layers as a global components directory.
  - This allows users to override prose components by creating components in this directory.
