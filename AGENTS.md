# Agent Instructions

This document provides guidance for AI agents working on the comark monorepo.

## Project Overview

This is a **monorepo** containing multiple packages related to Comark (Components in Markdown) syntax parsing. The main package is `comark`.

**comark** is a Components in Markdown (Comark) parser that extends standard Markdown with component syntax. It provides:

- Fast synchronous and async parsing via markdown-it
- Streaming support for real-time/incremental parsing
- Vue and React renderers
- Syntax highlighting via Shiki
- Auto-close utilities for incomplete markdown (useful for AI streaming)

## Monorepo Structure

```
/                         # Root workspace
├── packages/             # All publishable packages
│   ├── comark/           # Main Comark parser package
│   ├── comark-cjk/       # CJK support plugin (@comark/cjk)
│   └── comark-math/      # Math formula support (@comark/math)
├── examples/             # Example applications
│   ├── vue-vite/         # Vue 3 + Vite + Tailwind CSS v4
│   ├── react-vite/       # React 19 + Vite + Tailwind CSS v4
│   ├── nuxt/             # Nuxt example
│   ├── nuxt-ui/          # Nuxt UI example
│   └── react-vite-stream/ # React streaming example
├── docs/                 # Documentation site (Docus-based)
├── playground/           # Development playground
├── skills/               # AI agent skills definitions
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
│   ├── index.ts              # Core parser: parse(), parse(), autoCloseMarkdown()
│   ├── string.ts             # String rendering: renderHTML(tree, options?), renderMarkdown()
│   ├── stream.ts             # Streaming: parseStream(), parseStreamIncremental()
│   ├── types.ts              # TypeScript interfaces (ParseOptions, etc.)
│   ├── ast/                  # Comark AST types and utilities
│   │   ├── index.ts          # Re-exports (comark/ast entry point)
│   │   ├── types.ts          # ComarkTree, ComarkNode, ComarkElement, ComarkText
│   │   └── utils.ts          # textContent(), visit() tree utilities
│   ├── internal/             # Internal implementation (not exported)
│   │   ├── front-matter.ts   # YAML frontmatter parsing/rendering
│   │   ├── yaml.ts           # YAML serialization utilities
│   │   ├── props-validation.ts # Component props validation
│   │   ├── parse/            # Parsing pipeline
│   │   │   ├── token-processor.ts     # markdown-it token → Comark AST conversion
│   │   │   ├── auto-close.ts          # Auto-close incomplete markdown/Comark
│   │   │   ├── auto-unwrap.ts         # Remove unnecessary <p> wrappers
│   │   │   ├── table-of-contents.ts   # TOC generation
│   │   │   ├── shiki-highlighter.ts   # Syntax highlighting via Shiki
│   │   │   └── markdown-it-task-lists-mdc.ts # Task list plugin
│   │   └── stringify/        # AST → string rendering
│   │       ├── index.ts      # Main stringify entry
│   │       ├── state.ts      # Rendering state management
│   │       ├── types.ts      # Stringify type definitions
│   │       ├── attributes.ts # Attribute serialization
│   │       ├── indent.ts     # Indentation handling
│   │       └── handlers/     # Per-element render handlers (a, p, pre, heading, etc.)
│   ├── vue/                  # Vue components
│   │   ├── index.ts          # Vue entry point (comark/vue)
│   │   └── components/
│   │       ├── Comark.ts     # High-level markdown → render component
│   │       ├── ComarkAst.ts  # Low-level AST → render component
│   │       ├── index.ts      # Component re-exports
│   │       └── prose/
│   │           └── ProsePre.vue # Code block prose component
│   ├── react/                # React components
│   │   ├── index.ts          # React entry point (comark/react)
│   │   └── components/
│   │       ├── Comark.tsx    # High-level markdown → render component
│   │       ├── ComarkAst.tsx # Low-level AST → render component
│   │       ├── index.tsx     # Component re-exports
│   │       └── prose/
│   │           └── ProsePre.tsx # Code block prose component
│   └── utils/
│       └── caret.ts          # Caret/cursor utilities
├── test/                 # Vitest test files
├── SPEC/                 # Markdown spec test files (CommonMark, GFM, MDC)
├── package.json          # Package manifest
├── tsconfig.json         # TypeScript config
├── build.config.mjs      # Build configuration (obuild)
└── vitest.config.ts      # Test configuration
```

