# Agent Instructions

This document provides guidance for AI agents working on the comark monorepo.

## Project Overview

This is a **monorepo** containing the Comark Markdown parser, document model, plugins, and renderers. The main package is `comark`.

**comark** is a JavaScript library for parsing CommonMark and GFM into a compact, serializable document that can be rendered to HTML, ANSI, Vue, React, Svelte, or Angular. It provides:

- Fast synchronous and async parsing via markdown-exit, a TypeScript rewrite of markdown-it
- CommonMark and GitHub Flavored Markdown support
- Streaming support for real-time/incremental parsing
- HTML, ANSI, Vue, React, Svelte and Angular renderers
- Component and attribute syntax plus an extensible plugin system
- Syntax highlighting via Shiki
- Auto-close utilities for incomplete markdown (useful for AI streaming)

## Monorepo Structure

```
/                         # Root workspace
├── packages/             # All publishable packages
│   ├── comark/           # Main Comark parser + core plugins
│   ├── comark-html/      # HTML renderer (@comark/html)
│   ├── comark-ansi/      # ANSI terminal renderer (@comark/ansi)
│   ├── comark-vue/       # Vue renderer + plugins (@comark/vue)
│   ├── comark-react/     # React renderer + plugins (@comark/react)
│   ├── comark-svelte/    # Svelte renderer + plugins (@comark/svelte)
│   ├── comark-angular/   # Angular renderer + plugins (@comark/angular)
│   └── comark-nuxt/      # Nuxt module (@comark/nuxt)
├── examples/             # Example applications
│   ├── 1.frameworks/     # Framework examples (Nuxt, Next.js, Astro, SvelteKit, VitePress)
│   ├── 2.vite/           # Vite examples (Vue, React, Svelte, Angular, HTML, ANSI)
│   ├── 3.cli/            # CLI examples (ANSI output, prompts, perf tracing)
│   ├── 3.plugins/        # Plugin examples (math, mermaid, highlight, rangi, footnotes, ...)
│   └── 4.ai/             # AI streaming examples (Nuxt + AI SDK)
├── docs/                 # Documentation site (comark-docs layer)
├── playground/           # Nuxt playground (`pnpm dev:playground`)
├── benchmarks/           # mitata benchmarks for parse/render/plugins
├── scripts/              # Build/sync/release scripts
├── test/                 # Root-level tests (bundle-size snapshot)
├── pnpm-workspace.yaml   # Workspace configuration + dependency catalog
├── tsconfig.json         # Root TypeScript config (`pnpm typecheck`)
├── vitest.config.ts      # Root Vitest config, scoped to `test/`
├── .oxlintrc.json        # oxlint configuration
├── .oxfmtrc.json         # oxfmt configuration
└── package.json          # Root package (private, scripts only)
```

## Package: comark

Located at `packages/comark/`:

