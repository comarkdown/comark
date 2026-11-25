---
name: comark
description: 'Comark (Components in Markdown) parser: syntax, AST, Vue/React/Svelte/Angular renderers, plugins, and LLM streaming with auto-close.'
---

# Comark skill guide

Markdown parser and renderer with Comark (Components in Markdown) syntax, built on [markdown-exit](https://github.com/serkodev/markdown-exit) (a TypeScript rewrite of markdown-it). Parses CommonMark and GitHub Flavored Markdown into a compact, serializable document at build time, at runtime, or during a stream.

## Overview

Comark extends Markdown with block and inline components, attributes, and plugins while parsing standard CommonMark and GitHub Flavored Markdown. Key features:

- Fast parsing on `markdown-exit` with markdown-it plugin compatibility
- Streaming support with incremental block reuse and auto-close for unfinished syntax
- Block (`::component`) and inline (`:component`) component syntax with props and slots
- Vue 3, React, Svelte 5, Angular 21+, HTML, and ANSI renderers
- YAML frontmatter extraction into `document.frontmatter`
- Plugins for Shiki syntax highlighting, KaTeX math, Mermaid diagrams, table of contents, bindings, and XSS sanitization
- Full TypeScript definitions

## Package information

- **Package name:** `comark`
- **Installation:** `npm install comark` or `pnpm add comark`
- **Exports:**
  - Main parser: `comark`
  - Vue 3 renderer and Nuxt module: `@comark/vue` (`modules: ['@comark/vue']`)
  - React renderer: `@comark/react`
  - Svelte 5 renderer: `@comark/svelte`
  - Angular 21+ renderer: `@comark/angular`
  - HTML string renderer: `@comark/html`
  - ANSI terminal renderer: `@comark/ansi`

## Quick start

### Basic usage

```typescript
import { parseMarkdown } from 'comark'

const content = `---
title: Hello World
---

# Hello World

This is **markdown** with :icon component.

::alert{type="info"}
Important message
::
`

const result = await parseMarkdown(content)
console.log(result.nodes)       // Markdown AST
console.log(result.frontmatter) // { title: 'Hello World' }
console.log(result.meta)    // Additional metadata
```

### Vue rendering

```vue
<template>
  <Markdown :value="content" />
</template>

<script setup lang="ts">
import { Markdown } from '@comark/vue'

const content = `# Hello World`
</script>
```

### React rendering

```tsx
import { Markdown } from '@comark/react'

export default function App() {
  return <Markdown value={content} />
}
```

### Svelte rendering

```svelte
<script lang="ts">
  import { Markdown } from '@comark/svelte'

  const content = `# Hello World`
</script>

<Markdown value={content} />
```

### Angular rendering

```typescript
import { Component } from '@angular/core'
import { Markdown } from '@comark/angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Markdown],
  template: `<comark-markdown [value]="content" />`,
})
export class AppComponent {
  content = `# Hello World`
}
```

## Documentation sections

Reference guides for each part of Comark:

### [1. Markdown syntax](./references/markdown-syntax.md)

Syntax reference for authoring Comark documents:

- **Standard Markdown:** headings, text formatting, lists, links, images, and blockquotes
- **Frontmatter:** leading YAML block parsed into `document.frontmatter`
- **Comark components:** block components (`::component`), inline components (`:component`), properties, slots, and nesting
- **Attributes:** custom attributes on native Markdown elements using `{...}` syntax
- **Code blocks:** language identifier, filename metadata, line highlighting, and custom meta
- **Task lists:** GFM checkboxes with `[x]` and `[ ]`
- **Tables:** GFM tables with column alignment and inline formatting

[Read the Markdown syntax guide](./references/markdown-syntax.md)

---

### [2. Parsing and document model](./references/parsing-ast.md)

Parsing Markdown and working with `MarkdownDocument`:

- **String parsing:** `parseMarkdown()` with `autoUnwrap`, `autoClose`, and `plugins`
- **Syntax highlighting:** `parseMarkdown()` with the `shiki` plugin
- **Document structure:** serializable `MarkdownDocument` with compact tuple nodes
- **Rendering documents:** convert to HTML (`renderHtmlFromDocument` in `@comark/html`) or Markdown (`renderMarkdown` in `comark/render`)
- **Auto-close:** completing unfinished syntax during streaming
- **Auto-unwrap:** stripping single-paragraph `<p>` wrappers inside containers

[Read the parsing and document model guide](./references/parsing-ast.md)

---

### [3. Vue rendering](./references/rendering-vue.md)

Rendering Comark in Vue 3 and Nuxt applications:

- **Basic usage:** `Markdown` component setup
- **Custom components:** mapping Vue components to Comark tags
- **Dynamic loading:** `componentsManifest` for lazy-loaded components
- **Slots:** named slots with `#slot-name` syntax
- **Streaming mode:** incremental rendering with reactive content
- **Prose components:** overriding native HTML elements
- **Error handling:** error capture via `onErrorCaptured`
- **Props access:** reading parsed props and `__node`

