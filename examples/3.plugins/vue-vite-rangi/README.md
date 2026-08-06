---
title: Rangi
description: Example showing how to use Comark with lightweight syntax highlighting via rangi in Vue and Vite.
navigation:
  icon: i-lucide-zap
category: Plugins
path: /examples/plugins/vue-vite-rangi
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/3.plugins/vue-vite-rangi
defaultValue: src/App.vue
---
::

## Features

This example demonstrates how to use Comark with the lightweight `rangi` plugin in Vue:

- **Tiny footprint**: `rangi` is ~13kB all-in (or ~1.5kB core)
- **Built-in themes**: Pass pairs like `github` from `rangi/themes`
- **Dual-theme CSS vars**: Same `--shiki-dark*` hooks as the Shiki plugin
- **Line highlighting**: Fence info `{2-3,5}` marks lines with `.highlight`
- **Language aliases**: Built into rangi (`javascript`, `typescript`, `python`, …)
- **Comark grammar**: `comark` / `mdc` / `md` / `markdown` fences highlight Comark syntax itself
- **Fully synchronous**: No async highlighter warmup

## Usage

### 1. Install Dependencies

```bash
npm install rangi
```

### 2. Configure the Plugin

```vue
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import rangi from '@comark/vue/plugins/rangi'
import { github } from 'rangi/themes'
</script>

<template>
  <Suspense>
    <Markdown :plugins="[rangi({ theme: github, lineNumbers: true })]">
      {{ content }}
    </Markdown>
  </Suspense>
</template>
```

### 3. Dual-theme CSS (optional class toggle)

```css
body.dark .shj span {
  color: var(--shiki-dark) !important;
}
body.dark pre.shj {
  background-color: var(--shiki-dark-bg) !important;
  color: var(--shiki-dark) !important;
}
```

### 4. Highlighting Comark itself

The Comark grammar is registered automatically — no configuration needed. A ` ```comark ` fence highlights frontmatter, block/inline components, spans, attributes, bindings and named slots:

````md
```comark
---
title: Comark highlights itself
---

# Heading{#custom-id .lead}

::alert{type="warning" .rounded}
An :icon{name="triangle"} component and a {{ user.name || Anonymous }} binding.

#footer
Named slot content.
::
```
````

`md` and `markdown` fences use it too, since Comark is a superset of Markdown. To opt out, pass rangi's own grammar:

```typescript
import { md } from 'rangi/languages'

rangi({ languages: { md, markdown: md } })
```

## Configuration Options

```typescript
rangi({
  // Single theme or { light, dark } pair from rangi/themes
  theme: github,
  // Wrap lines for gutters / {n} highlights (default: false)
  lineNumbers: true,
  classPrefix: 'shj',
})
```

## When to use rangi vs shiki

| | `rangi` | `shiki` |
|---|---|---|
| Bundle size | Tiny | Larger (TextMate grammars) |
| Lexing | Regex tokenizer | TextMate grammars |
| Theming | Built-in themes / pairs | Dual themes + CSS vars |
| Transformers / Twoslash | No | Yes |
| Language coverage | ~46 languages + Comark | 180+ |
| Best for | Chat UIs, SSG, small apps | Docs sites, rich code samples |

## Learn More

- [Rangi Plugin Documentation](https://comark.dev/plugins/built-in/rangi)
- [Shiki Plugin](https://comark.dev/plugins/built-in/syntax-highlight)
- [rangi](https://github.com/pi0/rangi)
- [Comark Documentation](https://comark.dev)
