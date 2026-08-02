---
name: comark
description: 'Comark (Components in Markdown) parser: syntax, AST, Vue/React/Svelte/Angular renderers, plugins, and LLM streaming with auto-close.'
---

# Comark - Skills Guide

A high-performance markdown parser with Comark (Components in Markdown) support, built on markdown-it, offering both string-based and streaming APIs.

## Overview

**Comark** extends standard markdown with a powerful component system while maintaining full compatibility with CommonMark and GitHub Flavored Markdown. It provides:

- 🚀 **High-performance parsing** with markdown-it engine
- 📦 **Streaming support** with buffered and incremental modes
- ⚡ **Real-time rendering** with auto-close for incomplete syntax
- 🔧 **Comark component syntax** for custom components
- 🎨 **Vue, React, Svelte & Angular renderers** with custom component mapping
- 📝 **YAML frontmatter** support
- 📑 **Automatic TOC generation**
- 🎯 **Full TypeScript support**
- 🌈 **Syntax highlighting** with Shiki integration

## Package Information

- **Package Name:** `comark`
- **Installation:** `npm install comark` or `pnpm add comark`
- **Exports:**
  - Main parser: `comark`
  - Vue components: `@comark/vue`
  - React components: `@comark/react`
  - Svelte components: `@comark/svelte`
  - Angular components: `@comark/angular`
  - HTML rendering: `@comark/html`
  - ANSI terminal rendering: `@comark/ansi`
  - Nuxt module: `@comark/nuxt`

## Quick Start

### Basic Usage

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

### Vue Rendering

```vue
<template>
  <Markdown :value="content" />
</template>

<script setup lang="ts">
import { Markdown } from '@comark/vue'

const content = `# Hello World`
</script>
```

### React Rendering

```tsx
import { Markdown } from '@comark/react'

export default function App() {
  return <Markdown value={content} />
}
```

### Svelte Rendering

```svelte
<script lang="ts">
  import { Markdown } from '@comark/svelte'

  const content = `# Hello World`
</script>

<Markdown value={content} />
```

### Angular Rendering

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

## Documentation Sections

This guide is organized into focused sections covering different aspects of the package:

### 📝 [1. Markdown Syntax](./references/markdown-syntax.md)

Learn how to write Comark documents with complete syntax reference:

- **Standard Markdown:** headings, text formatting, lists, links, images, blockquotes
- **Frontmatter:** YAML metadata with special fields (title, depth, searchDepth)
- **Comark Components:** block components (`::component`), inline components (`:component`), properties, slots, nesting
- **Attributes:** custom attributes on native markdown elements using `{...}` syntax
- **Code Blocks:** language specification, filename metadata, line highlighting, special characters
- **Task Lists:** GFM-style checkboxes with `[x]` and `[ ]` syntax
- **Tables:** GFM tables with alignment and inline markdown support

**[→ Read Full Markdown Syntax Guide](./references/markdown-syntax.md)**

---

### 🔧 [2. Parsing & Document Model](./references/parsing-ast.md)

Complete guide for parsing and working with `MarkdownDocument`:

- **String Parsing:** `parseMarkdown()` function with options (autoUnwrap, autoClose)
- **Async Parsing:** `parseMarkdown()` with Shiki syntax highlighting
- **Document Structure:** serializable `MarkdownDocument` with compact array-based nodes
- **Rendering Documents:** convert to HTML (`renderHtmlFromDocument` via `@comark/html`) or markdown (`renderMarkdown` via `comark/render`)
- **Auto-close:** automatic closing of unclosed syntax
- **Auto-unwrap:** remove unnecessary paragraph wrappers from container components

**[→ Read Full Parsing & Document Model Guide](./references/parsing-ast.md)**

---

### ⚛️ [3. Vue Rendering](./references/rendering-vue.md)

Comprehensive guide for rendering in Vue applications:

- **Basic Usage:** `Markdown` component setup
- **Custom Components:** mapping custom Vue components to Comark elements
- **Dynamic Loading:** `componentsManifest` for lazy-loaded components
- **Slots Support:** named slots with `#slot-name` syntax
- **Streaming Mode:** real-time rendering with reactive content
- **Prose Components:** pre-built styled components for standard elements
- **Error Handling:** built-in error capture for streaming scenarios
- **Props Access:** accessing `__node` and parsed properties

