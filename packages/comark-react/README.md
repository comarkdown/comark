<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# @comark/react

[![npm version](https://img.shields.io/npm/v/@comark/react?color=black)](https://npmx.dev/@comark/react)
[![npm downloads](https://img.shields.io/npm/dm/@comark/react?color=black)](https://npm.chart.dev/@comark/react)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev/rendering/react)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

React renderer for [Comark](https://comark.dev) — render markdown with custom React components, streaming support, and Server Components.

## Features

- 🧩 `<Comark>` component for one-shot markdown rendering
- 🎯 Map any Comark tag to a custom React component
- 🌊 Streaming-friendly with auto-close and caret support
- 🖥️ Works with React Server Components and SSR
- 🔌 Plugin ecosystem (math, mermaid, highlight, binding…)
- 🎯 Full TypeScript support

## Installation

```bash
npm install @comark/react
# or
pnpm add @comark/react
```

## Usage

```tsx
import { Comark } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'

const content = `# Hello\n\nThis is **Comark** in React.`

export default function App() {
  return (
    <Comark components={{ math: Math }} plugins={[math()]}>
      {content}
    </Comark>
  )
}
```

### Custom components

```tsx
import { Comark } from '@comark/react'
import { Alert } from './components/Alert'

<Comark components={{ alert: Alert }}>{content}</Comark>
```

```mdc
::alert{type="warning"}
Heads up!
::
```

### Streaming

```tsx
<Comark streaming={isStreaming} caret>
  {content}
</Comark>
```

## Documentation

Full guide and API reference at [comark.dev/rendering/react](https://comark.dev/rendering/react).

## License

Made with ❤️

Published under [MIT License](https://github.com/comarkdown/comark/blob/main/LICENSE).
