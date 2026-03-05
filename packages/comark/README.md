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

## Usage

### Vue

```bash
npm install @comark/vue @comark/math
# or
pnpm add @comark/vue @comark/math 
```

```vue
<script setup lang="ts">
import { Comark } from '@comark/vue'
import math from '@comark/math'
import { Math } from '@comark/math/vue'

const chatMessage = ...
</script>

<template>
  <Comark :components="{ Math }" :plugins="[math()]">{{ chatMessage }}</Comark>
</template>
```

### React

```bash
npm install @comark/react @comark/math
# or
pnpm add @comark/react @comark/math 
```

```tsx
import { Comark } from '@comark/react'
import math from '@comark/math'
import { Math } from '@comark/math/react'

function App() {
  const chatMessage = ...
  return <Comark components={{ Math }} plugins={[math()]}>{chatMessage}</Comark>
}
```

### HTML (No Framework)
```bash
npm install comark
# or
pnpm add comark 
```

```js
import { parse } from 'comark'
import { renderHTML } from 'comark/string'

const chatMessage = ...

const tree = await parse(chatMessage)
const html = renderHTML(tree)
```


## License

Made with ❤️

Published under [MIT License](./LICENSE).