```
packages/comark/
├── src/
│   ├── index.ts              # Entry point: re-exports parse.ts, auto-close, context, types
│   ├── parse.ts              # Core parser: parseMarkdown(), createMarkdownParser() (comark/parse)
│   ├── render.ts             # String rendering: renderMarkdown() (renderHtmlFromDocument() moved to @comark/html)
│   ├── types.ts              # Document model (MarkdownDocument, Node, ElementNode, TextNode, CommentNode) + ParserOptions
│   ├── context.ts            # Live renderer context: ComarkContext, ComarkDocument, ComarkPatch
│   ├── plugins/              # Built-in and optional plugins
│   │   ├── alert.ts          # Alert/callout blocks
│   │   ├── frontmatter.ts    # YAML frontmatter extraction (default via registerDefaultPlugins)
│   │   ├── html.ts           # HTML block/inline parsing (default via registerDefaultPlugins)
│   │   ├── components.ts     # Block/inline components + spans (`::name`, `:name`, `[text]`)
│   │   ├── attributes.ts     # Inline attributes (`{props}` after tokens)
│   │   ├── binding.ts        # Inline interpolation + shared conditional rendering rules
│   │   ├── breaks.ts         # Hard line breaks (`<br>`) from newlines
│   │   ├── emoji.ts          # Emoji shortcodes
│   │   ├── footnotes.ts      # GFM footnotes
│   │   ├── headings.ts       # Title/description extraction into `meta`
│   │   ├── json-render.ts    # `json-render` spec fences expanded into nodes
│   │   ├── punctuation.ts    # Smart quotes and dashes
│   │   ├── shiki.ts          # Shiki with bundled default theme + language loaders (peer: shiki)
│   │   ├── shiki/core.ts     # Shiki without default theme/language imports
│   │   ├── shiki/language-comark.ts # Comark TextMate grammar and its Shiki dependencies
│   │   ├── highlight.ts      # Deprecated alias → shiki (remove next major)
│   │   ├── rangi.ts          # Lightweight highlighting via rangi (peer: rangi)
│   │   ├── rangi/language-comark.ts # Standalone Comark grammar for rangi
│   │   ├── math.ts           # LaTeX math via KaTeX (peer: katex)
│   │   ├── mermaid.ts        # Mermaid diagrams (peer: beautiful-mermaid)
│   │   ├── security.ts       # XSS/security sanitization
│   │   ├── summary.ts        # Summary extraction
│   │   ├── task-list.ts      # GFM task lists
│   │   └── toc.ts            # Table of contents
│   ├── utils/                # Shared utilities (comark/utils entry point)
│   │   ├── index.ts          # textContent(), visit(), visitAsync(), escapeHtml(), indent(), string/object utils
│   │   ├── helpers.ts        # defineComarkPlugin(), dedupePlugins()
│   │   ├── trace.ts          # ComarkTracer helpers: noopTracer, withSpan() (comark/utils/trace)
│   │   └── caret.ts          # Caret utilities for streaming
│   └── internal/             # Internal implementation (not exported)
│       ├── shiki.ts          # Shared Shiki runtime used by both entry points
│       ├── frontmatter.ts    # parseFrontmatter() / renderFrontmatter()
│       ├── yaml.ts           # YAML helpers
│       ├── props-validation.ts # Component props validation
│       ├── parse/            # Parsing pipeline
│       │   ├── token-processor.ts # markdown-exit tokens → document nodes
│       │   ├── auto-close/   # Self-healing for incomplete markdown
│       │   ├── html/         # HTML block/inline rules
│       │   ├── syntax/       # Component syntax scanners (props, brackets, block params)
│       │   ├── incremental.ts # Node reuse between streaming parses
│       │   ├── indent.ts     # Dedent of outdented component children
│       │   ├── unwrap.ts     # `unwrap` option
│       │   └── auto-unwrap.ts # `autoUnwrap` option
│       └── stringify/        # AST → markdown string rendering (handlers/ per tag)
├── SPEC/                 # Behavioral spec fixtures (CommonMark, GFM, HTML, COMARK, auto-close.md)
├── test/                 # Vitest test files
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Exports

```json
{
  ".": "./dist/index.js",
  "./plugins/*": "./dist/plugins/*.js",
  "./utils": "./dist/utils/index.js",
  "./utils/trace": "./dist/utils/trace.js",
  "./parse": "./dist/parse.js",
  "./render": "./dist/render.js"
}
```

### Peer dependencies

| Peer | Required by |
|------|-------------|
| `shiki` | `comark/plugins/shiki` |
| `rangi` | `comark/plugins/rangi` |
| `katex` | `comark/plugins/math` |
| `beautiful-mermaid` | `comark/plugins/mermaid` |

All are optional — only install what you use.

## Package: @comark/html

Located at `packages/comark-html/`. Framework-free HTML string rendering.

### Exports

```json
{
  ".": "./dist/index.js",
  "./plugins/*": "./dist/plugins/*.js",
  "./utils": "./dist/utils/index.js",
  "./parse": "./dist/parse.js",
  "./render": "./dist/render.js"
}
```

### Usage

```typescript
import { createHtmlRenderer, renderHtml, renderHtmlFromDocument } from '@comark/html'
import shiki from '@comark/html/plugins/shiki'
import math, { Math } from '@comark/html/plugins/math'

// Flat options — ParserOptions & RendererOptions merged at top level
const renderHtml = createHtmlRenderer({
  plugins: [shiki({ themes: { light: 'github-light', dark: 'github-dark' } })],
  components: {
    Math,
    alert: async ([, attrs, ...children], { render }) =>
      `<div class="alert alert-${attrs.type}">${await render(children)}</div>`
  },
})

const html = await renderHtml(markdownString)
```

---

## Package: @comark/ansi

Located at `packages/comark-ansi/`. ANSI terminal renderer.

### Exports

```json
{
  ".": "./dist/index.js",
  "./plugins/*": "./dist/plugins/*.js",
  "./utils": "./dist/utils/index.js",
  "./parse": "./dist/parse.js",
  "./render": "./dist/render.js"
}
```

### Usage

```typescript
import { createAnsiRenderer, createAnsiPrinter, printAnsi, renderAnsi, renderAnsiFromDocument } from '@comark/ansi'
import shiki from '@comark/ansi/plugins/shiki'
import math, { Math } from '@comark/ansi/plugins/math'

// Flat options — ParserOptions & AnsiRendererOptions merged at top level
const printAnsi = createAnsiPrinter({
  plugins: [shiki(), math()],
  components: { Math },
  width: 120,                      // terminal width
  colors: true,                    // emit ANSI escape codes
  writer: (output) => process.stderr.write(output),
})