## Package: @comark/cjk

CJK (Chinese, Japanese, Korean) support plugin. Located at `packages/comark-cjk/`:

```
packages/comark-cjk/
├── src/
│   └── index.ts          # Plugin export
├── test/                 # Vitest test files (23 tests)
├── package.json          # Package manifest
├── tsconfig.json         # TypeScript config
├── build.config.mjs      # Build configuration
└── vitest.config.ts      # Test configuration
```

### Usage

```typescript
import { parse } from 'comark'
import cjkPlugin from '@comark/cjk'

const result = await parse('中文内容 **加粗**', { plugins: [cjkPlugin()] })
```

### Features

- Improved line breaking between CJK and non-CJK characters
- Better handling of soft line breaks in CJK text
- Full support for CJK in all Comark features (headings, lists, components, etc.)

## Package: @comark/math

Math formula support for Comark using KaTeX. Located at `packages/comark-math/`:

```
packages/comark-math/
├── src/
│   ├── index.ts          # Core math utilities
│   ├── vue.ts            # Vue component
│   └── react.tsx         # React component
├── test/                 # Vitest test files
├── package.json          # Package manifest
├── tsconfig.json         # TypeScript config
├── build.config.mjs      # Build configuration
└── vitest.config.ts      # Test configuration
```

### Usage

**Vue:**
```vue
<script setup>
import { Comark } from 'comark/vue'
import mathPlugin from '@comark/math'
import { Math } from '@comark/math/vue'

const components = { math: Math }
const markdown = `
# Math Examples

Inline math: $E = mc^2$

Display math:
$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
`
</script>

<template>
  <Comark :markdown="markdown" :components="components" :options="{ plugins: [mathPlugin()] }" />
</template>
```

**React:**
```tsx
import { Comark } from 'comark/react'
import mathPlugin from '@comark/math'
import { Math } from '@comark/math/react'

const components = { math: Math }
const markdown = `
Inline math: $E = mc^2$

Display math:
$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
`

<Comark markdown={markdown} components={components} options={{ plugins: [mathPlugin()] }} />
```

**Code blocks:**
````markdown
```math
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
```
````

### Features

- Inline math with `$...$` syntax (tokenized during parsing via markdown-it plugin)
- Display math with `$$...$$` syntax (tokenized during parsing via markdown-it plugin)
- Code blocks with `math` language
- HTML output via KaTeX with built-in styling
- Supports full LaTeX math syntax via KaTeX
- Vue and React components for easy integration
- Automatic tokenization at parse time (not render time) for performance

## Package Exports

```typescript
// Core parsing
import { parse, parse, autoCloseMarkdown } from 'comark'

// String rendering (HTML & Markdown)
import { renderHTML, renderMarkdown } from 'comark/string'
import type { RenderHTMLOptions, ComponentRenderFn, RenderHTMLContext } from 'comark/string'

// AST types and utilities
import type { ComarkTree, ComarkNode, ComarkElement, ComarkText } from 'comark/ast'
import { textContent, visit } from 'comark/ast'

// Stream parsing
import { parseStream, parseStreamIncremental } from 'comark/stream'

// Vue components
import { Comark } from 'comark/vue'

// React components
import { Comark } from 'comark/react'
```

## Coding Principles

### Performance First

