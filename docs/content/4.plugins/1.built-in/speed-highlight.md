---
title: Speed Highlight
description: Lightweight syntax highlighting for code blocks using @speed-highlight/core.
seo:
  title: Speed Highlight Plugin
navigation:
  icon: i-lucide-zap
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /api/parse
    color: neutral
    variant: soft
  - label: Shiki Highlight
    icon: i-lucide-code
    to: /plugins/built-in/syntax-highlight
    color: neutral
    variant: soft
  - label: speed-highlight
    icon: i-simple-icons-github
    to: https://github.com/speed-highlight/core
    color: neutral
    variant: soft
---

The `comark/plugins/speed-highlight` plugin highlights code blocks with [`@speed-highlight/core`](https://github.com/speed-highlight/core) — a tiny (~2kB core, ~1kB per language), zero-dependency highlighter. Prefer this when bundle size and cold-start matter more than TextMate grammar depth.

`@speed-highlight/core` is a peer dependency:

```bash [terminal]
npm install @speed-highlight/core
```

::tip
Use [`comark/plugins/shiki`](/plugins/built-in/syntax-highlight) (Shiki) when you need dual themes, transformers, Twoslash, or the full VS Code grammar set. Use `speed-highlight` for a faster, smaller class-based highlighter.
::

## Usage

```typescript
import { parseMarkdown } from 'comark'
import speedHighlight from 'comark/plugins/speed-highlight'

const result = await parseMarkdown(content, {
  plugins: [speedHighlight()]
})
```

With framework components (re-exported via each framework package after `node scripts/sync-plugins.mjs`):

::code-group

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import speedHighlight from '@comark/vue/plugins/speed-highlight'
</script>

<template>
  <Suspense>
    <Markdown :plugins="[speedHighlight()]">{{ content }}</Markdown>
  </Suspense>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import speedHighlight from '@comark/react/plugins/speed-highlight'

<Markdown plugins={[speedHighlight()]}>
  {content}
</Markdown>
```

```svelte [Svelte]
<script>
  import { Markdown } from '@comark/svelte'
  import speedHighlight from '@comark/svelte/plugins/speed-highlight'
  let { content } = $props()
</script>

<Markdown value={content} plugins={[speedHighlight()]} />
```

::

---

## Features

### Class-based tokens

Tokens are emitted as spans with `shj-syn-*` classes (not inline colors), so theming is pure CSS:

````markdown
```js
const x = 1
```
````

Produces a structure like:

```html
<pre class="shj shj-lang-js" language="js">
  <code>
    <span class="line">
      <span class="shj-syn-kwd">const</span>
      x =
      <span class="shj-syn-num">1</span>
    </span>
  </code>
</pre>
```

### Language detection

Comark reads the fence info string and maps common aliases (`javascript` → `js`, `python` → `py`, `shell` → `bash`, …) to [speed-highlight language ids](https://github.com/speed-highlight/core#languages-supported-).

````markdown
```typescript
const x: number = 42
```
````

Unknown language ids are passed through as-is — speed-highlight treats them as unstyled plain text (no throw). A missing/empty fence info string uses `plain`.

### Line highlighting

Highlight specific lines using `{line-numbers}` syntax — same as the Shiki plugin:

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

Highlighted lines receive the `.highlight` class on their `.line` wrapper.

### Filename metadata

Filename labels are preserved on the `<pre>` attributes (from `[name]` fence syntax) for your renderer/components:

````markdown
```javascript [server.js]
const app = express()
```
````

---

## API

### `speedHighlight(options?)`

Returns a `ComarkPlugin` that enables speed-highlight syntax highlighting.

**Parameters:**

- `options?` - Optional configuration, see [Options](#options)

**Returns:** `ComarkPlugin`

### `speedHighlightCodeBlocks(tree, options?)`

Apply highlighting to an existing `MarkdownDocument` without going through `parseMarkdown`.

### `resolveSpeedHighlightLanguage(language, options?)`

Map a fence language string to a speed-highlight language id (aliases + fallback).

### `tokenizeCode(code, language)`

Low-level helper: tokenize source into `{ text, type? }[]` via `@speed-highlight/core`.

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`langAlias`](#langalias) | `Record<string, string>` | built-in map | Extra fence → language id aliases |
| [`lineNumbers`](#linenumbers) | `boolean` | `true` | Wrap each line in `<span class="line">` |
| [`classPrefix`](#classprefix) | `string` | `'shj'` | Class prefix on the highlighted `<pre>` |

### `langAlias`

Extend or override the built-in fence aliases:

```typescript
speedHighlight({
  langAlias: {
    vue: 'html',
    shellsession: 'bash',
  }
})
```

**Built-in aliases include:** `javascript`→`js`, `typescript`→`ts`, `python`→`py`, `rust`→`rs`, `shell`/`sh`/`zsh`→`bash`, `yml`→`yaml`, `markdown`/`mdc`/`comark`→`md`, `text`/`txt`/`plaintext`→`plain`, …

### `lineNumbers`

When `true` (default), each source line is wrapped in `<span class="line">` so `{1,3-5}` highlights can target lines. Set to `false` for a flat token stream:

```typescript
speedHighlight({ lineNumbers: false })
```

**Default:** `true`

### `classPrefix`

Class applied to the `<pre>` together with `shj-lang-<id>`:

```typescript
speedHighlight({ classPrefix: 'code' })
// → class="code shj-lang-js"
```

**Default:** `'shj'`

---

## Examples

### Minimal

```typescript
import { parseMarkdown } from 'comark'
import speedHighlight from 'comark/plugins/speed-highlight'

const result = await parseMarkdown(content, {
  plugins: [speedHighlight()]
})
```

### Custom aliases

```typescript
speedHighlight({
  langAlias: {
    vue: 'html',
    svelte: 'html',
  },
})
```

### With HTML renderer

```typescript
import { createHtmlRenderer } from '@comark/html'
import speedHighlight from '@comark/html/plugins/speed-highlight'

const renderHtml = createHtmlRenderer({
  plugins: [speedHighlight()],
})

const html = await renderHtml('```js\nconsole.log("hi")\n```')
```

### Live Example

::card{icon="i-lucide-zap" title="Vue + Vite Speed Highlight" to="https://github.com/comarkdown/comark/tree/main/examples/3.plugins/vue-vite-speed-highlight"}
Class-based tokens, line highlights, light/dark CSS theme toggle. JavaScript, TypeScript, Python, Rust, Go, SQL, CSS, HTML, Diff, YAML, and more.
::

---

## Styling

speed-highlight tokens use `shj-syn-*` classes. Load a theme stylesheet from the package, or write your own.

### Official themes

```bash [terminal]
# CSS themes ship with the package
node_modules/@speed-highlight/core/dist/themes/default.css
node_modules/@speed-highlight/core/dist/themes/github-dark.css
node_modules/@speed-highlight/core/dist/themes/github-light.css
node_modules/@speed-highlight/core/dist/themes/atom-dark.css
node_modules/@speed-highlight/core/dist/themes/visual-studio-dark.css
node_modules/@speed-highlight/core/dist/themes/github-dim.css
node_modules/@speed-highlight/core/dist/themes/dark.css
```

In a bundler:

```ts
import '@speed-highlight/core/themes/default.css'
// or
import '@speed-highlight/core/themes/github-dark.css'
```

Official themes target `[class*="shj-lang-"]` containers. The plugin sets `class="shj shj-lang-<id>"` on `<pre>` so those selectors match.

### Token classes

| Class | Token |
|---|---|
| `.shj-syn-kwd` | Keywords |
| `.shj-syn-str` | Strings |
| `.shj-syn-num` | Numbers |
| `.shj-syn-func` | Functions |
| `.shj-syn-class` | Classes / types |
| `.shj-syn-cmnt` | Comments |
| `.shj-syn-oper` | Operators |
| `.shj-syn-bool` | Booleans |
| `.shj-syn-var` | Variables |
| `.shj-syn-type` | Type annotations |
| `.shj-syn-insert` / `.shj-syn-deleted` | Diff |
| `.shj-syn-err` | Errors / TODOs |
| `.shj-syn-section` | Sections |
| `.shj-syn-esc` | Escape sequences |

### Line highlight

```css
.shj span.line.highlight {
  background-color: rgba(255, 255, 0, 0.1);
  display: inline-block;
  width: calc(100% + 2rem);
  margin: 0 -1rem;
  padding: 0 1rem;
}
```

### Minimal custom theme

```css
pre.shj {
  background: #0d1117;
  color: #e6edf3;
  padding: 1rem;
  border-radius: 8px;
  overflow: auto;
}

.shj-syn-kwd { color: #ff7b72; }
.shj-syn-str { color: #a5d6ff; }
.shj-syn-num { color: #79c0ff; }
.shj-syn-func { color: #d2a8ff; }
.shj-syn-cmnt { color: #8b949e; font-style: italic; }
.shj-syn-oper { color: #ff7b72; }
.shj-syn-class,
.shj-syn-type { color: #ffa657; }
.shj-syn-bool { color: #79c0ff; }
.shj-syn-var { color: #ffa198; }
```

---

## Supported languages

| Fence / alias | Language id |
|---|---|
| `js`, `javascript`, `jsx` | `js` |
| `ts`, `typescript`, `tsx` | `ts` |
| `py`, `python` | `py` |
| `rs`, `rust` | `rs` |
| `bash`, `sh`, `shell`, `zsh` | `bash` |
| `md`, `markdown`, `mdc`, `comark` | `md` |
| `yml`, `yaml` | `yaml` |
| `json` | `json` |
| `html`, `htm` | `html` |
| `css` | `css` |
| `xml`, `svg` | `xml` |
| `c`, `go`, `java`, `sql`, `lua`, `toml`, `diff`, `docker`, `http`, `ini`, … | same id |
| _(missing fence info)_ | `plain` |

Full list: [speed-highlight languages](https://github.com/speed-highlight/core#languages-supported-).
