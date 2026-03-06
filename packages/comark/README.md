<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# comark

[![npm version](https://img.shields.io/npm/v/comark?color=black)](https://npmx.dev/comark)
[![npm downloads](https://img.shields.io/npm/dm/comark?color=black)](https://npm.chart.dev/comark)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

A high-performance markdown parser and renderer with Vue & React components support.

## Features

- 🚀 Fast markdown-exit based parser
- 📦 Stream API for buffered parsing
- 🔧 Comark component syntax support
- 🔒 Auto-close unclosed markdown syntax (perfect for streaming)
- 📝 Frontmatter parsing (YAML)
- 📑 Automatic table of contents generation
- 🎯 Full TypeScript support

## Installation

```bash
npm install comark
# or
pnpm add comark
```

## Usage

### Vue

```vue
<script setup lang="ts">
import { Comark } from 'comark/vue'
import cjk from '@comark/cjk'
import math from '@comark/math'
import { Math } from '@comark/math/vue'

const chatMessage = ...
</script>

<template>
  <Comark :components="{ Math }" :plugins="[cjk(), math()]">{{ chatMessage }}</Comark>
</template>
```

### React

```tsx
import { Comark } from 'comark/react'
import cjk from '@comark/cjk'
import math from '@comark/math'
import { Math } from '@comark/math/react'

function App() {
  const chatMessage = ...
  return <Comark components={{ Math }} plugins={[cjk(), math()]}>{chatMessage}</Comark>
}
```

## License

Made with ❤️

Published under [MIT License](./LICENSE).
