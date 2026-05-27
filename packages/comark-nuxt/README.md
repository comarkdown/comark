<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# @comark/nuxt

[![npm version](https://img.shields.io/npm/v/@comark/nuxt?color=black)](https://npmx.dev/@comark/nuxt)
[![npm downloads](https://img.shields.io/npm/dm/@comark/nuxt?color=black)](https://npm.chart.dev/@comark/nuxt)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev/rendering/nuxt)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

Zero-config Nuxt module for [Comark](https://comark.dev) — a high-performance markdown parser and renderer.

## Features

- ⚡ Auto-imported `<Comark>` and `<ComarkRenderer>` components
- 📁 `~/components/prose` directory for overriding HTML elements
- 🎨 Automatic [Nuxt UI](https://ui.nuxt.com) prose integration
- 🖥️ SSR, SSG, and prerendering support out of the box
- 🧩 Re-exports of Comark plugins (binding, math, mermaid)
- 🎯 Full TypeScript support

## Installation

### Automatic

Add `@comark/nuxt` to your project — this installs the dependency and registers the module in `nuxt.config.ts`:

```bash
npx nuxt add comark
```

### Manual

Add `@comark/nuxt` to your dependencies:

```bash
npm install @comark/nuxt
# or
pnpm add @comark/nuxt
```

Then add it to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@comark/nuxt'],
})
```

## Usage

The `<Comark>` component is available globally — no imports needed. Pass markdown via the default slot or the `markdown` prop:

```vue
<script setup lang="ts">
const content = `# Hello Nuxt\n\nRendered with **Comark**.`
</script>

<template>
  <Comark>{{ content }}</Comark>
</template>
```

### Custom components

Map Comark tags to your own Vue components:

```vue
<script setup lang="ts">
import Alert from '~/components/Alert.vue'
</script>

<template>
  <Comark :components="{ alert: Alert }">{{ content }}</Comark>
</template>
```

```mdc
::alert{type="warning"}
This is a warning.
::
```

### Overriding HTML elements

Drop components into `~/components/prose` to override how native HTML elements render. They are auto-registered:

```
~/components/prose/
  ProseH1.vue
  ProsePre.vue
  ProseA.vue
```

### Plugins

```vue
<script setup lang="ts">
import math, { Math } from '@comark/nuxt/plugins/math'
import mermaid, { Mermaid } from '@comark/nuxt/plugins/mermaid'
</script>

<template>
  <Comark
    :components="{ math: Math, mermaid: Mermaid }"
    :plugins="[math(), mermaid()]"
  >
    {{ content }}
  </Comark>
</template>
```

### Nuxt UI

When [`@nuxt/ui`](https://ui.nuxt.com) is installed, prose components are wired up automatically:

```ts
export default defineNuxtConfig({
  modules: ['@comark/nuxt', '@nuxt/ui'],
})
```

## Documentation

Full guide and API reference at [comark.dev/rendering/nuxt](https://comark.dev/rendering/nuxt).

## Agent skill

Coding agents can install the Comark skill from the docs site:

```bash
npx skills add https://comark.dev
```

## License

Made with ❤️

Published under [MIT License](https://github.com/comarkdown/comark/blob/main/LICENSE).