await printAnsi(markdownString)
```

---

## Package: @comark/vue

Located at `packages/comark-vue/`. Vue 3 renderer with framework-specific plugin wrappers.

```
packages/comark-vue/
├── src/
│   ├── index.ts              # Entry point: Markdown, MarkdownDocument, defineMarkdownComponent, defineMarkdownDocumentComponent
│   ├── parse.ts              # Re-exports comark/parse (@comark/vue/parse)
│   ├── render.ts             # Re-exports comark/render (@comark/vue/render)
│   ├── vite.ts               # Vite plugin: `<slot unwrap>` transform + prose component auto-registration (@comark/vue/vite)
│   ├── components/
│   │   ├── Markdown.ts       # High-level markdown → render component
│   │   ├── MarkdownDocument.ts # Low-level AST → render component
│   │   ├── Binding.ts        # Inline binding renderer
│   │   ├── If.ts             # Conditional content renderer
│   │   ├── Math.ts           # Math rendering component
│   │   └── Mermaid.ts        # Mermaid rendering component
│   ├── plugins/
│   │   ├── binding.ts        # Re-exports binding plugin + Binding and If components
│   │   ├── math.ts           # Re-exports comark/plugins/math + Math component
│   │   └── mermaid.ts        # Re-exports comark/plugins/mermaid + Mermaid component
│   └── utils/                # Re-exports comark/utils + slot/caret helpers (@comark/vue/utils)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Exports

```json
{
  ".": "./dist/index.js",
  "./vite": "./dist/vite.js",
  "./plugins/*": "./dist/plugins/*.js",
  "./utils": "./dist/utils/index.js",
  "./parse": "./dist/parse.js",
  "./render": "./dist/render.js",
  "./components/*": "./dist/components/*.js"
}
```

### Usage

```typescript
import { Markdown, MarkdownDocument, defineMarkdownComponent } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
```

## Package: @comark/react

Located at `packages/comark-react/`. React renderer with framework-specific plugin wrappers.

```
packages/comark-react/
├── src/
│   ├── index.ts              # Entry point: Markdown, MarkdownDocument, MarkdownLive, MarkdownClient, defineMarkdownComponent
│   ├── parse.ts              # Re-exports comark/parse (@comark/react/parse)
│   ├── render.ts             # Re-exports comark/render (@comark/react/render)
│   ├── components/
│   │   ├── Markdown.tsx      # High-level markdown → render component
│   │   ├── MarkdownDocument.tsx # Low-level AST → render component
│   │   ├── MarkdownClient.tsx # Client-only markdown component
│   │   ├── MarkdownLive.tsx  # Streaming/live markdown component
│   │   ├── Binding.tsx       # Inline binding renderer
│   │   ├── If.tsx            # Conditional content renderer
│   │   ├── Math.tsx          # Math rendering component
│   │   └── Mermaid.tsx       # Mermaid rendering component
│   ├── plugins/
│   │   ├── binding.ts        # Re-exports binding plugin + Binding and If components
│   │   ├── math.ts           # Re-exports comark/plugins/math + Math component
│   │   └── mermaid.ts        # Re-exports comark/plugins/mermaid + Mermaid component
│   └── utils/                # Re-exports comark/utils + caret helpers (@comark/react/utils)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Exports

```json
{
  ".": "./dist/index.js",
  "./plugins/*": "./dist/plugins/*.js",
  "./utils": "./dist/utils/index.js",
  "./parse": "./dist/parse.js",
  "./render": "./dist/render.js",
  "./components/*": "./dist/components/*.js"
}
```

### Usage

```typescript
import { Markdown, MarkdownDocument, defineMarkdownComponent } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'
import mermaid, { Mermaid } from '@comark/react/plugins/mermaid'
```

## Package: @comark/svelte

Svelte 5 renderer for Comark. Located at `packages/comark-svelte/`:

```
packages/comark-svelte/
├── src/
│   ├── index.ts              # Entry point (@comark/svelte): Markdown, MarkdownDocument, MarkdownNode
│   ├── types.ts              # Shared prop interfaces
│   ├── parse.ts              # Re-exports comark/parse (@comark/svelte/parse)
│   ├── render.ts             # Re-exports comark/render (@comark/svelte/render)
│   ├── components/
│   │   ├── Markdown.svelte       # High-level markdown → render ($state + $effect)
│   │   ├── MarkdownDocument.svelte # Low-level AST → render component
│   │   ├── MarkdownNode.svelte   # Recursive AST node renderer
│   │   ├── ComarkComponent.svelte # Custom component renderer with named snippets
│   │   ├── Resolve.svelte        # Stable promise resolver for lazy components
│   │   ├── Binding.svelte        # Inline binding renderer
│   │   ├── If.svelte             # Conditional content renderer
│   │   ├── Math.svelte           # Math rendering component
│   │   └── Mermaid.svelte        # Mermaid rendering component
│   ├── async/
│   │   ├── index.ts              # Async export (@comark/svelte/async)
│   │   ├── MarkdownAsync.svelte  # High-level markdown → render (experimental await)
│   │   └── ResolveAsync.svelte   # Async SSR resolver for lazy components
│   ├── plugins/
│   │   ├── binding.ts        # Re-exports binding plugin + Binding and If components
│   │   ├── math.ts           # Re-exports comark/plugins/math + Math component
│   │   ├── mermaid.ts        # Re-exports comark/plugins/mermaid + Mermaid component
│   │   ├── shiki.ts          # Plain re-export of comark/plugins/shiki
│   │   └── highlight.ts      # Plain re-export of the deprecated highlight alias
│   └── utils/                # Re-exports comark/utils (@comark/svelte/utils)
├── svelte.config.js          # Svelte config (experimental.async enabled)
├── vitest.config.ts          # Dual test config (server + browser)
├── tsconfig.json
├── tsconfig.build.json       # Used by the second svelte-package pass (JS without types)
└── package.json
```

### Exports

```json
{
  ".": { "types": "./dist/index.d.ts", "svelte": "./dist/index.js" },
  "./async": { "types": "./dist/async/index.d.ts", "svelte": "./dist/async/index.js" },
  "./plugins/*": { "types": "./dist/plugins/*.d.ts", "svelte": "./dist/plugins/*.js" },
  "./components/*": { "types": "./dist/components/*.d.ts", "svelte": "./dist/components/*" },
  "./utils": "./dist/utils/index.js",
  "./parse": "./dist/parse.js",
  "./render": "./dist/render.js"
}
```

### Build

Uses `@sveltejs/package` (`svelte-package`) — the standard Svelte library packaging tool.

### Testing

Uses Vitest with two test projects:
- **`server`**: Node environment, `*.test.ts` files — SSR tests using `svelte/server` `render()`
- **`client`**: Browser environment (Playwright/Chromium), `*.svelte.test.ts` files — real DOM tests using `vitest-browser-svelte`

### Usage

```svelte
<script>
  import { Markdown } from '@comark/svelte'
  import math, { Math } from '@comark/svelte/plugins/math'
  import mermaid, { Mermaid } from '@comark/svelte/plugins/mermaid'