[Read the Vue rendering guide](./references/rendering-vue.md)

---

### [4. React rendering](./references/rendering-react.md)

Rendering Comark in React and Next.js applications:

- **Basic usage:** `Markdown` component setup
- **Custom components:** mapping React components to Comark tags
- **Dynamic loading:** `componentsManifest` for lazy-loaded components
- **Props conversion:** HTML attribute conversion (`class` to `className`, `style` object, typed `:prop`)
- **Streaming mode:** incremental rendering with reactive state
- **Prose components:** overriding native HTML elements
- **Custom props:** reading parsed props and `__node`
- **CSS class name:** wrapper classes and Tailwind CSS typography

[Read the React rendering guide](./references/rendering-react.md)

---

### [5. Svelte rendering](./references/rendering-svelte.md)

Rendering Comark in Svelte 5 and SvelteKit applications:

- **Basic usage:** `Markdown` component setup with `$state`
- **Custom components:** mapping Svelte components to Comark tags
- **Dynamic loading:** `componentsManifest` for lazy-loaded components
- **Props mapping:** HTML-aligned attribute conversion and typed `:prop` values
- **Streaming mode:** incremental rendering with reactive `$state`
- **Experimental async:** `MarkdownAsync` with `<svelte:boundary>`
- **Prose components:** `Prose` prefix for overriding native HTML elements

[Read the Svelte rendering guide](./references/rendering-svelte.md)

---

### [6. Angular rendering](./references/rendering-angular.md)

Rendering Comark in Angular 21+ applications:

- **Basic usage:** `Markdown` standalone component setup
- **Custom components:** mapping Angular components to Comark tags
- **Component resolution:** `Prose{PascalTag}`, `PascalTag`, `tag` lookup order
- **Content projection:** named slots via `<ng-content select="[slot=name]">`
- **Streaming mode:** incremental rendering with stream effects such as caret and fade
- **Data binding:** `:prop` and `{{ }}` resolution with the `data` input
- **Pre-configured components:** `defineMarkdownComponent` and `defineMarkdownDocumentComponent`
- **Plugins:** Math (KaTeX), Mermaid, and Binding with Angular component wrappers

[Read the Angular rendering guide](./references/rendering-angular.md)

---

### [7. Using with AI agents](./AGENTS.md)

Streaming LLM output with Comark:

- **Streaming from LLMs:** rendering incremental AI output as tokens arrive
- **Auto-close:** completing unfinished syntax from partial tokens
- **Stream effects:** showing a live caret or fading in new text during generation
- **Framework examples:** Vue, React, Svelte, and Angular streaming patterns
- **ANSI for CLIs:** rendering AI output in terminal agents

[Read the AI agents guide](./AGENTS.md)

---

## Key features

### Comark component syntax

Comark extends Markdown with custom block and inline components:

```markdown
<!-- Block Component -->
::alert{type="warning" .important}
This is a **warning** message with markdown support.
::

<!-- Inline Component -->
Check out this :icon-star{.text-yellow} component.

<!-- Component with Slots -->
::card
#header
## Title

#content
Main content

#footer
Footer
::
```

### Markdown document model

Compact tuple-based structure:

```typescript
interface MarkdownDocument {
  nodes: [
    ["h1", { "id": "hello" }, "Hello"],
    ["p", {}, "Text with ", ["strong", {}, "bold"], " word"],
    ["alert", { "type": "info" }, "Message"]
  ],
  frontmatter: {},
  meta: {}
}
```

## Common use cases

### 1. Static site generator

```typescript
import { parseMarkdown } from 'comark'
import { renderHtmlFromDocument } from '@comark/html'
import shiki from '@comark/html/plugins/shiki'

async function processMarkdownFile(filePath: string) {
  const content = await readFile(filePath, 'utf-8')

  const doc = await parseMarkdown(content, {
    plugins: [
      shiki({
        themes: { light: 'github-dark', dark: 'github-dark' },
      }),
    ],
  })

  return {
    html: await renderHtmlFromDocument(doc),
    frontmatter: doc.frontmatter,
    toc: doc.meta.toc
  }
}
```

