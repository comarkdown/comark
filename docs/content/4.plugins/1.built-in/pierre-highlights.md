---
title: Pierre (Highlight)
description: Fast syntax highlighting for code blocks and language-tagged inline code using @pierre/highlights.
seo:
  title: Syntax Highlighting using Pierre Highlights
navigation:
  icon: i-lucide-cpu
links:
  - label: Shiki
    icon: i-lucide-code
    to: /plugins/built-in/shiki
    color: neutral
    variant: soft
  - label: Rangi
    icon: i-lucide-zap
    to: /plugins/built-in/rangi
    color: neutral
    variant: soft
  - label: '@pierre/highlights'
    icon: i-simple-icons-github
    to: https://github.com/pierrecomputer/pierre/tree/main/packages/highlights
    color: neutral
    variant: soft
---

The `comark/plugins/pierre-highlights` plugin highlights code blocks with [`@pierre/highlights`](https://diffs.com/highlights), a synchronous highlighter written in WebAssembly. It ships 152 language lexers in one wasm module and renders the same tree as the [Shiki plugin](/plugins/built-in/shiki): `<span class="line">` lines, inline colors, and `--shiki-dark` variables, so existing Shiki styles keep working.

`@pierre/highlights` is a peer dependency:

```bash [terminal]
npm install @pierre/highlights
```

::warning
`@pierre/highlights` is in beta. Its colors follow Shiki's themes but its lexers are coarser than TextMate grammars, so some tokens get a different color than with Shiki.
::

::tip
Pick Highlights for server rendering and streaming, where its speed and quick startup matter most. Use [Shiki](/plugins/built-in/shiki) for transformers, custom grammars, or Comark syntax colors in `comark` fences, and [Rangi](/plugins/built-in/rangi) for the smallest browser bundle.
::

## Usage

```typescript
import { parseMarkdown } from 'comark'
import pierreHighlights from 'comark/plugins/pierre-highlights'

const result = await parseMarkdown(content, {
  plugins: [pierreHighlights()]
})
```

With framework components:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import pierreHighlights from '@comark/vue/plugins/pierre-highlights'
</script>

<template>
  <Suspense>
    <Markdown :plugins="[pierreHighlights()]">{{ content }}</Markdown>
  </Suspense>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import pierreHighlights from '@comark/react/plugins/pierre-highlights'

<Markdown plugins={[pierreHighlights()]}>
  {content}
</Markdown>
```

```svelte [Svelte]
<script>
  import { Markdown } from '@comark/svelte'
  import pierreHighlights from '@comark/svelte/plugins/pierre-highlights'
  let { content } = $props()
</script>

<Markdown value={content} plugins={[pierreHighlights()]} />
```

::

---

## Performance

Highlighting time added to a parse, measured with Node 26 on the same documents. The first row is the [`codeMarkdown`](https://github.com/comarkdown/comark/blob/main/benchmarks/fixtures.ts) fixture used by `benchmarks/plugins.bench.ts`.

| Document | Shiki | Rangi | Highlights |
|---|---|---|---|
| 4 short fences | 4.0 ms | 0.30 ms | 0.11 ms |
| One 564-line TypeScript file | 288 ms | 9.3 ms | 2.0 ms |
| 16,000 lines of TypeScript (530 KiB) | 7.2 s | 267 ms | 83 ms |

Startup is close to Rangi's (about 20 ms to the first highlighted parse, against 700 ms for Shiki). The trade-off is size: the wasm module is inlined in the JavaScript, adding about 185 KiB gzipped to a browser bundle, against about 14 KiB for Rangi.

---

## Features

### Themes

Pass themes from `@pierre/highlights/themes`. It includes Shiki's community themes, converted to the [Zed](https://zed.dev) theme format, plus Pierre's own. The defaults are Material Theme Lighter and Material Theme Palenight, the same as the Shiki plugin:

```typescript
import githubLight from '@pierre/highlights/themes/github-light'
import githubDark from '@pierre/highlights/themes/github-dark'

// light/dark pair: light colors inline, dark colors as --shiki-dark variables
pierreHighlights({ themes: { light: githubLight, dark: githubDark } })

// a single theme
pierreHighlights({ themes: { dark: githubDark } })
```

Import each theme from its own path. The `@pierre/highlights/themes` entry bundles every theme.

### Languages

Fence languages and their aliases are passed to Highlights (`ts`, `typescript`, `sh`, `yml`, …). `comark` fences use its `mdc` lexer, which is Markdown without Comark's component syntax, and `json-render` and `yaml-render` fences use JSON and YAML. A fence with an unknown language keeps its text unhighlighted under the `shiki pierre-highlights` class. Custom grammars are not supported.

### Inline code

Inline code is highlighted when it declares a language with the attributes syntax. `lang` wins over `language`:

```markdown
The type is `Ref<HTMLInputElement | null>`{lang="ts-type"} and the component is `<UButton />`{lang="vue-html"}.
```

`ts-type` is highlighted as a TypeScript type and `vue-html` as Vue template markup. Inline code naming a language Highlights does not know is left as written, so `` `Bonjour`{lang="fr"} `` stays plain text. Set `inlineCode: false` to turn this off.

### Line highlighting

Fence info `{2-3,5}` marks the selected lines with the `.highlight` class, the same as the Shiki plugin.

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `themes` | `{ light?: Theme, dark?: Theme }` | Material Lighter / Palenight | Themes from `@pierre/highlights/themes` |
| `preStyles` | `boolean` | `false` | Add the theme's background and foreground colors to `<pre>` |
| `inlineCode` | `boolean` | `true` | Highlight inline code that declares a language |

---

## Styling

Code blocks and inline code get the `shiki pierre-highlights` class, so the dark-mode CSS from the [Shiki plugin](/plugins/built-in/shiki) applies unchanged. It switches to the `--shiki-dark*` variables, which are only emitted with a light and a dark theme; with a single theme the inline colors need no extra CSS:

```css
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

/* With preStyles: true */
html.dark pre.shiki {
  background-color: var(--shiki-dark-bg) !important;
  color: var(--shiki-dark) !important;
}
```