1. **Avoid regex when possible** - Use character-by-character scanning for O(n) algorithms
2. **Linear time complexity** - Strive for O(n) operations, avoid nested loops that could be O(n²) or worse
3. **Minimize allocations** - Reuse arrays/objects, avoid creating unnecessary intermediate structures

Example from auto-close.ts:
```typescript
// Good: Single-pass character scan in O(n)
for (let i = 0; i < len; i++) {
  const ch = line[i]
  if (ch === '*') asteriskCount++
  // ...
}

// Avoid: Regex that may have backtracking
const matches = line.match(/\*+/g)  // Don't do this
```

### TypeScript Conventions

1. Use explicit types for function parameters and return values
2. Export types alongside functions for consumer convenience
3. Use `Record<string, any>` for component props maps
4. Prefer interfaces over type aliases for object shapes

### Code Organization

1. Keep internal implementation in `packages/comark/src/internal/` (parsing in `internal/parse/`, stringification in `internal/stringify/`)
2. AST types and utilities in `packages/comark/src/ast/`
3. Framework-specific code in `packages/comark/src/vue/` and `packages/comark/src/react/`
4. Export public APIs from entry points (`index.ts`, `stream.ts`, `ast/index.ts`)
5. Document exported functions with JSDoc including `@example`

## Testing Guidelines

Tests are in `packages/comark/test/` using Vitest:

```bash
pnpm test                                          # Run all package tests
cd packages/comark && pnpm test                # Run comark tests
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

  it('should handle edge case', () => {
    // Test edge cases explicitly
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

Synchronous parsing of Comark content:

```typescript
const result = await parse(markdownContent, {
  autoUnwrap: true,   // Remove <p> wrappers from single-paragraph containers
  autoClose: true,    // Auto-close incomplete syntax
})

result.body   // ComarkTree - Parsed AST
result.data   // Frontmatter data object
result.toc    // Table of contents
```

### parseStreamIncremental(stream, options)

For real-time streaming (e.g., AI chat):

```typescript
for await (const result of parseStreamIncremental(stream)) {
  // result.body - Current AST state (with auto-closed syntax)
  // result.chunk - Current chunk text
  // result.isComplete - Whether stream finished
}
```

### autoCloseMarkdown(markdown)

Closes unclosed inline syntax and Comark components:

```typescript
autoCloseMarkdown('**bold text')     // '**bold text**'
autoCloseMarkdown('::alert\nContent') // '::alert\nContent\n::'
```

## Comark AST Format

The parser outputs Comark AST - a compact array-based format. Types are defined in `packages/comark/src/ast/types.ts`:

```typescript
type ComarkText = string

type ComarkElementAttributes = {
  [key: string]: unknown
}

type ComarkElement = [string, ComarkElementAttributes, ...ComarkNode[]]

type ComarkNode = ComarkElement | ComarkText

type ComarkTree = {
  type: 'comark'
  value: ComarkNode[]
}
```

Example:
```typescript
// Input: "# Hello **World**"
// Output:
{
  type: 'comark',
  value: [
    ['h1', { id: 'hello' }, 'Hello ', ['strong', {}, 'World']]
  ]
}
```

## Vue/React Components

### Comark Component (High-level)

Accepts markdown string, handles parsing internally.

**Vue** (requires `<Suspense>` wrapper since Comark is async):

```vue
<Suspense>
  <Comark :markdown="content" :components="customComponents" />