### 2. Live Markdown editor

```tsx
import { useState } from 'react'
import { Markdown } from '@comark/react'

export default function Editor() {
  const [content, setContent] = useState('# Hello')

  return (
    <div className="split-editor">
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <Markdown value={content} />
    </div>
  )
}
```

### 3. Batch file processing

```typescript
import { readFile } from 'node:fs/promises'
import { createMarkdownParser } from 'comark'

const parse = createMarkdownParser()

async function processMultipleFiles(files: string[]) {
  const results = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, 'utf-8')
      return await parse(content)
    })
  )

  results.forEach((result, i) => {
    console.log(`File ${files[i]}:`)
    console.log(`  - ${result.nodes.length} nodes`)
  })
}
```

### 4. Documentation platform

```vue
<template>
  <article class="prose">
    <Markdown :value="markdownContent" :components="docComponents" />
  </article>
</template>

<script setup lang="ts">
import { Markdown } from '@comark/vue'
import { docComponents } from './components'
</script>
```

## API reference summary

### Core functions (`comark`)

```typescript
// Parse Markdown to a MarkdownDocument
parseMarkdown(source: string, options?: ParserOptions): Promise<MarkdownDocument>

// Create a reusable parser instance
createMarkdownParser(options?: ParserOptions): (source: string) => Promise<MarkdownDocument>

// Auto-close unfinished syntax
autoCloseMarkdown(source: string, options?: AutoCloseOptions): string
```

### HTML rendering functions (`@comark/html`)

```typescript
// Parse and render Markdown to an HTML string
renderHtml(markdown: string, options?: ParserOptions & RendererOptions): Promise<string>

// Render a pre-parsed document to HTML
renderHtmlFromDocument(document: MarkdownDocument, options?: RendererOptions): Promise<string>

// Create a reusable render function with a shared parser instance
createHtmlRenderer(options?: ParserOptions & RendererOptions): (markdown: string) => Promise<string>
```

### Vue components (`@comark/vue`)

```vue
<Markdown :value="markdownString" :components="customComponents" />
```

### React components (`@comark/react`)

```tsx
<Markdown value={markdownString} components={customComponents} />
```

### Svelte components (`@comark/svelte`)

```svelte
<Markdown value={markdownString} components={customComponents} />
```

### Angular components (`@comark/angular`)

```html
<comark-markdown [value]="markdownString" [components]="customComponents" />
```

## Performance notes

- **Serializable document model:** compact tuple-based nodes (`['tag', attrs, ...children]`)
- **Reusable parser instances:** `createMarkdownParser()` initializes plugins once across calls
- **Lazy component loading:** `componentsManifest` loads custom components on demand
- **Incremental streaming:** completed top-level blocks are reused while streaming

## TypeScript support

TypeScript definitions ship with `comark` and every renderer package:

```typescript
import type {
  MarkdownDocument,
  Node,
  ElementNode,
  ParserOptions,
} from 'comark'
```

## Architecture overview

```
Markdown input (string)
  -> autoCloseMarkdown (default: on)
  -> frontmatter extraction (YAML -> document.frontmatter)
  -> markdown-exit tokenization + plugins (components, attributes, task-list, alert, ...)
  -> token processor -> compact node tuples
  -> autoUnwrap + post plugins (for example shiki, toc, summary, security)
  -> MarkdownDocument { nodes, frontmatter, meta }
  -> renderer (@comark/vue, @comark/react, @comark/svelte, @comark/angular, @comark/html, @comark/ansi, comark/render)
```

## Resources

- **Documentation:** [comark.dev](https://comark.dev)
- **Repository:** [github.com/comarkdown/comark](https://github.com/comarkdown/comark)
- **Syntax specifications:** [`packages/comark/SPEC/`](https://github.com/comarkdown/comark/tree/main/packages/comark/SPEC)

## Reference guides

- [Markdown syntax](./references/markdown-syntax.md)
- [Parsing and document model](./references/parsing-ast.md)
- [Vue rendering](./references/rendering-vue.md)
- [React rendering](./references/rendering-react.md)
- [Svelte rendering](./references/rendering-svelte.md)
- [Angular rendering](./references/rendering-angular.md)
- [AI agents and LLM streaming](./AGENTS.md)
