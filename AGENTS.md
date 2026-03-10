# Agent Instructions

This document provides guidance for AI agents working on the comark monorepo.

## Project Overview

This is a **monorepo** containing multiple packages related to Comark (Components in Markdown) syntax parsing. The main package is `comark`.

**comark** is a Components in Markdown (Comark) parser that extends standard Markdown with component syntax. It provides:

- Fast synchronous and async parsing via markdown-it
- Streaming support for real-time/incremental parsing
- Vue, React and Svelte renderers
- Syntax highlighting via Shiki
- Auto-close utilities for incomplete markdown (useful for AI streaming)

## Monorepo Structure

```
/                         # Root workspace
├── packages/             # All publishable packages
│   ├── comark/           # Main Comark parser + core plugins
│   ├── comark-vue/       # Vue renderer + plugins (@comark/vue)
│   ├── comark-react/     # React renderer + plugins (@comark/react)
│   ├── comark-svelte/    # Svelte renderer + plugins (@comark/svelte)
│   └── comark-nuxt/      # Nuxt module (@comark/nuxt)
├── examples/             # Example applications
│   ├── 1.vue-vite/       # Vue + Vite + Tailwind CSS v4
│   ├── 2.react-vite/     # React 19 + Vite + Tailwind CSS v4
│   └── 3.plugins/        # Plugin examples (vue-vite-math, vue-vite-mermaid)
├── docs/                 # Documentation site (Docus-based)
├── scripts/              # Build/sync scripts
├── pnpm-workspace.yaml   # Workspace configuration
├── tsconfig.json         # Root TypeScript config
├── eslint.config.mjs     # ESLint configuration
└── package.json          # Root package (private, scripts only)
```

## Package: comark

Located at `packages/comark/`:

```
packages/comark/
├── src/
│   ├── index.ts              # Core parser: parse(), autoCloseMarkdown()
│   ├── string.ts             # String rendering: renderHTML(), renderMarkdown()
│   ├── types.ts              # TypeScript interfaces (ParseOptions, etc.)
│   ├── ast/                  # Comark AST types and utilities
│   │   ├── index.ts          # Re-exports (comark/ast entry point)
│   │   ├── types.ts          # ComarkTree, ComarkNode, ComarkElement, ComarkText
│   │   └── utils.ts          # textContent(), visit() tree utilities
│   ├── plugins/              # Built-in and optional plugins
│   │   ├── alert.ts          # Alert/callout blocks
│   │   ├── emoji.ts          # Emoji shortcodes
│   │   ├── highlight.ts      # Syntax highlighting via Shiki (peer: shiki)
│   │   ├── math.ts           # LaTeX math via KaTeX (peer: katex)
│   │   ├── mermaid.ts        # Mermaid diagrams (peer: beautiful-mermaid)
│   │   ├── security.ts       # XSS/security sanitization
│   │   ├── summary.ts        # Summary extraction
│   │   ├── task-list.ts      # GFM task lists
│   │   └── toc.ts            # Table of contents
│   └── internal/             # Internal implementation (not exported)
│       ├── front-matter.ts
│       ├── parse/            # Parsing pipeline
│       └── stringify/        # AST → string rendering
├── test/                 # Vitest test files
├── package.json
└── tsconfig.build.json
```

### Peer dependencies

| Peer | Required by |
|------|-------------|
| `shiki` | `comark/plugins/highlight` |
| `katex` | `comark/plugins/math` |
| `beautiful-mermaid` | `comark/plugins/mermaid` |

All are optional — only install what you use.

## Package: @comark/vue

Located at `packages/comark-vue/`. Vue 3 renderer with framework-specific plugin wrappers.

```
packages/comark-vue/
├── src/
│   ├── index.ts              # Entry point
│   ├── components/
│   │   ├── Comark.ts         # High-level markdown → render component
│   │   ├── ComarkRenderer.ts # Low-level AST → render component
│   │   ├── Math.ts           # Math rendering component
│   │   └── Mermaid.ts        # Mermaid rendering component
│   └── plugins/
│       ├── math.ts           # Re-exports comark/plugins/math + Math component
│       └── mermaid.ts        # Re-exports comark/plugins/mermaid + Mermaid component
├── package.json
└── tsconfig.build.json
```

### Exports

```json
{
  ".": "./dist/index.js",
  "./plugins/*": "./dist/plugins/*.js"
}
```

### Usage

```typescript
import { Comark, ComarkRenderer, defineComarkComponent } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
```

## Package: @comark/react

