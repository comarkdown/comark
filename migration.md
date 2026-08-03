# AI Agent Prompt: Migrate a Project Off Removed Comark Deprecated APIs

This file is a **copy-paste prompt for an AI coding agent**.

Use it in **other repositories** that depend on Comark packages (`comark`, `@comark/vue`, `@comark/react`, `@comark/svelte`, `@comark/angular`, `@comark/nuxt`, `@comark/html`, `@comark/ansi`).

It is **not** instructions for editing the Comark monorepo itself.

---

## How to use

1. Upgrade the consumer project’s Comark dependencies to the release that removed deprecated aliases.
2. Open the consumer project in your AI coding agent.
3. Paste everything under **Prompt** below as the task.
4. Let the agent migrate that project’s source, tests, and docs.
5. Review the diff and run the project’s own typecheck/tests.

---

## Prompt

You are migrating **this project** (a consumer of Comark) to a newer Comark major version.

In that release, Comark **removed all deprecated aliases**. Old component names, parser names, AST type aliases, and props no longer exist. Compatibility shims and deprecation warnings are gone — old code fails at compile time or runtime.

Your job:

1. Find every use of removed Comark APIs in **this repository only**.
2. Rewrite them to the current public API.
3. Do not reintroduce aliases or wrappers for old names.
4. Keep app behavior the same. This is a rename migration, not a feature rewrite.
5. Run this project’s typecheck/tests after edits and fix failures caused by the migration.

### Scope

- In scope: app/source code, components, pages, tests, Storybook, local docs/examples, re-export barrels, Nuxt auto-import usage.
- Out of scope: changing Comark package internals, forking Comark, or keeping dual `value ?? tree` / `value ?? markdown` fallbacks.

### Important: what NOT to rename

These are still valid current APIs and must stay:

- Package names: `comark`, `@comark/vue`, `@comark/react`, `@comark/svelte`, `@comark/angular`, `@comark/nuxt`, `@comark/html`, `@comark/ansi`
- Plugin brand APIs: `ComarkPlugin`, `defineComarkPlugin`, `ComarkParseFn`, etc.
- Live context APIs: `createComarkContext`, `ComarkContext`, `comarkKey`, `globalThis.comarkContext`
- CSS hooks: `comark-content`, `comark-stream`
- Markdown syntax: `::component`, attributes, slots
- Local variables named `tree`/`markdown` are fine if they are not the removed **public prop/export** names

---

## Prerequisite

Confirm dependencies are on the new Comark version first (the one that removed aliases). If the project is still on an older version, old names may still typecheck and the migration is incomplete.

Upgrade typically looks like:

```bash
# adjust to the package manager / packages this project uses
pnpm up comark @comark/vue @comark/react @comark/svelte @comark/angular @comark/nuxt @comark/html @comark/ansi
# or npm/yarn equivalents
```

Only migrate packages this project actually depends on.

---

## Complete breaking-change map

### 1) Parser functions (`comark`)

| Removed | Replacement |
|---|---|
| `parse` | `parseMarkdown` |
| `createParse` | `createMarkdownParser` |
| `createSerializedParse` | `createSerializedMarkdownParser` |

```ts
// Before
import { parse, createParse, createSerializedParse } from 'comark'

const tree = await parse(md)
const parseFn = createParse({ autoClose: true })
const serialized = createSerializedParse()

// After
import { parseMarkdown, createMarkdownParser, createSerializedMarkdownParser } from 'comark'

const document = await parseMarkdown(md)
const parseFn = createMarkdownParser({ autoClose: true })
const serialized = createSerializedMarkdownParser()
```

Note: only replace `parse` when it is imported from `comark` / a Comark package. Do not rename unrelated local functions named `parse`.

### 2) AST / document types (`comark`)

| Removed type | Replacement |
|---|---|
| `ComarkTree` | `MarkdownDocument` |
| `ComarkElement` | `ElementNode` |
| `ComarkElementAttributes` | `ElementNodeAttributes` |
| `ComarkText` | `TextNode` |
| `ComarkComment` | `CommentNode` |
| `ComarkNode` | `Node` |

