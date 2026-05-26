<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# @comark/svelte

[![npm version](https://img.shields.io/npm/v/@comark/svelte?color=black)](https://npmx.dev/@comark/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@comark/svelte?color=black)](https://npm.chart.dev/@comark/svelte)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev/rendering/svelte)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

Svelte renderer for [Comark](https://comark.dev) — render markdown with custom Svelte components, streaming support, and SvelteKit SSR.

## Features

- 🧩 `<Comark>` component for one-shot markdown rendering
- 🎯 Map any Comark tag to a custom Svelte component
- 🌊 Streaming-friendly with auto-close and caret support
- 🖥️ SSR-safe, works in SvelteKit
- 🔌 Plugin ecosystem (math, mermaid, highlight, binding…)
- 🎯 Full TypeScript support

## Installation

```bash
npm install @comark/svelte
# or
pnpm add @comark/svelte
```

## Usage

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import math, { Math } from '@comark/svelte/plugins/math'

  const content = `# Hello\n\nThis is **Comark** in Svelte.`
</script>

<Comark markdown={content} components={{ math: Math }} plugins={[math()]} />
```

### Custom components

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import Alert from './Alert.svelte'
</script>

<Comark markdown={content} components={{ alert: Alert }} />
```

```mdc
::alert{type="warning"}
Heads up!
::
```

### Streaming

```svelte
<Comark markdown={content} streaming={isStreaming} caret />
```

## Documentation

Full guide and API reference at [comark.dev/rendering/svelte](https://comark.dev/rendering/svelte).

## License

Made with ❤️

Published under [MIT License](https://github.com/comarkdown/comark/blob/main/LICENSE).