Located at `packages/comark-react/`. React renderer with framework-specific plugin wrappers.

```
packages/comark-react/
├── src/
│   ├── index.ts              # Entry point
│   ├── components/
│   │   ├── Comark.tsx        # High-level markdown → render component
│   │   ├── ComarkRenderer.tsx # Low-level AST → render component
│   │   ├── Math.tsx          # Math rendering component
│   │   └── Mermaid.tsx       # Mermaid rendering component
│   └── plugins/
│       ├── math.ts           # Re-exports comark/plugins/math + Math component
│       └── mermaid.ts        # Re-exports comark/plugins/mermaid + Mermaid component
├── package.json
└── tsconfig.build.json
```

### Exports

```json
{
  ".": "./dist/index.js",
  "./plugins/*": "./dist/plugins/*.js"
}
```

### Usage

```typescript
import { Comark, ComarkRenderer, defineComarkComponent } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'
import mermaid, { Mermaid } from '@comark/react/plugins/mermaid'
```

## Package: @comark/svelte

Svelte 5 renderer for Comark. Located at `packages/comark-svelte/`:

```
packages/comark-svelte/
├── src/
│   ├── index.ts              # Entry point (@comark/svelte)
│   ├── types.ts              # Shared prop interfaces
│   ├── Comark.svelte         # High-level markdown → render ($state + $effect)
│   ├── ComarkAsync.svelte    # High-level markdown → render (experimental await)
│   ├── ComarkRenderer.svelte # Low-level AST → render component
│   ├── ComarkNode.svelte     # Recursive AST node renderer
│   ├── async/index.ts        # Async export (@comark/svelte/async)
│   └── plugins/
│       ├── math.ts           # Re-exports comark/plugins/math
│       ├── Math.svelte       # Math rendering component
│       ├── mermaid.ts        # Re-exports comark/plugins/mermaid
│       └── Mermaid.svelte    # Mermaid rendering component
├── svelte.config.js          # Svelte config (experimental.async enabled)
├── vitest.config.ts          # Dual test config (server + browser)
└── package.json
```

### Exports

```json
{
  ".": { "svelte": "./dist/index.js" },
  "./async": { "svelte": "./dist/async/index.js" },
  "./plugins/*": { "svelte": "./dist/plugins/*.js" }
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
  import { Comark } from '@comark/svelte'
  import math, { Math } from '@comark/svelte/plugins/math'
  import mermaid, { Mermaid } from '@comark/svelte/plugins/mermaid'
</script>

<Comark markdown={content} components={{ math: Math }} plugins={[math()]} />
```

**Experimental async** (requires `experimental.async` in Svelte config):
```svelte
<script>
  import { ComarkAsync } from '@comark/svelte/async'
</script>
<svelte:boundary>
  <ComarkAsync markdown={content} components={customComponents} />
  {#snippet pending()}
    <p>Loading...</p>
  {/snippet}
</svelte:boundary>
```

## Package Exports Reference

```typescript
// Core parsing
import { parse, autoCloseMarkdown } from 'comark'

// String rendering (HTML & Markdown)
import { renderHTML, renderMarkdown } from 'comark/string'

// AST types and utilities
import type { ComarkTree, ComarkNode, ComarkElement, ComarkText } from 'comark/ast'
import { textContent, visit } from 'comark/ast'

// Core plugins (framework-agnostic)
import highlight from 'comark/plugins/highlight'
import math from 'comark/plugins/math'
import mermaid from 'comark/plugins/mermaid'
import emoji from 'comark/plugins/emoji'
import toc from 'comark/plugins/toc'
import alert from 'comark/plugins/alert'

// Vue — renderer + plugin wrappers (plugin fn + Vue component)
import { Comark, ComarkRenderer, defineComarkComponent } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'

// React — renderer + plugin wrappers (plugin fn + React component)
import { Comark, ComarkRenderer, defineComarkComponent } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'
import mermaid, { Mermaid } from '@comark/react/plugins/mermaid'

// Svelte — renderer + plugin wrappers (plugin fn + Svelte component)
import { Comark, ComarkRenderer } from '@comark/svelte'
import { ComarkAsync } from '@comark/svelte/async' // requires experimental.async
import math, { Math } from '@comark/svelte/plugins/math'
import mermaid, { Mermaid } from '@comark/svelte/plugins/mermaid'
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
2. AST types and utilities in `packages/comark/src/ast/`
3. Core plugins (parser-only) in `packages/comark/src/plugins/`
4. Framework renderers in separate packages (`comark-vue`, `comark-react`, `comark-svelte`)
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

### parse(source, options)

```typescript
const result = await parse(markdownContent, {
  autoUnwrap: true,   // Remove <p> wrappers from single-paragraph containers
  autoClose: true,    // Auto-close incomplete syntax
})