```ts
// Before
import type { ComarkTree, ComarkElement, ComarkText, ComarkNode } from 'comark'

// After
import type { MarkdownDocument, ElementNode, TextNode, Node } from 'comark'
```

### 3) Framework components

| Removed | Replacement | Where |
|---|---|---|
| `Comark` | `Markdown` | `@comark/vue`, `@comark/react`, `@comark/svelte`, Nuxt auto-import |
| `ComarkRenderer` | `MarkdownDocument` | `@comark/vue`, `@comark/react`, `@comark/svelte`, Nuxt auto-import |
| `MarkdownParsed` | `MarkdownDocument` | vue/react/svelte/angular |
| `ComarkClient` | `MarkdownClient` | `@comark/react` |
| `ComarkLive` | `MarkdownLive` | `@comark/react` |
| `ComarkAsync` | `MarkdownAsync` | `@comark/svelte/async` |
| `ComarkNode` (component) | `MarkdownNode` | `@comark/svelte`, `@comark/angular` |
| `ComarkComponent` | `Markdown` | `@comark/angular` |
| `ComarkRendererComponent` | `MarkdownDocument` | `@comark/angular` |
| `ComarkNodeComponent` / `NodeComponent` (Angular Comark node) | `MarkdownNode` | `@comark/angular` |

### 4) Define helpers and prop types

| Removed | Replacement |
|---|---|
| `defineComarkComponent` | `defineMarkdownComponent` |
| `defineComarkRendererComponent` | `defineMarkdownDocumentComponent` |
| `defineMarkdownParsedComponent` | `defineMarkdownDocumentComponent` |
| `DefineComarkComponentOptions` | `DefineMarkdownComponentOptions` |
| `DefineComarkRendererOptions` | `DefineMarkdownDocumentOptions` |
| `DefineMarkdownParsedOptions` | `DefineMarkdownDocumentOptions` |
| `ComarkProps` | `MarkdownProps` |
| `ComarkRendererProps` | `MarkdownDocumentProps` |
| `MarkdownParsedProps` | `MarkdownDocumentProps` |
| `ComarkNodeProps` | `MarkdownNodeProps` |
| `ComarkLiveProps` | `MarkdownLiveProps` |

### 5) Component props

| Removed prop | Replacement | Used on |
|---|---|---|
| `markdown` | `value` | `Markdown`, `MarkdownClient`, `MarkdownAsync`, defined markdown components |
| `tree` | `value` | `MarkdownDocument`, `MarkdownLive`, defined document components |

`value` accepts:

- markdown **string** on high-level markdown components
- parsed **`MarkdownDocument`** on document/renderer components
- string or `MarkdownDocument` on high-level `Markdown`

```tsx
// Before
<Comark markdown={content} />
<ComarkRenderer tree={document} />
<Markdown markdown={content} />
<MarkdownDocument tree={document} />

// After
<Markdown value={content} />
<MarkdownDocument value={document} />
```

```vue
<!-- Before -->
<Comark :markdown="content" />
<ComarkRenderer :tree="document" />

<!-- After -->
<Markdown :value="content" />
<MarkdownDocument :value="document" />
```

```svelte
<!-- Before -->
<Comark markdown={content} />
<ComarkRenderer tree={document} />

<!-- After -->
<Markdown value={content} />
<MarkdownDocument value={document} />
```

### 6) Angular selectors

| Removed selector | Replacement |
|---|---|
| `<comark>` | `<comark-markdown>` |
| `<comark-renderer>` | `<comark-markdown-document>` |
| `<comark-markdown-parsed>` | `<comark-markdown-document>` |
| `<comark-node>` | `<comark-markdown-node>` |

