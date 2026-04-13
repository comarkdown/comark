---
name: comark
description: >-
  Comark (Components in Markdown) parser — syntax, AST, Vue/React/Svelte renderers, plugins, and LLM streaming with auto-close.
---

# Comark - Skills Guide

A high-performance markdown parser with Comark (Components in Markdown) support, built on markdown-it, offering both string-based and streaming APIs.

## Overview

**Comark** extends standard markdown with a powerful component system while maintaining full compatibility with CommonMark and GitHub Flavored Markdown. It provides:

- 🚀 **High-performance parsing** with markdown-it engine
- 📦 **Streaming support** with buffered and incremental modes
- ⚡ **Real-time rendering** with auto-close for incomplete syntax
- 🔧 **Comark component syntax** for custom components
- 🎨 **Vue, React & Svelte renderers** with custom component mapping
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
  - HTML rendering: `@comark/html`
  - ANSI terminal rendering: `@comark/ansi`
  - Nuxt module: `@comark/nuxt`

## Quick Start

### Basic Usage

```typescript
import { parse } from 'comark'

const content = `---
title: Hello World
---

# Hello World

This is **markdown** with :icon component.

::alert{type="info"}
Important message
::
`

const result = await parse(content)
console.log(result.nodes)       // Comark AST
console.log(result.frontmatter) // { title: 'Hello World' }
console.log(result.meta)    // Additional metadata
```

### Vue Rendering

```vue
<template>
  <Comark :markdown="content" />
</template>

<script setup lang="ts">
import { Comark } from '@comark/vue'

const content = `# Hello World`
</script>
```

### React Rendering

```tsx
import { Comark } from '@comark/react'

export default function App() {
  return <Comark markdown={content} />
}
```

### Svelte Rendering

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'

  const content = `# Hello World`
</script>

<Comark markdown={content} />
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

### 🔧 [2. Parsing & AST Generation](./references/parsing-ast.md)

Complete guide for parsing documents and working with AST:

- **String Parsing:** `parse()` function with options (autoUnwrap, autoClose)
- **Async Parsing:** `parse()` with Shiki syntax highlighting
- **AST Structure:** Comark AST format - lightweight array-based AST
- **Rendering AST:** convert to HTML (`renderHTML` via `@comark/html`) or markdown (`renderMarkdown` via `comark/render`)
- **Auto-close:** automatic closing of unclosed syntax
- **Auto-unwrap:** remove unnecessary paragraph wrappers from container components

**[→ Read Full Parsing & AST Guide](./references/parsing-ast.md)**

---

### ⚛️ [3. Vue Rendering](./references/rendering-vue.md)

Comprehensive guide for rendering in Vue applications:

- **Basic Usage:** `Comark` component setup
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

- **Basic Usage:** `Comark` component setup
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

- **Basic Usage:** `Comark` component setup with `$state`
- **Custom Components:** mapping custom Svelte components to Comark elements
- **Dynamic Loading:** `componentsManifest` for lazy-loaded components
- **Props Mapping:** attribute-to-prop conversion (close to HTML semantics)
- **Streaming Mode:** real-time rendering with reactive `$state`
- **Experimental Async:** `ComarkAsync` with `<svelte:boundary>`
- **Prose Components:** `Prose` prefix for overriding native HTML elements

**[→ Read Full Svelte Rendering Guide](./references/rendering-svelte.md)**

---

### 🤖 [6. Using with AI Agents](./AGENTS.md)

Guide for integrating Comark in AI agent and LLM streaming workflows:

- **Streaming from LLMs:** rendering incremental AI output in real time
- **Auto-Close:** handling incomplete syntax from partial LLM tokens
- **Caret Indicator:** showing a live cursor during generation
- **Framework Examples:** Vue, React, Svelte streaming patterns
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

### Comark AST Format

Lightweight array-based structure for efficient processing:

```typescript
interface ComarkTree {
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
import { parse } from 'comark'
import { renderHTML } from '@comark/html'
import highlight from '@comark/html/plugins/highlight'

async function processMarkdownFile(filePath: string) {
  const content = await readFile(filePath, 'utf-8')

  const tree = await parse(content, {
    plugins: [
      highlight({
        themes: { light: 'github-dark', dark: 'github-dark' },
      }),
    ],
  })

  return {
    html: renderHTML(tree),
    frontmatter: tree.frontmatter,
    toc: tree.meta.toc
  }
}
```

### 2. Real-time Markdown Editor

```tsx
import { useState } from 'react'
import { Comark } from '@comark/react'

export default function Editor() {
  const [content, setContent] = useState('# Hello')

  return (
    <div className="split-editor">
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <Comark markdown={content} />
    </div>
  )
}
```

### 3. Batch File Processing

```typescript
import { readFile } from 'node:fs/promises'
import { parse } from 'comark'

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

### 4. Documentation Platform

```vue
<template>
  <article class="prose">
    <Comark :markdown="markdownContent" :components="docComponents" />
  </article>
</template>

<script setup lang="ts">
import { Comark } from '@comark/vue'
import { docComponents } from './components'
</script>
```

## API Reference Summary

### Core Functions (`comark`)

```typescript
// Asynchronous parsing
parse(source: string, options?: ParseOptions): Promise<ComarkTree>

// Auto-close unclosed syntax
autoCloseMarkdown(source: string): string
```

### HTML Rendering Functions (`@comark/html`)

```typescript
// Render markdown to HTML string (parse + render in one step)
render(markdown: string, options?: RenderOptions): Promise<string>

// Render a pre-parsed tree to HTML
renderHTML(tree: ComarkTree, options?: RenderOptions): Promise<string>

// Create a reusable render function with shared parser instance
createRender(options?: ParseOptions & RenderOptions): (markdown: string) => Promise<string>
```

### Vue Components (`@comark/vue`)

```vue
<Comark :markdown="markdownString" :components="customComponents" />
```

### React Components (`@comark/react`)

```tsx
<Comark markdown={markdownString} components={customComponents} />
```

### Svelte Components (`@comark/svelte`)

```svelte
<Comark markdown={markdownString} components={customComponents} />
```

## Performance Characteristics

- **Comark AST format** - lightweight array-based AST
- **Lazy component loading** - only load what's needed
- **Shiki highlighter caching** - avoid re-initialization
- **Parallel processing** - batch parse multiple files efficiently

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  ComarkTree,
  ComarkNode,
  ParseOptions,
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
        │  ComarkTree     │
        │  (nodes + data  │
        │   + meta)       │
        └────────┬────────┘
                 │
     ┌───────────┬───────────┴───────────┐
     ▼           ▼                       ▼
┌─────────┐ ┌─────────┐           ┌─────────┐
│   Vue   │ │  React  │           │ Svelte  │
│ Renderer│ │ Renderer│           │ Renderer│
└─────────┘ └─────────┘           └─────────┘
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
3. **Lightweight AST** - Efficient Comark AST format
4. **Framework Support** - First-class Vue, React, and Svelte integration
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
- 🤖 [Use with AI Agents](./AGENTS.md)