**[→ Read Full Vue Rendering Guide](./references/rendering-vue.md)**

---

### ⚛️ [4. React Rendering](./references/rendering-react.md)

Comprehensive guide for rendering in React applications:

- **Basic Usage:** `Markdown` component setup
- **Custom Components:** mapping custom React components to Comark elements
- **Dynamic Loading:** `componentsManifest` for lazy-loaded components
- **Props Conversion:** automatic HTML attribute conversion (`class` → `className`, etc.)
- **Streaming Mode:** real-time rendering with reactive content
- **Prose Components:** pre-built styled components for standard elements
- **Custom Props:** accessing parsed properties and `__node`
- **CSS Class Name:** custom wrapper classes and Tailwind CSS integration

**[→ Read Full React Rendering Guide](./references/rendering-react.md)**

---

### 🎡 [5. Svelte Rendering](./references/rendering-svelte.md)

Comprehensive guide for rendering in Svelte 5 applications:

- **Basic Usage:** `Markdown` component setup with `$state`
- **Custom Components:** mapping custom Svelte components to Comark elements
- **Dynamic Loading:** `componentsManifest` for lazy-loaded components
- **Props Mapping:** attribute-to-prop conversion (close to HTML semantics)
- **Streaming Mode:** real-time rendering with reactive `$state`
- **Experimental Async:** `MarkdownAsync` with `<svelte:boundary>`
- **Prose Components:** `Prose` prefix for overriding native HTML elements

**[→ Read Full Svelte Rendering Guide](./references/rendering-svelte.md)**

---

### 🅰️ [6. Angular Rendering](./references/rendering-angular.md)

Comprehensive guide for rendering in Angular 17+ applications:

- **Basic Usage:** `Markdown` standalone component setup
- **Custom Components:** mapping Angular components to Comark elements
- **Component Resolution:** `Prose{PascalTag}`, `tag`, `PascalTag` priority order
- **Content Projection:** named slots via `<ng-content select="[slot=name]">` 
- **Streaming Mode:** real-time rendering with caret indicator
- **Data Binding:** `:binding` resolution with ambient `data` input
- **Pre-configured Components:** `defineMarkdownComponent` and `defineMarkdownDocumentComponent`
- **Plugins:** Math (KaTeX), Mermaid, Binding with Angular component wrappers

**[→ Read Full Angular Rendering Guide](./references/rendering-angular.md)**

---

### 🤖 [7. Using with AI Agents](./AGENTS.md)

Guide for integrating Comark in AI agent and LLM streaming workflows:

- **Streaming from LLMs:** rendering incremental AI output in real time
- **Auto-Close:** handling incomplete syntax from partial LLM tokens
- **Caret Indicator:** showing a live cursor during generation
- **Framework Examples:** Vue, React, Svelte, Angular streaming patterns
- **ANSI for CLIs:** rendering AI output in terminal agents

**[→ Read Full Agents Guide](./AGENTS.md)**

---

## Key Features Deep Dive

### Comark Component Syntax

Comark extends markdown with custom components while preserving readability:

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

### Markdown Document Model

Lightweight array-based structure for efficient processing:

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

## Common Use Cases

### 1. Static Site Generator

```typescript
import { parseMarkdown } from 'comark'
import { renderHtmlFromDocument } from '@comark/html'
import highlight from '@comark/html/plugins/highlight'

async function processMarkdownFile(filePath: string) {
  const content = await readFile(filePath, 'utf-8')

  const doc = await parseMarkdown(content, {
    plugins: [
      highlight({
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

### 2. Real-time Markdown Editor

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

### 3. Batch File Processing

```typescript
import { readFile } from 'node:fs/promises'
import { parseMarkdown } from 'comark'

