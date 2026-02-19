# Comark - Skills Guide

A high-performance markdown parser with Comark (Components in Markdown) support, built on markdown-it, offering both string-based and streaming APIs.

## Overview

**Comark** extends standard markdown with a powerful component system while maintaining full compatibility with CommonMark and GitHub Flavored Markdown. It provides:

- 🚀 **High-performance parsing** with markdown-it engine
- 📦 **Streaming support** with buffered and incremental modes
- ⚡ **Real-time rendering** with auto-close for incomplete syntax
- 🔧 **Comark component syntax** for custom components
- 🎨 **Vue 3 & React renderers** with custom component mapping
- 📝 **YAML frontmatter** support
- 📑 **Automatic TOC generation**
- 🎯 **Full TypeScript support**
- 🌈 **Syntax highlighting** with Shiki integration

## Package Information

- **Package Name:** `comark`
- **Installation:** `npm install comark` or `pnpm add comark`
- **Exports:**
  - Main parser: `comark`
  - Vue components: `comark/vue`
  - React components: `comark/react`
  - Stream API: `comark/stream`

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
console.log(result.body)  // Comark AST
console.log(result.data)  // { title: 'Hello World' }
console.log(result.toc)   // Table of contents
```

### Vue Rendering

```vue
<template>
  <Comark :markdown="content" />
</template>

<script setup lang="ts">
import { Comark } from 'comark/vue'

const content = `# Hello World`
</script>
```

### React Rendering

```tsx
import { Comark } from 'comark/react'

export default function App() {
  return <Comark markdown={content} />
}
```

## Documentation Sections

This guide is organized into focused sections covering different aspects of the package:

### 📝 [1. Markdown Syntax](./docs/skills/markdown-syntax.md)

Learn how to write Comark documents with complete syntax reference:

- **Standard Markdown:** headings, text formatting, lists, links, images, blockquotes
- **Frontmatter:** YAML metadata with special fields (title, depth, searchDepth)
- **Comark Components:** block components (`::component`), inline components (`:component`), properties, slots, nesting
- **Attributes:** custom attributes on native markdown elements using `{...}` syntax
- **Code Blocks:** language specification, filename metadata, line highlighting, special characters
- **Task Lists:** GFM-style checkboxes with `[x]` and `[ ]` syntax
- **Tables:** GFM tables with alignment and inline markdown support

**[→ Read Full Markdown Syntax Guide](./docs/skills/markdown-syntax.md)**

---

### 🔧 [2. Parsing & AST Generation](./docs/skills/parsing-ast.md)

Complete guide for parsing documents and working with AST:

- **String Parsing:** `parse()` function with options (autoUnwrap, autoClose)
- **Async Parsing:** `parse()` with Shiki syntax highlighting
- **Stream Parsing:** buffered (`parseStream`) and incremental (`parseStreamIncremental`) modes
- **AST Structure:** Comark AST format - lightweight array-based AST
- **Rendering AST:** convert to HTML (`renderHTML`) or markdown (`renderMarkdown`) via `comark/string`
- **Auto-close:** automatic closing of unclosed syntax for streaming scenarios
- **Auto-unwrap:** remove unnecessary paragraph wrappers from container components

**[→ Read Full Parsing & AST Guide](./docs/skills/parsing-ast.md)**

---

### ⚛️ [3. Vue Rendering](./docs/skills/rendering-vue.md)

Comprehensive guide for rendering in Vue 3 applications:

- **Basic Usage:** `Comark` component setup
- **Custom Components:** mapping custom Vue components to Comark elements
- **Dynamic Loading:** `componentsManifest` for lazy-loaded components
- **Slots Support:** named slots with `#slot-name` syntax
- **Streaming Mode:** real-time rendering with reactive content
- **Prose Components:** pre-built styled components for standard elements
- **Error Handling:** built-in error capture for streaming scenarios
- **Props Access:** accessing `__node` and parsed properties

**[→ Read Full Vue Rendering Guide](./docs/skills/rendering-vue.md)**

---

### ⚛️ [4. React Rendering](./docs/skills/rendering-react.md)

Comprehensive guide for rendering in React applications:

- **Basic Usage:** `Comark` component setup
- **Custom Components:** mapping custom React components to Comark elements
- **Dynamic Loading:** `componentsManifest` for lazy-loaded components
- **Props Conversion:** automatic HTML attribute conversion (`class` → `className`, etc.)
- **Streaming Mode:** real-time rendering with reactive content
- **Prose Components:** pre-built styled components for standard elements
- **Custom Props:** accessing parsed properties and `__node`
- **CSS Class Name:** custom wrapper classes and Tailwind CSS integration

**[→ Read Full React Rendering Guide](./docs/skills/rendering-react.md)**

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

