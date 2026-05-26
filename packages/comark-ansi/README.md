<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# @comark/ansi

[![npm version](https://img.shields.io/npm/v/@comark/ansi?color=black)](https://npmx.dev/@comark/ansi)
[![npm downloads](https://img.shields.io/npm/dm/@comark/ansi?color=black)](https://npm.chart.dev/@comark/ansi)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev/rendering/ansi)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

ANSI terminal renderer for [Comark](https://comark.dev). Render markdown as styled terminal output — perfect for CLIs, scripts, and developer tooling.

## Features

- 🎨 ANSI-styled output for the terminal
- 🌈 Respects `NO_COLOR` automatically
- 📐 Configurable terminal width for HR and code blocks
- 🎯 Map any Comark tag to a custom render function
- 🔌 Plugin ecosystem (math, mermaid, highlight, binding…)
- 🎯 Full TypeScript support

## Installation

```bash
npm install @comark/ansi
# or
pnpm add @comark/ansi
```

## Usage

```ts
import { render } from '@comark/ansi'

const output = await render(`
# Getting Started

This is a **bold** statement with a [link](https://example.com).

- Item 1
- Item 2
`)

process.stdout.write(output)
```

### Options

```ts
await render(content, {
  colors: true,   // emit ANSI escape codes (defaults to true, false when NO_COLOR is set)
  width: 80,      // terminal width for HR and code block headers
  plugins: [],
  components: {},
})
```

### Syntax highlighting

```ts
import { render } from '@comark/ansi'
import highlight from '@comark/ansi/plugins/highlight'

const output = await render('```ts\nconsole.log("hi")\n```', {
  plugins: [highlight()],
})
```

## Documentation

Full guide and API reference at [comark.dev/rendering/ansi](https://comark.dev/rendering/ansi).

## License

Made with ❤️

Published under [MIT License](https://github.com/comarkdown/comark/blob/main/LICENSE).