```html
<!-- Before -->
<comark [markdown]="content" [components]="components"></comark>
<comark-renderer [tree]="document"></comark-renderer>
<comark-markdown-parsed [value]="document"></comark-markdown-parsed>

<!-- After -->
<comark-markdown [value]="content" [components]="components"></comark-markdown>
<comark-markdown-document [value]="document"></comark-markdown-document>
```

### 7) Nuxt auto-imports

If this project uses `@comark/nuxt`, these auto-imports are gone:

- components: `Comark`, `ComarkRenderer`
- helpers: `defineComarkComponent`, `defineComarkRendererComponent`

Use:

- components: `Markdown`, `MarkdownDocument`
- helpers: `defineMarkdownComponent`, `defineMarkdownDocumentComponent`

Search templates even when there is no explicit import.

### 8) Deep imports of deleted files

Rewrite any deep imports of removed component files, for example:

- `.../Comark`, `.../ComarkRenderer`
- `.../ComarkClient`, `.../ComarkLive`
- `.../ComarkAsync`, `.../ComarkNode`
- any `internal/deprecation` helper from Comark packages

Prefer package root imports:

```ts
import { Markdown, MarkdownDocument, defineMarkdownComponent } from '@comark/vue'
import { Markdown, MarkdownDocument, MarkdownClient, MarkdownLive } from '@comark/react'
import { Markdown, MarkdownDocument } from '@comark/svelte'
import { MarkdownAsync } from '@comark/svelte/async'
import { Markdown, MarkdownDocument, MarkdownNode } from '@comark/angular'
import { parseMarkdown, type MarkdownDocument } from 'comark'
```

---

## Search checklist

Run these searches across the consumer project:

```text
\bComark\b
ComarkRenderer
ComarkClient
ComarkLive
ComarkAsync
ComarkNode
ComarkComponent
ComarkTree
ComarkElement
ComarkText
ComarkComment
ComarkElementAttributes
MarkdownParsed
defineComarkComponent
defineComarkRendererComponent
defineMarkdownParsedComponent
createParse\b
createSerializedParse\b
from ['"]comark['"]
markdown=
:markdown=
markdown={
\btree=
:tree=
tree={
comark-renderer
comark-markdown-parsed
comark-node
<comark>
```

Also inspect:

- `.vue` / `.tsx` / `.jsx` / `.svelte` / Angular templates
- tests and snapshots
- Storybook stories
- README / internal docs in this project
- Nuxt pages relying on auto-imports
- type-only imports and re-export barrels

When reviewing `\bComark\b` hits, keep package/plugin/context brand names listed in “what NOT to rename”.

---

## Migration procedure

1. **Upgrade deps** to the Comark release that removed aliases.
2. **Inventory** all search hits and group by package/framework.
3. **Rewrite imports/symbols** to replacements.
4. **Rewrite components/selectors** in templates.
5. **Rewrite props**
   - `markdown` → `value`
   - `tree` → `value`
   - remove dual-prop fallbacks
6. **Rewrite types** (`ComarkTree` → `MarkdownDocument`, etc.).
7. **Update this project’s tests/docs/stories**.
8. **Validate with this project’s tooling**
   - typecheck
   - unit/integration tests
   - smoke one real page/route that renders markdown
9. **Done when**
   - no removed symbols/props/selectors remain
   - typecheck/tests pass
   - no compatibility wrappers were added back

---

## Framework examples

### Vue

```vue
<!-- Before -->
<script setup lang="ts">
import { Comark, ComarkRenderer, defineComarkComponent } from '@comark/vue'
import type { ComarkTree } from 'comark'
import { parse } from 'comark'

const tree = await parse(content) as ComarkTree
const Docs = defineComarkComponent({ name: 'Docs' })
</script>

<template>
  <Comark :markdown="content" />
  <ComarkRenderer :tree="tree" />
  <Docs :markdown="content" />
</template>
```

```vue
<!-- After -->
<script setup lang="ts">
import { Markdown, MarkdownDocument, defineMarkdownComponent } from '@comark/vue'
import type { MarkdownDocument as Document } from 'comark'
import { parseMarkdown } from 'comark'

const document = await parseMarkdown(content) as Document
const Docs = defineMarkdownComponent({ name: 'Docs' })
</script>

<template>
  <Markdown :value="content" />
  <MarkdownDocument :value="document" />
  <Docs :value="content" />
</template>
```