### Streaming Support

Perfect for AI-generated content or large documents:

```typescript
import { parseStreamIncremental } from 'comark/stream'

for await (const result of parseStreamIncremental(stream)) {
  // Auto-close applied automatically
  updateUI(result.body)

  if (result.isComplete) {
    console.log('Complete!', result.toc)
  }
}
```

### Comark AST Format

Lightweight array-based structure for efficient processing:

```json
{
  "type": "comark",
  "value": [
    ["h1", { "id": "hello" }, "Hello"],
    ["p", {}, "Text with ", ["strong", {}, "bold"], " word"],
    ["alert", { "type": "info" }, "Message"]
  ]
}
```

### Auto-Close for Streaming

O(n) algorithm that handles unclosed syntax:

```typescript
import { autoCloseMarkdown } from 'comark'

// Handles: *, **, ***, ~~, `, [, ], (, ), ::component, {...}
const closed = autoCloseMarkdown('**bold text') // → '**bold text**'
```

## Common Use Cases

### 1. Static Site Generator

```typescript
import { parse } from 'comark'
import { renderHTML } from 'comark/string'

async function processMarkdownFile(filePath: string) {
  const content = await readFile(filePath, 'utf-8')

  const result = await parse(content, {
    highlight: { theme: 'github-dark' }
  })

  return {
    html: renderHTML(result.body),
    frontmatter: result.data,
    toc: result.toc
  }
}
```

### 2. Real-time Markdown Editor

```tsx
import { useState } from 'react'
import { Comark } from 'comark/react'

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

### 3. AI Content Streaming

```typescript
async function streamAIResponse() {
  const response = await fetch('/api/ai-generate')

  for await (const result of parseStreamIncremental(response.body!)) {
    // Render partial content with auto-close
    renderToUI(result.body)

    if (result.isComplete) {
      // Show final TOC and complete content
      showTableOfContents(result.toc)
    }
  }
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
import { Comark } from 'comark/vue'
import { docComponents } from './components'
</script>
```

## API Reference Summary

### Core Functions (`comark`)

```typescript
// Synchronous parsing
parse(source: string, options?: ParseOptions): ParseResult

// Asynchronous parsing with highlighting
parse(source: string, options?: ParseOptions): Promise<ParseResult>

// Auto-close unclosed syntax
autoCloseMarkdown(source: string): string
```

### String Rendering Functions (`comark/string`)

```typescript
// Render to HTML (with optional custom components and data)
renderHTML(tree: ComarkTree, options?: RenderHTMLOptions): string

// Render to markdown
renderMarkdown(tree: ComarkTree): string
```

### Stream Functions

```typescript
// Buffered streaming (wait for complete)
parseStream(stream: Readable | ReadableStream): Promise<ParseResult>

// Incremental streaming (real-time)
parseStreamIncremental(stream: Readable | ReadableStream): AsyncGenerator<IncrementalParseResult>
```

### Vue Components

```vue
<Comark :markdown="markdownString" :components="customComponents" />
```

### React Components

```tsx
<Comark markdown={markdownString} components={customComponents} />
```

## Performance Characteristics

- **O(n) auto-close algorithm** - linear time without regex
- **Comark AST format** - lightweight array-based AST
- **Lazy component loading** - only load what's needed
- **Shiki highlighter caching** - avoid re-initialization
- **Incremental parsing** - stream processing with minimal overhead

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  ParseResult,
  ParseOptions,
  ComarkTree,
  ComarkNode,
  ShikiOptions,
  IncrementalParseResult
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
        │  + Plugins      │ (Comark, Tasks, CJK)
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
        │  ParseResult    │
        │  (body + data   │
        │   + toc)        │
        └────────┬────────┘
                 │
     ┌───────────┴───────────┐
     ▼                       ▼
┌─────────┐           ┌─────────┐
│   Vue   │           │  React  │
│ Renderer│           │ Renderer│
└─────────┘           └─────────┘
```

## Contributing & Testing

See the [test specifications](./SPEC/) for examples of all supported syntax features.

Run tests:
```bash
pnpm test
```

Run specific test:
```bash
pnpm test -- tests/parse.test.ts
```

## Resources

- **README:** [README.md](./README.md) - Installation and quick start
- **Specifications:** [SPEC/](./SPEC/) - Complete syntax test cases
- **Playground:** [playground/](./playground/) - Live examples and testing

---

## Summary

**Comark** is a comprehensive solution for parsing and rendering markdown with component support. It excels at:

1. **Extending Markdown** - Component syntax without breaking compatibility
2. **Streaming Support** - Real-time rendering with auto-close
3. **Lightweight AST** - Efficient Comark AST format
4. **Framework Support** - First-class Vue and React integration
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