</script>

<Markdown value={content} components={{ math: Math }} plugins={[math()]} />
```

**Experimental async** (requires `experimental.async` in Svelte config):
```svelte
<script>
  import { MarkdownAsync } from '@comark/svelte/async'
</script>
<svelte:boundary>
  <MarkdownAsync value={content} components={customComponents} />
  {#snippet pending()}
    <p>Loading...</p>
  {/snippet}
</svelte:boundary>
```

## Package: @comark/angular

Located at `packages/comark-angular/`. Angular 17+ renderer with standalone components.

```
packages/comark-angular/
├── src/
│   ├── index.ts                          # Entry point
│   ├── define.ts                         # defineMarkdownComponent / defineMarkdownDocumentComponent
│   ├── components/
│   │   ├── markdown.component.ts         # High-level markdown → render component
│   │   ├── markdown-document.component.ts # Low-level AST → render component
│   │   ├── markdown-node.component.ts    # Recursive AST node renderer
│   │   ├── binding.component.ts          # Binding rendering component
│   │   ├── if.component.ts               # Structural conditional renderer
│   │   ├── math.component.ts             # Math rendering component
│   │   └── mermaid.component.ts          # Mermaid rendering component
│   ├── plugins/
│   │   ├── binding.ts                    # Re-exports binding plugin + Binding and If components
│   │   ├── math.ts                       # Re-exports comark/plugins/math + Math component
│   │   └── mermaid.ts                    # Re-exports comark/plugins/mermaid + Mermaid component
│   └── utils/
│       ├── caret.ts                      # Caret utilities for streaming
│       └── index.ts                      # Re-exports comark/utils
├── scripts/
│   └── verify-build.mjs                  # Asserts partial-compilation metadata in dist after build
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Build

Uses the Angular compiler (`ngc`) in partial-compilation mode so published
JavaScript and declarations contain the Angular metadata required by both JIT
and AOT consumers. `scripts/verify-build.mjs` runs after both `ngc` passes.

### Exports

```json
{
  ".": "./dist/index.js",
  "./plugins/*": "./dist/plugins/*.js",
  "./utils": "./dist/utils/index.js"
}
```

### Usage

```typescript
import { Markdown, MarkdownDocument, defineMarkdownComponent, defineMarkdownDocumentComponent } from '@comark/angular'
import math, { Math } from '@comark/angular/plugins/math'
import mermaid, { Mermaid } from '@comark/angular/plugins/mermaid'
```

```html
<!-- In Angular template -->
<comark-markdown [value]="content" [components]="customComponents" />
```

## Package Exports Reference

```typescript
// Core parsing
import { parseMarkdown, createMarkdownParser, autoCloseMarkdown, defineComarkPlugin } from 'comark'
import { parseMarkdown } from 'comark/parse' // same parser API without the auto-close/context re-exports

// Live renderer context (patch a rendered document without re-parsing)
import { createComarkContext } from 'comark'
import type { ComarkContext, ComarkDocument, ComarkPatch } from 'comark'

// HTML rendering (parse + render in one step)
import { createHtmlRenderer, renderHtml, renderHtmlFromDocument } from '@comark/html'

// ANSI terminal rendering
import { createAnsiRenderer, createAnsiPrinter, printAnsi, renderAnsi, renderAnsiFromDocument } from '@comark/ansi'

// Markdown string rendering (AST → markdown)
import { renderMarkdown } from 'comark/render'

// Document model types and utilities
import type { MarkdownDocument, Node, ElementNode, TextNode, CommentNode } from 'comark'
import { textContent, visit, visitAsync, escapeHtml, isMarkdownDocument } from 'comark/utils'
import { noopTracer, withSpan } from 'comark/utils/trace'

// Core plugins — use when calling parseMarkdown() directly (framework-agnostic)
import shiki from 'comark/plugins/shiki'
import shikiCore from 'comark/plugins/shiki/core' // ShikiCoreOptions: required themes + languages, no defaults
import rangi, { comarkLanguage, comarkLanguages } from 'comark/plugins/rangi'
import shikiComarkLanguages from 'comark/plugins/shiki/language-comark'
import rangiComarkLanguage from 'comark/plugins/rangi/language-comark'
// import highlight from 'comark/plugins/highlight' // deprecated alias → shiki
import math from 'comark/plugins/math'
import mermaid from 'comark/plugins/mermaid'
import emoji from 'comark/plugins/emoji'
import toc from 'comark/plugins/toc'
import alert from 'comark/plugins/alert'
import breaks from 'comark/plugins/breaks'
import footnotes from 'comark/plugins/footnotes'
import headings from 'comark/plugins/headings'
import punctuation from 'comark/plugins/punctuation'
import jsonRender from 'comark/plugins/json-render'
import security from 'comark/plugins/security'
import summary from 'comark/plugins/summary'
import taskList from 'comark/plugins/task-list'         // default via registerDefaultPlugins
import frontmatter from 'comark/plugins/frontmatter' // default via registerDefaultPlugins
import components from 'comark/plugins/components'   // default via registerDefaultPlugins
import attributes from 'comark/plugins/attributes'   // default via registerDefaultPlugins
import html from 'comark/plugins/html'               // default via registerDefaultPlugins
import binding, { Binding, resolveIfWrapper, selectIfBranch, shouldRenderIf } from 'comark/plugins/binding'
import type { IfComparisonOperator, IfProps, IfWrapperTag } from 'comark/plugins/binding'

// markdown-it / markdown-exit adapters (e.g. VitePress)
import { markdownItComponents } from 'comark/plugins/components'
import { markdownItAttributes } from 'comark/plugins/attributes'

// NOTE: All framework packages re-export every core plugin via their own subpath.
// Prefer the framework-specific path when using a framework renderer:
//   @comark/vue/plugins/shiki, @comark/react/plugins/shiki, etc.
// Nested entries are re-exported too: @comark/vue/plugins/shiki/core, etc.
// Use comark/plugins/* only when calling parseMarkdown() without a framework renderer.

// HTML rendering — parse + render to HTML string
import { createHtmlRenderer, renderHtml, renderHtmlFromDocument } from '@comark/html'
import shiki from '@comark/html/plugins/shiki'
import math, { Math } from '@comark/html/plugins/math'
import mermaid, { Mermaid } from '@comark/html/plugins/mermaid'
import binding, { Binding, If } from '@comark/html/plugins/binding'

// ANSI terminal rendering — parse + render to styled terminal string
import { createAnsiRenderer, createAnsiPrinter, printAnsi, renderAnsi, renderAnsiFromDocument } from '@comark/ansi'
import shiki from '@comark/ansi/plugins/shiki'
import math from '@comark/ansi/plugins/math'
import binding, { Binding, If } from '@comark/ansi/plugins/binding'

// Vue — renderer + plugin wrappers (plugin fn + Vue component)
import { Markdown, MarkdownDocument, defineMarkdownComponent } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
import binding, { Binding, If } from '@comark/vue/plugins/binding'

// React — renderer + plugin wrappers (plugin fn + React component)
import { Markdown, MarkdownDocument, defineMarkdownComponent } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'
import mermaid, { Mermaid } from '@comark/react/plugins/mermaid'
import binding, { Binding, If } from '@comark/react/plugins/binding'

// Svelte — renderer + plugin wrappers (plugin fn + Svelte component)
import { Markdown, MarkdownDocument } from '@comark/svelte'
import { MarkdownAsync } from '@comark/svelte/async' // requires experimental.async
import math, { Math } from '@comark/svelte/plugins/math'
import mermaid, { Mermaid } from '@comark/svelte/plugins/mermaid'
import binding, { Binding, If } from '@comark/svelte/plugins/binding'

// Angular — renderer + plugin wrappers (plugin fn + Angular component)
import { Markdown, MarkdownDocument, defineMarkdownComponent, defineMarkdownDocumentComponent } from '@comark/angular'
import math, { Math } from '@comark/angular/plugins/math'
import mermaid, { Mermaid } from '@comark/angular/plugins/mermaid'
import binding, { Binding, If } from '@comark/angular/plugins/binding'
```

## Coding Principles

### Performance First

1. **Avoid regex when possible** - Use character-by-character scanning for O(n) algorithms
2. **Linear time complexity** - Strive for O(n) operations, avoid nested loops that could be O(n²) or worse
3. **Minimize allocations** - Reuse arrays/objects, avoid creating unnecessary intermediate structures

### TypeScript Conventions

1. Use explicit types for function parameters and return values
2. Export types alongside functions for consumer convenience
3. Use `Record<string, any>` for component props maps
4. Prefer interfaces over type aliases for object shapes

### Code Organization

1. Keep internal implementation in `packages/comark/src/internal/`
2. Document model types in `packages/comark/src/types.ts`, live-context types in `src/context.ts`, tree utilities in `src/utils/`
3. Core plugins (parser-only) in `packages/comark/src/plugins/`
4. Framework renderers in separate packages (`comark-vue`, `comark-react`, `comark-svelte`, `comark-angular`)
5. Framework plugin wrappers (plugin fn + component) in `packages/comark-{framework}/src/plugins/`

## Testing Guidelines

```bash
pnpm test                                              # Run all package tests
cd packages/comark && pnpm test                        # Run comark tests
cd packages/comark && pnpm vitest run test/auto-close.test.ts  # Run specific test
```

### Test Structure

```typescript
import { describe, expect, it } from 'vitest'
import { functionUnderTest } from '../src/utils/module'

describe('functionUnderTest', () => {
  it('should handle basic case', () => {
    const input = 'test input'
    const expected = 'expected output'
    expect(functionUnderTest(input)).toBe(expected)
  })
})
```

### What to Test

1. **Happy path** - Normal expected usage
2. **Edge cases** - Empty input, special characters, boundary conditions
3. **Error tolerance** - Invalid/malformed input should not crash
4. **Roundtrip** - Parse then render should preserve semantics

## Key APIs

### parseMarkdown(source, options)

```typescript
const result = await parseMarkdown(markdownContent, {
  autoUnwrap: true,             // Remove <p> wrappers from single-paragraph containers
  autoClose: true,              // Auto-close incomplete syntax; also accepts (markdown) => string
  unwrap: 'p',                  // Strip top-level wrapper tags (MDC unwrap); merges paragraphs
  registerDefaultPlugins: true, // frontmatter, html, alert, task-list, components, attributes; false to disable
})

result.nodes       // Node[]
result.frontmatter // Record<string, any>
result.meta        // Record<string, any>
```

### autoCloseMarkdown(markdown, options?)

Self-healing markdown for streaming. Heals incomplete CommonMark/GFM per
`packages/comark/SPEC/auto-close.md`, then completes Comark components / tables / frontmatter.

```typescript
autoCloseMarkdown('**bold text')     // '**bold text**'
autoCloseMarkdown('::alert\nContent') // '::alert\nContent\n::'

// Incomplete links get a safe placeholder URL (default protocol mode)
autoCloseMarkdown('[partial')
// '[partial](comark:incomplete-link)'

// Math (inline `$` and block `$$`) is off by default on bare autoCloseMarkdown
autoCloseMarkdown('$x = 5') // '$x = 5'
autoCloseMarkdown('$x = 5', { math: true }) // '$x = 5$'
// parseMarkdown / createMarkdownParser pass math: true when math plugin provided

// Plain markdown without Comark component fences
autoCloseMarkdown('**bold', { syntax: false })

// Streaming: drop a half-typed opener after whitespace so it does not flash
autoCloseMarkdown('hello *', { dropTrailingOpeners: true }) // 'hello'
```

Key options: `linkMode: 'protocol' | 'text-only'`, `math` (default false; on in parse),
`dropTrailingOpeners` (default false; on when parsing with `streaming: true`),
`incompleteLinkPlaceholder`, `incompleteImagePlaceholder`, `frontmatter`, `syntax`, `attributes`.
Behavioral SPEC: `packages/comark/SPEC/auto-close.md` (run via `test/auto-close-spec.test.ts`).

## Markdown Document Model

Defined in `packages/comark/src/types.ts`. The live-update types (`ComarkDocument`,
`ComarkPatch`, `ComarkContext`) live in `packages/comark/src/context.ts`.

```typescript
type TextNode = string
type ElementNodeAttributes = { [key: string]: unknown; $?: { line?: number; html?: 0 | 1; block?: 0 | 1 } }
type ElementNode = [string, ElementNodeAttributes, ...Node[]]
type CommentNode = [null, ElementNodeAttributes, string]
type Node = ElementNode | TextNode | CommentNode
type MarkdownDocument = {
  nodes: Node[]
  frontmatter: Record<string, any>
  meta: Record<string, any>
}
```

Example:
```typescript
// Input: "# Hello **World**"
// Output:
{
  nodes: [
    ['h1', { id: 'hello' }, 'Hello ', ['strong', {}, 'World']]
  ],
  frontmatter: {},
  meta: {}
}
```

## Indentation Inside Components

A block component's children may be indented (aligned under the `::` marker) or
not — both are valid input. Two rules keep the two forms interchangeable and
lossless through `parseMarkdown` → `renderMarkdown`:

**Parse — dedent the children, don't raise the floor.** A child indented *less*
than its own component marker is never dropped. Each child line is shifted left
by `min(markerIndent, its own indentation)` and the region is tokenized against
a zero floor (`comark_block` in `src/plugins/components.ts` via
`src/internal/parse/indent.ts`, mirroring the line-mark mutation `blockquote`
uses to strip its markers). Lines inside a
fenced code block all take the *opening fence's* shift, so the fence and its
body move together. The shift is all or nothing: a tab that would have to be
split into columns puts the region back and keeps the marker floor. A component
with no outdented child is untouched.

**Stringify — re-indent a block, never a line.** Nested components indent their
rendered output by 2 spaces per level (`indent()` in `src/utils/index.ts`). The
prefix is added to every line of the block, including the body of a fenced code
block, so the fence and its content always move together.

Uniform shifting is what makes fenced code survive. Indentation inside a fence
is significant whitespace, and the parser cannot tell padding apart from code:

```md
::tabs
  :::tabs-item{label="Code"}
```mdc
  ::accordion
  ::
```
  :::
::
```

The fence sits at indent 0 under a marker at indent 2, so fence and body shift
by 0 and the body keeps the two spaces it has relative to its fence
(`"  ::accordion\n  ::"`). Rendering back aligns the fence with its parent and
carries the body along, which is a fixed point on re-parse:

```md
::tabs
  :::tabs-item{label="Code"}
  ```mdc
    ::accordion
    ::
  ```
  :::
::
```

SPEC coverage: `SPEC/COMARK/component-nested-*-outdented.md`,
`SPEC/COMARK/component-nested-codeblock-indented.md`,
`SPEC/COMARK/codeblock-indented-content.md`.

## Vue/React/Svelte/Angular Components

### Markdown Component (High-level)

**Vue** (requires `<Suspense>` wrapper since Markdown is async):

```vue
<Suspense>
  <Markdown :components="customComponents">{{ content }}</Markdown>
</Suspense>
```

**React**:

```tsx
<Markdown components={customComponents}>{content}</Markdown>
```

**Svelte** (stable, uses `$state` + `$effect`):

```svelte
<Markdown value={content} components={customComponents} />
```

**Svelte** (experimental async — requires `experimental.async` in Svelte config):

```svelte
<svelte:boundary>
  <MarkdownAsync value={content} components={customComponents} />
  {#snippet pending()}<p>Loading...</p>{/snippet}
</svelte:boundary>
```

**Angular**:

```html
<comark-markdown [value]="content" [components]="customComponents" />
```

### defineMarkdownComponent (Vue, React & Angular)

Creates a pre-configured Markdown component with default plugins and components:

```typescript
// Vue
import { defineMarkdownComponent } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'

export const DocsMarkdown = defineMarkdownComponent({
  name: 'DocsMarkdown',
  plugins: [math(), mermaid()],
  components: { Math, Mermaid },
})

// React
import { defineMarkdownComponent } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'

export const DocsMarkdown = defineMarkdownComponent({
  name: 'DocsMarkdown',
  plugins: [math()],
  components: { Math },
})

// Angular
import { defineMarkdownComponent } from '@comark/angular'
import math, { Math } from '@comark/angular/plugins/math'

export const DocsMarkdown = defineMarkdownComponent({
  plugins: [math()],
  components: { Math },
})
```

## Common Tasks

### Adding a new utility function

1. Internal helpers go in `packages/comark/src/internal/`; public ones in `packages/comark/src/utils/`
2. Public utilities are exported from `packages/comark/src/utils/index.ts` (`comark/utils`)
3. Add tests in `packages/comark/test/`
4. Document with JSDoc

### Modifying the parser

1. Token processing is in `packages/comark/src/internal/parse/token-processor.ts`
2. Test with `packages/comark/test/index.test.ts` (loads the `SPEC/` fixtures; `SPEC=SPEC/COMARK/foo.md pnpm vitest run test/index.test.ts` runs one)
3. Check streaming still works with `packages/comark/test/streaming.test.ts`

### Adding component features

1. Vue components in `packages/comark-vue/src/components/`
2. React components in `packages/comark-react/src/components/`
3. Svelte components in `packages/comark-svelte/src/components/` (async variants in `src/async/`)
4. Angular components in `packages/comark-angular/src/components/`
5. All four should have similar APIs for consistency

### Adding a new core plugin

1. Create `packages/comark/src/plugins/{name}.ts`
2. Available as `comark/plugins/{name}` via the `"./plugins/*"` wildcard export
3. Add framework wrappers if it needs a render component:
   - `packages/comark-vue/src/plugins/{name}.ts` (re-export plugin + Vue component)
   - `packages/comark-react/src/plugins/{name}.ts` (re-export plugin + React component)
   - `packages/comark-svelte/src/plugins/{name}.ts` (re-export plugin + Svelte component)
   - `packages/comark-angular/src/plugins/{name}.ts` (re-export plugin + Angular component)
4. Run `pnpm sync-plugins` to generate plain `dist/plugins/*` re-exports in every framework package for plugins without a hand-written wrapper (also runs in `pnpm build` and `pnpm stub`)

### Adding a new package

1. Create directory in `packages/`
2. Add `package.json` with appropriate name and dependencies
3. Use `workspace:*` protocol for local package dependencies
4. Package is automatically included via `pnpm-workspace.yaml`

## Scripts

Root workspace scripts:

```bash
pnpm docs         # Run documentation site
pnpm dev:<name>   # Run an example (vue, react, svelte, angular, html, ansi, nuxt, nextjs, astro, ...)
pnpm dev:playground # Run the Nuxt playground
pnpm build        # Build all packages, then sync plugin re-exports
pnpm stub         # Point every package's dist/ at src/ for local dev (runs on postinstall)
pnpm test         # Run all package tests
pnpm test:spec    # Run the SPEC fixtures only
pnpm lint         # oxlint + oxfmt --check
pnpm lint:fix     # oxlint --fix + oxfmt (write)
pnpm typecheck    # tsc --noEmit against the root tsconfig
pnpm verify       # Run lint + test + typecheck
pnpm release      # Release changed packages (see Releasing)
```

Linting and formatting use [oxlint](https://oxc.rs/docs/guide/usage/linter) and
[oxfmt](https://oxc.rs/docs/guide/usage/formatter), configured in `.oxlintrc.json` and
`.oxfmtrc.json` (no semicolons, single quotes, 120 columns, ES5 trailing commas).
There is no ESLint or Prettier config.

Utility scripts:

```bash
node scripts/stub.mjs          # Generate stub dist files for one package (run from its directory)
node scripts/sync-plugins.mjs  # Sync plugin re-exports to framework packages (run from repo root)
node scripts/release.mjs       # Release every package changed since its last tag (--dry, --filter <pkg>)
```

## Continuous Integration

Workflows live in `.github/workflows/`:

| Workflow | Purpose |
|----------|---------|
| `ci.yml` | lint → prepack → test → publish preview (pkg.pr.new) → bundle size check |
| `commit-signature.yml` | Fails PRs containing unsigned commits |
| `bundle-snapshot.yml` | Reports bundle-size snapshot drift and updates it on demand |
| `docs-preview-comment.yml` | Posts a docs preview link on PRs that touch `docs/content/**` |

### Bundle size snapshot

`test/bundle.test.ts` asserts an inline snapshot of the published size of every
package (measured with `npm pack --dry-run`). It only makes sense after a real
build, so CI runs it after `pnpm prepack`:

```bash
pnpm prepack && pnpm vitest run bundle      # check
pnpm prepack && pnpm vitest run bundle -u   # accept the new sizes
```

When the check fails on a PR, `ci.yml` uploads a `bundle-report` artifact and
`bundle-snapshot.yml` posts a comment with the diff plus a checkbox button.
A maintainer (write access required) can:

- tick **🔄 Update the bundle snapshot** in that comment,
- comment `/update-bundle-snapshot`, or
- run the workflow manually with a PR number.

The workflow then rebuilds, runs `vitest run bundle --update`, re-runs the check
to verify the refreshed snapshot, and commits `test/bundle.test.ts` back to the
PR branch via the GitHub API (so the commit is verified, satisfying
`commit-signature.yml`). PR code always executes in the tokenless `build` job
(`permissions: {}`); only its artifact reaches the write-scoped `update` job,
which verifies the artifact against the run's head SHA and uses comment fences
longer than any backtick run in PR-controlled text. For fork PRs it cannot
push, so it posts the patch in the comment instead. The comment is deleted
automatically once the check passes.

GitHub suppresses the events a `GITHUB_TOKEN` commit would raise, so `ci` does
not reliably re-run after the snapshot lands — hence the in-job verification.
Re-run `ci` manually to refresh a stale red check.

Requires **Settings → Actions → General → Workflow permissions** to be set to
*Read and write*, otherwise the update job cannot commit.

## Releasing

Uses [release-it](https://github.com/release-it/release-it) with conventional changelog.
Each package has its own `.release-it.json` and `CHANGELOG.md`. `pnpm release`
(`scripts/release.mjs`) finds packages changed since their last `<name>@<version>`
tag and runs release-it for each; `pnpm release:dry` previews without touching git or npm.

### Commit message format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add streaming support          # Minor version bump
fix: correct parsing edge case       # Patch version bump
feat!: breaking API change           # Major version bump
perf: optimize auto-close algorithm  # Patch version bump
docs: update README                  # No version bump
chore: update dependencies           # No version bump
```

## Documentation Maintenance

**Important:** After completing any feature, bug fix, or significant change, update the relevant documentation:

### What to Update

1. **AGENTS.md** (this file)
   - Update architecture section if new files/modules added
   - Update Package Exports Reference if new public APIs
   - Update Common Tasks if workflows change

2. **Documentation** (`docs/content/`)
   - `1.getting-started/` — Installation or quick start changes
   - `2.syntax/` — Component/attribute/binding syntax changes
   - `3.rendering/` — Vue/React/Svelte/Angular/HTML/ANSI renderer changes
   - `4.plugins/` — Plugin changes
   - `5.reference/` — Public API and options changes

### Documentation Checklist

After each change, ask:
- [ ] Does AGENTS.md reflect the current architecture?
- [ ] Are all public APIs documented in Package Exports Reference?
- [ ] Are the docs pages accurate and up-to-date?
