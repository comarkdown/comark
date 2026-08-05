---
title: Speed Highlight
description: Example showing how to use Comark with lightweight syntax highlighting via @speed-highlight/core in Vue and Vite.
navigation:
  icon: i-lucide-zap
category: Plugins
path: /examples/plugins/vue-vite-phighlight
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/3.plugins/vue-vite-phighlight
defaultValue: src/App.vue
---
::

## Features

This example demonstrates how to use Comark with the lightweight `phighlight` plugin in Vue:

- **Tiny footprint**: `@speed-highlight/core` is ~2kB core + ~1kB per language
- **Class-based tokens**: Theme with CSS (official themes or your own)
- **Line highlighting**: Fence info `{2-3,5}` marks lines with `.highlight`
- **Language aliases**: `javascript` → `js`, `typescript` → `ts`, `python` → `py`, …
- **Theme toggle**: Switch between `github-light` and `github-dark` CSS themes
- **Zero TextMate grammars**: Faster cold-start than Shiki

## Usage

### 1. Install Dependencies

```bash
npm install @speed-highlight/core
```

### 2. Configure the Plugin

```vue
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import phighlight from '@comark/vue/plugins/phighlight'
</script>

<template>
  <Suspense>
    <Markdown :plugins="[phighlight()]">
      {{ content }}
    </Markdown>
  </Suspense>
</template>
```

### 3. Load a Theme Stylesheet

```ts
import '@speed-highlight/core/themes/github-dark.css'
// or github-light / default / atom-dark / visual-studio-dark / …
```

Official themes target `[class*="shj-lang-"]`. The plugin sets `class="shj shj-lang-<id>"` on `<pre>`.

### 4. Use Code Blocks in Markdown

````markdown
```javascript
console.log("Hello, World!")
```

```typescript {2}
const greeting: string = "Hello, TypeScript!"
console.log(greeting) // highlighted line
```

```python
print("Hello, Python!")
```
````

## Configuration Options

```typescript
phighlight({
  // Extra fence → language id aliases
  langAlias: { vue: 'html' },
  // Fallback when language is missing/unknown
  defaultLanguage: 'plain',
  // Wrap each line in <span class="line"> (needed for {n} highlights)
  lineNumbers: true,
  // Class prefix on <pre> (default: 'shj')
  classPrefix: 'shj',
})
```

## When to use phighlight vs highlight

| | `phighlight` | `highlight` (Shiki) |
|---|---|---|
| Bundle size | Tiny | Larger (TextMate grammars) |
| Theming | CSS classes (`shj-syn-*`) | Inline styles + dual themes |
| Transformers / Twoslash | No | Yes |
| Language coverage | ~35 languages | 180+ |
| Best for | Chat UIs, SSG, small apps | Docs sites, rich code samples |

## Learn More

- [Speed Highlight Plugin Documentation](https://comark.dev/plugins/built-in/phighlight)
- [Shiki Highlight Plugin](https://comark.dev/plugins/built-in/syntax-highlight)
- [@speed-highlight/core](https://github.com/speed-highlight/core)
- [Comark Documentation](https://comark.dev)
