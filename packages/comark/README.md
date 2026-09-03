<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# comark

[![npm version](https://img.shields.io/npm/v/comark?color=black)](https://npmx.dev/comark)
[![npm downloads](https://img.shields.io/npm/dm/comark?color=black)](https://npm.chart.dev/comark)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![CodSpeed](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://app.codspeed.io/comarkdown/comark?utm_source=badge)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

Parse and render Markdown anywhere with one JavaScript library for HTML, ANSI, Vue, React, Svelte and Angular, plus plugins and streaming.

Comark supports CommonMark and GFM, then parses them into a compact, serializable document at build time, runtime, or during a stream. Use the same document across renderers, or extend the syntax with readable components and attributes when you need richer content.

```mdc
# Regular Markdown

With a custom component:

::alert{type="warning"}
This is **Markdown** inside your own component.
::
```

## Why Comark

- **Runtime parsing**: `parseMarkdown(markdown)` is a pure function returning a compact, serializable Markdown document. Content from a database, CMS, or LLM is live the moment it is saved. No rebuild, no redeploy. ([Comark vs MDX](https://comark.dev/compare/comark-vs-mdx))
- **Streaming built in**: auto-close completes unterminated syntax (`**bold`, open code fences, half-open components) so AI output renders correctly at every frame.
- **One parser, every renderer**: the same source renders to HTML, ANSI, Vue, React, Svelte, and Angular. Your content outlasts your framework.
- **Still just Markdown**: full CommonMark + GFM, frontmatter, and `{.class}` attributes on native elements. Components are opt-in syntax, not a new language.
- **Plugin ecosystem**: Shiki highlighting, KaTeX math, Mermaid diagrams, TOC, alerts, footnotes and more, plus compatibility with existing markdown-it plugins.
- **Decoupled parse & render**: parse once on the server, send the serializable document (`['tag', props, ...children]`) to the client, render without re-parsing.
- **Fast**: built on [markdown-exit](https://github.com/serkodev/markdown-exit), a TypeScript rewrite of markdown-it, with full TypeScript support.

The component and attribute syntax builds on five years of production use in [MDC](https://github.com/nuxt-content/mdc). Read [Why Comark](https://comark.dev/kb/why-comark) for the full story.

## Quick Start

```bash
npm install comark
```

```ts
import { parseMarkdown } from 'comark'

const tree = await parseMarkdown('# Hello **World**')
// { nodes: [['h1', { id: 'hello' }, 'Hello ', ['strong', {}, 'World']]], frontmatter: {}, meta: {} }
```

Then pick a renderer:

### Vue

```bash
npm install @comark/vue katex
```

```vue
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'

const chatMessage = ...
</script>

<template>
  <Markdown :components="{ Math }" :plugins="[math()]">{{ chatMessage }}</Markdown>
</template>
```

### React

```bash
npm install @comark/react katex
```

```tsx
import { Markdown } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'

function App() {
  const chatMessage = ...
  return <Markdown components={{ Math }} plugins={[math()]}>{chatMessage}</Markdown>
}
```

### Svelte

```bash
npm install @comark/svelte katex
```

```svelte
<script lang="ts">
  import { Markdown } from '@comark/svelte'
  import math, { Math } from '@comark/svelte/plugins/math'

  const chatMessage = ...
</script>

<Markdown value={chatMessage} components={{ math: Math }} plugins={[math()]} />
```

### Angular

```bash
npm install @comark/angular katex
```

```typescript
import { Component } from '@angular/core'
import { Markdown } from '@comark/angular'
import math, { Math } from '@comark/angular/plugins/math'

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [Markdown],
  template: `<comark-markdown [value]="chatMessage" [components]="{ Math }" [plugins]="[math()]" />`,
})
export class ChatComponent {
  chatMessage = ...
}
```

### HTML (No Framework)

```bash
npm install @comark/html
```

```js
import { renderHtml } from '@comark/html'

const chatMessage = ...

const html = await renderHtml(chatMessage)
```

## Packages

| Package | Description |
|---|---|
| [`comark`](https://comark.dev/api/parse) | Core parser, AST utilities, plugins |
| [`@comark/vue`](https://comark.dev/rendering/vue) | Vue 3 renderer |
| [`@comark/react`](https://comark.dev/rendering/react) | React renderer (Next.js, Server Components) |
| [`@comark/svelte`](https://comark.dev/rendering/svelte) | Svelte 5 renderer |
| [`@comark/angular`](https://comark.dev/rendering/angular) | Angular renderer |
| [`@comark/nuxt`](https://comark.dev/rendering/nuxt) | Nuxt module with auto-imports |
| [`@comark/html`](https://comark.dev/rendering/html) | HTML string renderer |
| [`@comark/ansi`](https://comark.dev/rendering/ansi) | ANSI terminal renderer |

## Agent skill

Coding agents can install the Comark skill from the docs site:

```bash
npx skills add https://comark.dev
```

See [Installation](https://comark.dev/getting-started/installation) on comark.dev for details.

## License

Made with ❤️

Published under [MIT License](https://github.com/comarkdown/comark/blob/main/LICENSE).
