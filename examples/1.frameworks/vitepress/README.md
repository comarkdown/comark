---
title: VitePress
description: Using Comark component syntax natively in VitePress via markdown-it-mdc.
icon: i-simple-icons-vitepress
category: Vite
---

::code-tree{defaultValue="demo.md" expandAll}

```mdc [demo.md]
# Comark Demo

::alert{type="info"}
This is an **info** alert rendered using a Vue component registered in the VitePress theme.
::

::alert{type="success"}
Comark's component syntax works natively alongside VitePress's own Markdown features.
::

## Mixed content

- **Bold**, *italic*, and `inline code`
- [Links](https://github.com/comarkdown/comark) work as expected
- Tables, code blocks, and all VitePress extensions are unaffected
```

```ts [.vitepress/config.ts]
import { defineConfig } from 'vitepress'
import comark from 'markdown-it-mdc'

export default defineConfig({
  title: 'Comark + VitePress',
  description: 'Using Comark component syntax inside VitePress.',
  markdown: {
    config(md) {
      md.use(comark)
    },
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Demo', link: '/demo' },
    ],
  },
})
```

```ts [.vitepress/theme/index.ts]
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Alert from '../../components/Alert.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Alert', Alert)
  },
} satisfies Theme
```

```vue [components/Alert.vue]
<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'info' | 'warning' | 'success' | 'danger'
}>(), {
  type: 'info',
})
</script>

<template>
  <div :class="['alert', `alert-${props.type}`]" role="alert">
    <slot />
  </div>
</template>

<style scoped>
.alert {
  margin: 16px 0;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid;
  font-size: 14px;
  line-height: 1.6;
}

.alert-info {
  background-color: var(--vp-custom-block-info-bg);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-custom-block-info-text);
}

.alert-success {
  background-color: var(--vp-custom-block-tip-bg);
  border-color: var(--vp-c-green-1);
  color: var(--vp-custom-block-tip-text);
}

.alert-warning {
  background-color: var(--vp-custom-block-warning-bg);
  border-color: var(--vp-c-yellow-1);
  color: var(--vp-custom-block-warning-text);
}

.alert-danger {
  background-color: var(--vp-custom-block-danger-bg);
  border-color: var(--vp-c-red-1);
  color: var(--vp-custom-block-danger-text);
}
</style>
```

```json [package.json]
{
  "name": "comark-vitepress",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  },
  "dependencies": {
    "comark": "workspace:*",
    "markdown-it-mdc": "^0.2.5",
    "vue": "^3.5.28"
  },
  "devDependencies": {
    "vitepress": "^1.6.3"
  }
}
```

```md [index.md]
---
layout: home
hero:
  name: Comark + VitePress
  text: Components in Markdown
  tagline: Use Comark's component syntax inside VitePress documentation sites.
  actions:
    - theme: brand
      text: View Demo
      link: /demo
features:
  - title: Component Syntax
    details: Write ::alert{type="info"} directly in your content and render it with Vue components.
  - title: Vue Renderer
    details: Comark's Vue renderer (comark/vue) integrates seamlessly with VitePress.
  - title: Server & Client
    details: Works with VitePress SSG — parsed at build time, hydrated on the client.
---
```

::

This example shows how to use Comark's `::` component syntax natively in VitePress — no wrapper component or custom renderer needed.

## How it works

- **`markdown-it-mdc` plugin** — Added to VitePress's markdown-it config via `markdown.config(md)`, this enables the `::component{props}` syntax at the markdown-it level.
- **Global component registration** — Vue components like `Alert` are registered globally in the VitePress theme via `enhanceApp`, so `::alert{type="info"}` resolves to the `<Alert>` component.
- **Native coexistence** — Comark syntax works alongside all VitePress Markdown features (code blocks, tables, custom containers, GitHub alerts, etc.) since both use markdown-it.