result.nodes       // ComarkNode[]
result.frontmatter // Record<string, any>
result.meta        // Record<string, any>
```

### autoCloseMarkdown(markdown)

```typescript
autoCloseMarkdown('**bold text')     // '**bold text**'
autoCloseMarkdown('::alert\nContent') // '::alert\nContent\n::'
```

## Comark AST Format

```typescript
type ComarkText = string
type ComarkElement = [string, ComarkElementAttributes, ...ComarkNode[]]
type ComarkNode = ComarkElement | ComarkText
type ComarkTree = {
  nodes: ComarkNode[]
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

## Vue/React/Svelte Components

### Comark Component (High-level)

**Vue** (requires `<Suspense>` wrapper since Comark is async):

```vue
<Suspense>
  <Comark :components="customComponents">{{ content }}</Comark>
</Suspense>
```

**React**:

```tsx
<Comark components={customComponents}>{content}</Comark>
```

**Svelte** (stable, uses `$state` + `$effect`):

```svelte
<Comark markdown={content} components={customComponents} />
```

**Svelte** (experimental async — requires `experimental.async` in Svelte config):

```svelte
<svelte:boundary>
  <ComarkAsync markdown={content} components={customComponents} />
  {#snippet pending()}<p>Loading...</p>{/snippet}
</svelte:boundary>
```

### defineComarkComponent (Vue & React)

Creates a pre-configured Comark component with default plugins and components:

```typescript
// Vue
import { defineComarkComponent } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'

export const DocsComark = defineComarkComponent({
  name: 'DocsComark',
  plugins: [math(), mermaid()],
  components: { Math, Mermaid },
})

// React
import { defineComarkComponent } from '@comark/react'
import math, { Math } from '@comark/react/plugins/math'

export const DocsComark = defineComarkComponent({
  name: 'DocsComark',
  plugins: [math()],
  components: { Math },
})
```

## Common Tasks

### Adding a new utility function

1. Create file in `packages/comark/src/internal/`
2. Export from `packages/comark/src/index.ts` if public API
3. Add tests in `packages/comark/test/`
4. Document with JSDoc

### Modifying the parser

1. Token processing is in `packages/comark/src/internal/parse/token-processor.ts`
2. Test with `packages/comark/test/index.test.ts`
3. Check streaming still works with `packages/comark/test/stream.test.ts`

### Adding component features

1. Vue components in `packages/comark-vue/src/components/`
2. React components in `packages/comark-react/src/components/`
3. Svelte components in `packages/comark-svelte/src/`
4. All three should have similar APIs for consistency

### Adding a new core plugin

1. Create `packages/comark/src/plugins/{name}.ts`
2. Available as `comark/plugins/{name}` via the `"./plugins/*"` wildcard export
3. Add framework wrappers if it needs a render component:
   - `packages/comark-vue/src/plugins/{name}.ts` (re-export plugin + Vue component)
   - `packages/comark-react/src/plugins/{name}.ts` (re-export plugin + React component)
   - `packages/comark-svelte/src/plugins/{name}.ts` (re-export plugin + Svelte component)
4. Run `node scripts/sync-plugins.mjs` to sync plain re-exports for plugins without components

### Adding a new package

1. Create directory in `packages/`
2. Add `package.json` with appropriate name and dependencies
3. Use `workspace:*` protocol for local package dependencies
4. Package is automatically included via `pnpm-workspace.yaml`

## Scripts

Root workspace scripts:

```bash
pnpm docs         # Run documentation site
pnpm build        # Build all packages
pnpm test         # Run all package tests
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript check
pnpm verify       # Run lint + test + typecheck
```

Utility scripts:

```bash
node scripts/stub.mjs          # Generate stub dist files for local dev
node scripts/sync-plugins.mjs  # Sync plugin re-exports to framework packages
```

## Releasing

Uses [release-it](https://github.com/release-it/release-it) with conventional changelog.

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
   - `3.rendering/` — Vue/React/Svelte renderer changes
   - `4.plugins/` — Plugin changes

### Documentation Checklist

After each change, ask:
- [ ] Does AGENTS.md reflect the current architecture?
- [ ] Are all public APIs documented in Package Exports Reference?
- [ ] Are the docs pages accurate and up-to-date?
