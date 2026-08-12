---
title: Shiki (Highlight)
description: Plugin for syntax highlighting code blocks using Shiki with multi-theme support.
seo:
  title: Syntax Highlighting using Shiki
navigation:
  icon: i-lucide-code
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /api/parse
    color: neutral
    variant: soft
  - label: Twoslash
    icon: i-simple-icons-typescript
    to: /kb/twoslash
    color: neutral
    variant: soft
  - label: Custom Pre
    icon: i-lucide-clipboard-copy
    to: /kb/custom-code-block
    color: neutral
    variant: soft
---

The `comark/plugins/shiki` plugin provides syntax highlighting for code blocks using [Shiki](https://shiki.style/). It supports multiple themes, line highlighting, and dual light/dark palettes.

::note
`comark/plugins/highlight` is a **deprecated alias** of `comark/plugins/shiki` and will be removed in the next major version. Prefer `import shiki from 'comark/plugins/shiki'`.
::

For a lighter alternative (no TextMate grammars), see [`comark/plugins/rangi`](/plugins/built-in/rangi).

## Installation

`shiki` is a peer dependency — install it alongside Comark:

```bash [terminal]
npm install shiki
```

For explicit theme/language imports (recommended for tree-shaking and the `core` entry), also install the standalone packages:

```bash [terminal]
npm install @shikijs/themes @shikijs/langs
```

| Package | When you need it |
|---|---|
| `shiki` | Always — peer dependency of the plugin |
| [`@shikijs/themes`](https://www.npmjs.com/package/@shikijs/themes) | Importing themes like `@shikijs/themes/github-dark` |
| [`@shikijs/langs`](https://www.npmjs.com/package/@shikijs/langs) | Importing languages like `@shikijs/langs/typescript` |

::tip
The standard entry ships Material themes + a default language set, so you can call `shiki()` with no options after installing only `shiki`. Install `@shikijs/themes` / `@shikijs/langs` when you pass custom `themes` / `languages`, or when you use `comark/plugins/shiki/core`.
::

## Usage

### Standard entry

Zero-config — defaults cover Material light/dark and common languages (`vue`, `tsx`, `svelte`, `astro`, `typescript`, `javascript`, `bash`, `json`, `yaml`, plus Comark/`mdc`):

```typescript
import { parseMarkdown } from 'comark'
import shiki from 'comark/plugins/shiki'

const result = await parseMarkdown(content, {
  plugins: [shiki()]
})
```

Override themes (import from `@shikijs/themes`):

```typescript
import { parseMarkdown } from 'comark'
import shiki from 'comark/plugins/shiki'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

const result = await parseMarkdown(content, {
  plugins: [
    shiki({
      themes: {
        light: githubLight,
        dark: githubDark
      }
    })
  ]
})
```

### Core entry (minimal bundle)

To keep default theme/language chunks out of the bundle entirely, use `core`. `themes` and `languages` are **required** (`ShikiCoreOptions`) — there are no `registerDefault*` flags:

```typescript
import shiki from 'comark/plugins/shiki/core'
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

const plugins = [
  shiki({
    languages: [javascript, typescript],
    themes: { light: githubLight, dark: githubDark },
  })
]
```

Framework packages expose the same nested entry, for example `@comark/vue/plugins/shiki/core` and `@comark/react/plugins/shiki/core`.

The Comark TextMate grammar can also be imported independently from the plugin-owned language entry:

```typescript
import comarkLanguages, { comarkLanguage } from 'comark/plugins/shiki/language'
```

The default export includes the Comark grammar and its Markdown, YAML, and HTML dependencies, ready to pass to Shiki. This entry does not import rangi.

With framework components:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import shiki from '@comark/vue/plugins/shiki'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

const plugins = [
  shiki({
    themes: { light: githubLight, dark: githubDark }
  })
]
</script>

<template>
  <Suspense>
    <Markdown :plugins="plugins">{{ content }}</Markdown>
  </Suspense>
</template>

<style scoped>
html.dark .shiki :deep(span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
```

```tsx [React]
import { Markdown } from '@comark/react'
import shiki from '@comark/react/plugins/shiki'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

<Markdown
  plugins={[shiki({ themes: { light: githubLight, dark: githubDark } })]}
>
  {content}
</Markdown>
```

::

---

## Features

### Dual-Theme Support

Highlight code with different themes for light and dark modes. Both palettes are embedded as CSS custom properties, so there is no flash on theme switch. See all [available themes →](https://shiki.style/themes)

```typescript
shiki({
  themes: {
    light: githubLight,
    dark: githubDark
  }
})
```

### Language Detection

Comark reads the language from the code fence info string and highlights accordingly. On the standard entry, the default language set is pre-registered; pass extra grammars via `languages` (from `@shikijs/langs`). On `core`, only the languages you pass are available. See all [180+ supported languages →](https://shiki.style/languages)

````markdown
```typescript
const x: number = 42
```
````

### Line Highlighting

Highlight specific lines using `{line-numbers}` syntax:

````markdown
```javascript {2-3,5}
function example() {
  const a = 1  // highlighted
  const b = 2  // highlighted
  const c = 3
  return a + b + c  // highlighted
}
```
````

Lines receive the `.highlight` class; see [Styling](#styling) for the required CSS.

### Filename Metadata

Display a filename label above the code block:

````markdown
```javascript [server.js]
const app = express()
```
````

### Language Loading

Install `@shikijs/langs` and import grammars to register extra languages (or all languages on `core`):

```bash [terminal]
npm install @shikijs/langs
```

```typescript
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
import python from '@shikijs/langs/python'

shiki({
  languages: [javascript, typescript, python]
})
```

::tip
**Standard:** default languages are pre-registered; `languages` merges on top. Use `registerDefaultLanguages: false` to replace the set entirely.
**Core:** no defaults — `languages` is required and is the full set (plus the built-in Comark/`mdc` grammar).
::

### Transformers

Pass any [Shiki transformer](https://shiki.style/guide/transformers) via `transformers` to add diff annotations, focus lines, or custom classes:

```typescript
import { transformerNotationDiff } from '@shikijs/transformers'

shiki({
  themes: { light: githubLight, dark: githubDark },
  transformers: [transformerNotationDiff()]
})
```

The most powerful transformer is [`@shikijs/twoslash`](/kb/twoslash): it runs the TypeScript compiler on your code blocks to add inline type tooltips and error annotations.

### Pre Styles

Set `preStyles: true` to add inline background and foreground colors to `<pre>` elements based on the active theme.

---

## API

### `shiki(options?)` — standard entry

```typescript
import shiki from 'comark/plugins/shiki'
// shiki(options?: ShikiOptions): ComarkPlugin
```

Returns a `ComarkPlugin` with bundled Material themes and the default language set. Options are optional.

### `shiki(options)` — core entry

```typescript
import shiki from 'comark/plugins/shiki/core'
// shiki(options: ShikiCoreOptions): ComarkPlugin
```

Returns a `ComarkPlugin` with **no** bundled themes or languages. `themes` and `languages` are required. Import them from `@shikijs/themes` and `@shikijs/langs`.

---

## Options

Two option types, one per entry:

- **`ShikiOptions`** — `comark/plugins/shiki` (standard). Themes/languages optional; includes `registerDefaultThemes` / `registerDefaultLanguages`.
- **`ShikiCoreOptions`** — `comark/plugins/shiki/core`. `themes` and `languages` are **required**; no `registerDefault*` options (nothing is bundled by default).

### Standard (`ShikiOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| [`themes`](#options-themes) | `object` | Material themes | Light and dark theme registrations |
| [`languages`](#options-languages) | `LanguageRegistration[]` | `undefined` | Extra languages (merged onto the default set) |
| [`transformers`](#options-transformers) | `ShikiTransformer[]` | `undefined` | Shiki transformers applied to every block |
| [`preStyles`](#options-prestyles) | `boolean` | `false` | Add inline background/foreground styles to `<pre>` |
| [`registerDefaultLanguages`](#options-registerdefaultlanguages) | `boolean` | `true` | Register the built-in default language set |
| [`registerDefaultThemes`](#options-registerdefaultthemes) | `boolean` | `true` | Register the built-in Material themes |

### Core (`ShikiCoreOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `themes` | `object` | **required** | Light and/or dark theme registrations |
| `languages` | `LanguageRegistration[]` | **required** | Languages to register |
| `transformers` | `ShikiTransformer[]` | `undefined` | Shiki transformers applied to every block |
| `preStyles` | `boolean` | `false` | Add inline background/foreground styles to `<pre>` |

### `themes`

Theme configuration for light and dark modes. Install [`@shikijs/themes`](https://www.npmjs.com/package/@shikijs/themes) and import from there:

```bash [terminal]
npm install @shikijs/themes
```

```typescript
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

shiki({
  themes: {
    light: githubLight,
    dark: githubDark
  }
})
```

**Standard default:** `{ light: materialThemeLighter, dark: materialThemePalenight }` (when `registerDefaultThemes` is true). **Core:** required (at least one of `light` / `dark`).

### `languages`

Languages to register. Install [`@shikijs/langs`](https://www.npmjs.com/package/@shikijs/langs) and import from there. On the standard entry, values are merged on top of the default set when `registerDefaultLanguages` is true.

```bash [terminal]
npm install @shikijs/langs
```

```typescript
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'

shiki({
  languages: [javascript, typescript]
})
```

**Standard default:** `undefined` (default set still registered via `registerDefaultLanguages`). **Core:** required.

### `transformers`

An array of [Shiki transformers](https://shiki.style/guide/transformers) applied to every highlighted block.

```typescript
import { transformerNotationDiff, transformerNotationHighlight } from '@shikijs/transformers'

shiki({
  transformers: [
    transformerNotationDiff(),       // [!code ++] / [!code --]
    transformerNotationHighlight(),  // [!code highlight]
  ]
})
```

**Default:** `undefined`

### `preStyles`

Add inline background and foreground color styles to `<pre>` elements based on the active theme.

```typescript
shiki({ preStyles: true })
```

**Default:** `false`

### `registerDefaultLanguages`

Standard entry only. When `true`, these languages are pre-registered: `vue`, `tsx`, `svelte`, `astro`, `typescript`, `javascript`, `bash`, `json`, `yaml` (plus the built-in Comark/`mdc` grammar). Set to `false` to control the language set entirely via `languages`.

```typescript
shiki({
  registerDefaultLanguages: false,
  languages: [javascript, typescript]
})
```

**Default:** `true`

### `registerDefaultThemes`

Standard entry only. When `true`, registers `material-theme-lighter` (light) and `material-theme-palenight` (dark). Set it to `false` to skip loading those themes at runtime. To keep their import chunks out of a consumer bundle entirely, use `comark/plugins/shiki/core` instead.

```typescript
shiki({
  registerDefaultThemes: false,
  themes: { light: githubLight, dark: githubDark }
})
```

**Default:** `true`

---

## Examples

### GitHub Theme

```typescript
import { parseMarkdown } from 'comark'
import shiki from 'comark/plugins/shiki'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

const result = await parseMarkdown(content, {
  plugins: [shiki({ themes: { light: githubLight, dark: githubDark } })]
})
```

### Minimal Bundle

Install the standalone Shiki packages, use the `core` entry (`ShikiCoreOptions`), and import only what you need — `languages` and `themes` are required, and no defaults are bundled:

```bash [terminal]
npm install shiki @shikijs/langs @shikijs/themes
```

```typescript
import shiki from 'comark/plugins/shiki/core'
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
import githubDark from '@shikijs/themes/github-dark'

shiki({
  languages: [javascript, typescript],
  themes: { dark: githubDark }
})
```

### With Transformers

```typescript
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
} from '@shikijs/transformers'

shiki({
  themes: { light: githubLight, dark: githubDark },
  transformers: [
    transformerNotationDiff(),       // [!code ++] / [!code --]
    transformerNotationHighlight(),  // [!code highlight]
    transformerNotationFocus(),      // [!code focus]
  ]
})
```

See the [Twoslash guide](/kb/twoslash) for TypeScript-powered type tooltips and error annotations in code blocks.

::tip{to="/kb/custom-code-block"}
Need a copy button or collapse threshold on a custom `ProsePre`? After highlighting there is no `code` prop — reconstruct the source with `__node` and `textContent()`.
::

### Live Examples

::card{icon="i-lucide-code" title="Vue + Vite Highlight" to="https://github.com/comarkjs/comark/tree/main/examples/3.plugins/vue-vite-highlight"}
Dual-theme support, 10+ languages, theme toggle. Includes JavaScript, TypeScript, Python, Rust, Go, SQL and more.
::

::card{icon="i-simple-icons-typescript" title="Vue + Vite Twoslash" to="https://github.com/comarkjs/comark/tree/main/examples/3.plugins/vue-vite-twoslash"}
Browser-side twoslash with CDN-fetched TypeScript types and interactive type popups.
::

---

## Styling

Shiki outputs tokens as `<span class="line">` elements inside a `<pre class="shiki">` block.

### Line Highlight

Lines set with `{1,3-5}` syntax receive the `.highlight` class:

```css
.shiki span.line.highlight {
  background-color: rgba(255, 255, 0, 0.1);
  display: inline-block;
  width: calc(100% + 2rem);
  margin: 0 -1rem;
  padding: 0 1rem;
}
```

### Dark Mode

When both `light` and `dark` themes are provided, Shiki embeds both palettes as CSS custom properties on every `<span>`. Activate the dark palette based on your project's dark-mode class:

```css
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
```

In Vue scoped styles, use `:deep()` to reach Shiki spans:

```vue
<style scoped>
html.dark .shiki :deep(span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
```