</Suspense>
```

**React**:

```tsx
<Comark markdown={content} components={customComponents} />
```

## Common Tasks

### Adding a new utility function

1. Create file in `packages/comark/src/internal/` (or `src/ast/` for AST utilities)
2. Export from `packages/comark/src/index.ts` if public API
3. Add tests in `packages/comark/test/`
4. Document with JSDoc

### Modifying the parser

1. Token processing is in `packages/comark/src/internal/parse/token-processor.ts`
2. Test with `packages/comark/test/index.test.ts`
3. Check streaming still works with `packages/comark/test/stream.test.ts`

### Adding component features

1. Vue components in `packages/comark/src/vue/components/`
2. React components in `packages/comark/src/react/components/`
3. Both should have similar APIs for consistency

### Adding a new package

1. Create directory in `packages/`
2. Add `package.json` with appropriate name and dependencies
3. Use `workspace:*` protocol for local package dependencies
4. Package is automatically included via `pnpm-workspace.yaml`

## Scripts

Root workspace scripts:

```bash
pnpm dev          # Alias for dev:vue
pnpm dev:vue      # Run Vue example (Vite)
pnpm dev:react    # Run React example (Vite)
pnpm docs         # Run documentation site
pnpm build        # Build all packages
pnpm test         # Run all package tests
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript check
pnpm verify       # Run lint + test + typecheck
```

Package-specific scripts (from `packages/comark/`):

```bash
pnpm build        # Build the package (obuild)
pnpm test         # Run package tests (vitest)
pnpm release      # Release the package
pnpm release:dry  # Dry run release
```

## Releasing

Uses [release-it](https://github.com/release-it/release-it) with conventional changelog.

### Release all packages (synced versions)

```bash
pnpm release          # Interactive release
pnpm release:dry      # Dry run to preview
```

This will:
1. Run `pnpm verify` (lint, test, typecheck)
2. Bump version in root and all packages
3. Generate/update CHANGELOG.md
4. Create git tag and GitHub release

### Release individual package

```bash
cd packages/comark
pnpm release          # Release comark only

cd packages/comark-cjk
pnpm release          # Release @comark/cjk only
```

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

## Examples

Interactive examples are in `examples/`:

### Vue/Vite Example (`examples/vue-vite/`)

```bash
pnpm dev:vue
```

Features:
- Editor mode with live preview
- Custom component registration (alert)
- Light/dark mode support via Tailwind CSS v4
- Uses `<Suspense>` wrapper for async Comark component

Key files:
- `examples/vue-vite/src/App.vue` - Main app with editor
- `examples/vue-vite/src/components/Alert.vue` - Custom alert component

### React/Vite Example (`examples/react-vite/`)

```bash
pnpm dev:react
```

Features:
- Same feature set as Vue example
- Uses React hooks (useState, useMemo)
- Custom component registration

Key files:
- `examples/react-vite/src/App.tsx` - Main app
- `examples/react-vite/src/components/Alert.tsx` - Custom alert component

## Documentation Maintenance

**Important:** After completing any feature, bug fix, or significant change, update the relevant documentation:

### What to Update

1. **AGENTS.md** (this file)
   - Update architecture section if new files/modules added
   - Update package exports if new public APIs
   - Add new APIs to the Key APIs section
   - Update common tasks if workflows change

2. **Skills** (`skills/mdc/`)
   - Update `SKILL.md` if syntax or usage changes
   - Update reference files in `skills/mdc/references/` for:
     - `markdown-syntax.md` - Comark changes
     - `parsing-ast.md` - Parser API or AST format changes
     - `rendering-vue.md` - Vue component changes
     - `rendering-react.md` - React component changes

3. **Documentation** (`docs/content/`)
   - Update relevant docs pages:
     - `1.getting-started/` - Installation or quick start changes
     - `2.syntax/` - Comark changes
     - `3.rendering/` - Vue/React renderer changes
     - `4.api/` - API changes (parse, auto-close, reference)

### When to Update

- **New feature**: Update all three (AGENTS.md, skills, docs)
- **Bug fix**: Update docs if it changes expected behavior
- **API change**: Update AGENTS.md and docs API reference
- **Internal refactor**: Update AGENTS.md architecture if structure changes

### Documentation Checklist

After each change, ask:
- [ ] Does AGENTS.md reflect the current architecture?
- [ ] Are all public APIs documented in Key APIs?
- [ ] Do the skills references match current behavior?
- [ ] Are the docs pages accurate and up-to-date?