async function processMultipleFiles(files: string[]) {
  const results = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, 'utf-8')
      return await parseMarkdown(content)
    })
  )

  results.forEach((result, i) => {
    console.log(`File ${files[i]}:`)
    console.log(`  - ${result.nodes.length} nodes`)
  })
}
```

### 4. Documentation Platform

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

## API Reference Summary

### Core Functions (`comark`)

```typescript
// Asynchronous parsing
parseMarkdown(source: string, options?: ParserOptions): Promise<MarkdownDocument>

// Auto-close unclosed syntax
autoCloseMarkdown(source: string): string
```

### HTML Rendering Functions (`@comark/html`)

```typescript
// Render markdown to HTML string (parse + render in one step)
renderHtml(markdown: string, options?: ParserOptions & RendererOptions): Promise<string>

// Render a pre-parsed document to HTML
renderHtmlFromDocument(document: MarkdownDocument, options?: RendererOptions): Promise<string>

// Create a reusable render function with shared parser instance
createHtmlRenderer(options?: ParserOptions & RendererOptions): (markdown: string) => Promise<string>
```

### Vue Components (`@comark/vue`)

```vue
<Markdown :value="markdownString" :components="customComponents" />
```

### React Components (`@comark/react`)

```tsx
<Markdown value={markdownString} components={customComponents} />
```

### Svelte Components (`@comark/svelte`)

```svelte
<Markdown value={markdownString} components={customComponents} />
```

### Angular Components (`@comark/angular`)

```html
<comark-markdown [value]="markdownString" [components]="customComponents" />
```

## Performance Characteristics

- **Serializable document model** - compact array-based nodes
- **Lazy component loading** - only load what's needed
- **Shiki highlighter caching** - avoid re-initialization
- **Parallel processing** - batch parse multiple files efficiently

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  MarkdownDocument,
  Node,
  ParserOptions,
} from 'comark'
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Markdown Input (String)         │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Auto-close     │ (Optional)
        │  Unclosed       │
        │  Syntax         │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Parse          │
        │  Frontmatter    │ (YAML)
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  MarkdownIt     │
        │  + Plugins      │ (Comark, Tasks)
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Token          │
        │  Processing     │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Comark         │
        │  AST            │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Auto-unwrap    │ (Optional)
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Generate TOC   │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  MarkdownDocument     │
        │  (nodes + data  │
        │   + meta)       │
        └────────┬────────┘
                 │
     ┌───────────┬──────┴──────┬───────────┐
     ▼           ▼            ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│   Vue   │ │  React  │ │ Svelte  │ │ Angular │
│ Renderer│ │ Renderer│ │ Renderer│ │ Renderer│
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

## Contributing & Testing

See the [test specifications](../../packages/comark/SPEC/) for examples of all supported syntax features.

Run tests:
```bash
pnpm test
```

Run specific test:
```bash
pnpm test -- tests/parse.test.ts
```

## Resources

- **README:** [README.md](../../README.md) - Installation and quick start
- **Specifications:** [SPEC/](../../packages/comark/SPEC/) - Complete syntax test cases

---

## Summary

**Comark** is a comprehensive solution for parsing and rendering markdown with component support. It excels at:

1. **Extending Markdown** - Component syntax without breaking compatibility
2. **Streaming Support** - Real-time rendering with auto-close
3. **Serializable Documents** - Efficient `MarkdownDocument` model with compact nodes
4. **Framework Support** - First-class Vue, React, Svelte, and Angular integration
5. **Developer Experience** - Full TypeScript support and comprehensive documentation

**Choose Comark when you need:**
- Markdown with custom components
- Streaming/incremental parsing
- Real-time markdown editors
- AI-generated content rendering
- Documentation platforms
- Static site generation with custom components

---

**Next Steps:**
- 📝 [Learn Markdown Syntax](./references/markdown-syntax.md)
- 🔧 [Master Parsing & AST](./references/parsing-ast.md)
- ⚛️ [Explore Vue Rendering](./references/rendering-vue.md)
- ⚛️ [Explore React Rendering](./references/rendering-react.md)
- 🎡 [Explore Svelte Rendering](./references/rendering-svelte.md)
- 🅰️ [Explore Angular Rendering](./references/rendering-angular.md)
- 🤖 [Use with AI Agents](./AGENTS.md)
