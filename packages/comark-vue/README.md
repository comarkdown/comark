<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# @comark/vue

[![npm version](https://img.shields.io/npm/v/@comark/vue?color=black)](https://npmx.dev/@comark/vue)
[![npm downloads](https://img.shields.io/npm/dm/@comark/vue?color=black)](https://npm.chart.dev/@comark/vue)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev/rendering/vue)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

Vue renderer for [Comark](https://comark.dev) — render markdown with custom Vue components, streaming support, and SSR.

## Features

- 🧩 `<Comark>` component for one-shot markdown rendering
- 🎯 Map any Comark tag to a custom Vue component
- 🌊 Streaming-friendly with auto-close and caret support
- 🖥️ SSR-safe, works in Nuxt and Vite
- 🎨 Optional Vite plugin for compile-time component resolution
- 🔌 Plugin ecosystem (math, mermaid, highlight, binding…)

## Installation

```bash
npm install @comark/vue
# or
pnpm add @comark/vue
```

## Usage

```vue
<script setup lang="ts">
import { Comark } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'

const content = `# Hello\n\nThis is **Comark** in Vue.`
</script>

<template>
  <Comark :components="{ math: Math }" :plugins="[math()]">
    {{ content }}
  </Comark>
</template>
```

### Custom components

```vue
<script setup lang="ts">
import { Comark } from '@comark/vue'
import Alert from './components/Alert.vue'
</script>

<template>
  <Comark :components="{ alert: Alert }">{{ content }}</Comark>
</template>
```

```mdc
::alert{type="warning"}
Heads up!
::
```

### Streaming

```vue
<Comark :streaming="isStreaming" caret>{{ content }}</Comark>
```

## Using with Vite

`@comark/vue` ships an optional Vite plugin that:

- Enables `<slot unwrap="...">` inside custom markdown components.
- Auto-registers every `.vue` file under `src/components/prose` (or `components/prose`) as a global component.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import comark from '@comark/vue/vite'

export default defineConfig({
  plugins: [vue(), comark()],
})
```

Pass `comark({ prose: false })` to opt out of the auto-registered prose components.

## Using with Nuxt

For Nuxt, use [`@comark/nuxt`](https://comark.dev/rendering/nuxt) which auto-imports the `<Comark>` component and wires up `~/components/prose` overrides.

## Documentation

Full guide and API reference at [comark.dev/rendering/vue](https://comark.dev/rendering/vue).

## License

Made with ❤️

Published under [MIT License](https://github.com/comarkdown/comark/blob/main/LICENSE).
