<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# @comark/html

[![npm version](https://img.shields.io/npm/v/@comark/html?color=black)](https://npmx.dev/@comark/html)
[![npm downloads](https://img.shields.io/npm/dm/@comark/html?color=black)](https://npm.chart.dev/@comark/html)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev/rendering/html)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

Framework-free HTML renderer for [Comark](https://comark.dev). Use it for SSR, static site generation, RSS feeds, emails, or anywhere you just need an HTML string.

## Features

- 📦 No framework dependencies — pure HTML output
- 🎯 Map any Comark tag to a custom render function
- 🌊 Stream API for buffered/incremental rendering
- 🔌 Plugin ecosystem (math, mermaid, highlight, binding…)
- 🎯 Full TypeScript support

## Installation

```bash
npm install @comark/html
# or
pnpm add @comark/html
```

## Usage

```ts
import { render } from '@comark/html'

const html = await render(`
# Getting Started

This is a **bold** statement with a [link](https://example.com).

- Item 1
- Item 2
`)
```

```html
<h1 id="getting-started">Getting Started</h1>
<p>This is a <strong>bold</strong> statement with a <a href="https://example.com">link</a>.</p>
<ul>
<li>Item 1</li>
<li>Item 2</li>
</ul>
```

### Custom components

```ts
import { render } from '@comark/html'

const html = await render(`::alert{type="warning"}\nHeads up!\n::`, {
  components: {
    alert: async ([, attrs, ...children], { render }) =>
      `<div class="alert alert-${attrs.type}">${await render(children)}</div>`,
  },
})
```

### Plugins

```ts
import { render } from '@comark/html'
import highlight from '@comark/html/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

const html = await render(content, {
  plugins: [highlight({ themes: { light: githubLight, dark: githubDark } })],
})
```

## Documentation

Full guide and API reference at [comark.dev/rendering/html](https://comark.dev/rendering/html).

## License

Made with ❤️

Published under [MIT License](https://github.com/comarkdown/comark/blob/main/LICENSE).