### React / Next.js

```tsx
// Before
import { Comark, ComarkRenderer, ComarkClient, ComarkLive, defineComarkComponent } from '@comark/react'
import { parse } from 'comark'

const document = await parse(md)
export const Docs = defineComarkComponent({ name: 'Docs' })

return (
  <>
    <Comark markdown={md} />
    <ComarkRenderer tree={document} />
    <ComarkClient markdown={md} />
    <ComarkLive tree={document} comarkKey="doc" />
  </>
)
```

```tsx
// After
import { Markdown, MarkdownDocument, MarkdownClient, MarkdownLive, defineMarkdownComponent } from '@comark/react'
import { parseMarkdown } from 'comark'

const document = await parseMarkdown(md)
export const Docs = defineMarkdownComponent({ name: 'Docs' })

return (
  <>
    <Markdown value={md} />
    <MarkdownDocument value={document} />
    <MarkdownClient value={md} />
    <MarkdownLive value={document} comarkKey="doc" />
  </>
)
```

### Svelte / SvelteKit

```svelte
<!-- Before -->
<script>
  import { Comark, ComarkRenderer } from '@comark/svelte'
  import { ComarkAsync } from '@comark/svelte/async'
</script>

<Comark markdown={content} />
<ComarkRenderer tree={document} />
<ComarkAsync markdown={content} />
```

```svelte
<!-- After -->
<script>
  import { Markdown, MarkdownDocument } from '@comark/svelte'
  import { MarkdownAsync } from '@comark/svelte/async'
</script>

<Markdown value={content} />
<MarkdownDocument value={document} />
<MarkdownAsync value={content} />
```

### Angular

```ts
// Before
import { ComarkComponent, ComarkRendererComponent, defineComarkComponent } from '@comark/angular'
```

```html
<!-- Before -->
<comark [markdown]="content"></comark>
<comark-renderer [tree]="document"></comark-renderer>
<comark-markdown-parsed [value]="document"></comark-markdown-parsed>
```

```ts
// After
import { Markdown, MarkdownDocument, defineMarkdownComponent } from '@comark/angular'
```

```html
<!-- After -->
<comark-markdown [value]="content"></comark-markdown>
<comark-markdown-document [value]="document"></comark-markdown-document>
```

### Nuxt

```vue
<!-- Before: often auto-imported, no import statement -->
<template>
  <Comark :markdown="content" />
  <ComarkRenderer :tree="document" />
</template>
```

```vue
<!-- After -->
<template>
  <Markdown :value="content" />
  <MarkdownDocument :value="document" />
</template>
```

### Core parser-only usage

```ts
// Before
import { parse, createParse, type ComarkTree } from 'comark'

const parseMarkdownLegacy = createParse()
const tree: ComarkTree = await parse(source)

// After
import { parseMarkdown, createMarkdownParser, type MarkdownDocument } from 'comark'

const parse = createMarkdownParser()
const document: MarkdownDocument = await parseMarkdown(source)
// or: const document = await parse(source)
```

---

## Suggested commit message for the consumer project

```text
refactor: migrate Comark usage to Markdown APIs after deprecated alias removal
```

---

## Final verification in the consumer project

```bash
# leftover search (adjust tool if needed)
rg -n "ComarkRenderer|ComarkClient|ComarkLive|ComarkAsync|MarkdownParsed|defineComarkComponent|defineComarkRendererComponent|ComarkTree|createParse|createSerializedParse|comark-markdown-parsed|comark-renderer" .

# then this project's checks
pnpm typecheck
pnpm test
# or npm/yarn/ vitest/ tsc equivalents used here
```

If removed symbols still typecheck, the project is probably still resolving an older Comark version. Fix dependency versions, reinstall, and rerun the migration.
