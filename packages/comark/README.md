<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# comark

[![npm version](https://img.shields.io/npm/v/comark?color=black)](https://npmx.dev/comark)
[![npm downloads](https://img.shields.io/npm/dm/comark?color=black)](https://npm.chart.dev/comark)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

A high-performance markdown parser and renderer with Vue, React, Svelte, HTML and ANSI terminal.

## Features

- 🚀 Fast markdown-exit based parser
- 📦 Stream API for buffered parsing
- 🔧 Comark component syntax support
- 🔒 Auto-close unclosed markdown syntax (perfect for streaming)
- 📝 Frontmatter parsing (YAML)
- 📑 Automatic table of contents generation
- 🎯 Full TypeScript support

## Usage

### Vue

```bash
npm install @comark/vue katex
# or
pnpm add @comark/vue katex
```

```vue
<script setup lang="ts">
import { Comark } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'

const chatMessage = ...
</script>

<template>
  <Comark :components="{ Math }" :plugins="[math()]">{{ chatMessage }}</Comark>
</template>
```

### React

```bash
npm install @comark/react katex
# or
pnpm add @comark/react katex
```

```tsx
import { Comark } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'

function App() {
  const chatMessage = ...
  return <Comark components={{ Math }} plugins={[math()]}>{chatMessage}</Comark>
}
```

### Svelte

```bash
npm install @comark/svelte katex
# or
pnpm add @comark/svelte katex
```

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import math, { Math } from '@comark/svelte/plugins/math'

  const chatMessage = ...
</script>

<Comark markdown={chatMessage} components={{ math: Math }} plugins={[math()]} />
```

### HTML (No Framework)

```bash
npm install @comark/html
# or
pnpm add @comark/html
```

```js
import { render } from '@comark/html'

const chatMessage = ...

const html = await render(chatMessage)
```


## Agent skill

Coding agents can install the Comark skill from the docs site:

```bash
npx skills add https://comark.dev
```

See [Installation](https://comark.dev/getting-started/installation) on comark.dev for details.

## License

Made with ❤️

Published under [MIT License](./LICENSE).
