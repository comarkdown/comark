# Syntax highlighting with Rangi in Vue and Vite

This example highlights code blocks and language-tagged inline code in Vue and Vite using `@comark/vue/plugins/rangi`.

## Features

- **Small bundle**: Rangi ships at roughly 13 kB all-in, or 1.5 kB for the core tokenizer.
- **Built-in theme pairs**: accepts single themes or light/dark pairs such as `github` from `rangi/themes`.
- **Dual-theme CSS variables**: emits the same `--shiki-dark*` custom properties as the Shiki plugin.
- **Line highlighting**: marks lines specified in fence attributes such as `{2-3,5}` with `.highlight`.
- **Language aliases**: resolves common names such as `javascript`, `typescript`, and `python`.
- **Comark grammar**: highlights `comark`, `mdc`, `md`, and `markdown` fences with Comark component and binding tokens.
- **Synchronous highlighting**: tokenizes during parse with no async highlighter initialization.

## Usage

### 1. Install Rangi

```bash
npm install rangi
```

### 2. Configure the plugin

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

### 3. Add dark-theme CSS rules

```css
body.dark .shj span {
  color: var(--shiki-dark) !important;
}
body.dark pre.shj {
  background-color: var(--shiki-dark-bg) !important;
  color: var(--shiki-dark) !important;
}
```

### 4. Highlight Comark syntax

The Rangi plugin registers the Comark grammar by default. A `comark` fence highlights frontmatter, block and inline components, spans, attributes, bindings, and named slots:

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

`md` and `markdown` fences also use the Comark grammar because Comark is a superset of Markdown. To use Rangi's plain Markdown grammar instead, pass `languages`:

```ts
import { md } from 'rangi/languages'

rangi({ languages: { md, markdown: md } })
```

## Configuration options

```ts
rangi({
  // Single theme or { light, dark } pair from rangi/themes
  theme: github,
  // Wrap lines for line-number gutters (line highlights wrap automatically)
  lineNumbers: true,
  classPrefix: 'shj',
})
```

## Choosing between Rangi and Shiki

| Aspect | `rangi` | `shiki` |
| --- | --- | --- |
| Bundle size | ~13 kB (or ~1.5 kB core) | Larger (TextMate grammars) |
| Tokenizer | Regex | TextMate |
| Theming | Built-in themes and light/dark pairs | Dual themes and CSS variables |
| Transformers and Twoslash | No | Yes |
| Language coverage | ~46 languages plus Comark | 180+ languages |
| Typical fit | Chat UIs, SSG, bundle-constrained apps | Documentation sites, Twoslash type hovers |

## Run locally

From the monorepo root:

```bash
pnpm dev:rangi
```

## Learn more

- [Rangi plugin documentation](https://comark.dev/plugins/built-in/rangi)
- [Shiki plugin documentation](https://comark.dev/plugins/built-in/shiki)
- [Rangi repository](https://github.com/pi0/rangi)
- [Comark documentation](https://comark.dev)
