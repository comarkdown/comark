---
title: Syntax Highlighting
description: Example showing how to use Comark with syntax highlighting using Shiki in Vue and Vite.
navigation:
  icon:  i-lucide-code
category: Plugins
path: /examples/plugins/vue-vite-highlight
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/3.plugins/vue-vite-highlight
defaultValue: src/App.vue
---
::

## Features

This example demonstrates how to use Comark with syntax highlighting in Vue:

- **Dual-theme support**: Automatically switches between light and dark themes
- **180+ languages**: Supports JavaScript, TypeScript, Python, Rust, Go, SQL, and many more
- **Beautiful highlighting**: Uses Shiki for high-quality syntax highlighting
- **Bundled theme names**: Pass theme names as strings, or import theme/language objects for tree-shaking
- **Theme toggle**: Switch between light and dark modes with a button
- **preStyles option**: Optionally add background/foreground colors to `<pre>` elements

## Usage

### 1. Install Dependencies

```bash
npm install shiki
```

### 2. Configure the Plugin

Pass [bundled theme names](https://shiki.style/themes) as strings — no extra imports needed. Optionally preload languages from `@shikijs/langs`:

```vue
<script setup lang="ts">
import { Comark } from '@comark/vue'
import highlight from 'comark/plugins/highlight'
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
import python from '@shikijs/langs/python'
</script>

<template>
  <Suspense>
    <Comark
      :plugins="[
        highlight({
          themes: {
            light: 'github-light',
            dark: 'github-dark'
          },
          languages: [javascript, typescript, python]
        })
      ]"
    >
      {{ content }}
    </Comark>
  </Suspense>
</template>
```

You can also import theme registration objects from `@shikijs/themes` when you want explicit tree-shaking control.

### 3. Use Code Blocks in Markdown

````markdown
```javascript
console.log("Hello, World!")
```

```typescript
const greeting: string = "Hello, TypeScript!"
```

```python
print("Hello, Python!")
```
````

## Configuration Options

```typescript
import type { BundledTheme, LanguageRegistration, ThemeRegistrationAny } from 'shiki'

interface HighlightOptions {
  // Theme names (e.g. 'github-light') or registration objects
  themes?: {
    light?: ThemeRegistrationAny | BundledTheme
    dark?: ThemeRegistrationAny | BundledTheme
  }

  // Languages to preload - import from @shikijs/langs
  languages?: LanguageRegistration[]

  // Add inline styles to <pre> elements
  preStyles?: boolean
}
```

## Available Themes

Pass any [bundled theme name](https://shiki.style/themes) as a string:

```typescript
highlight({
  themes: {
    light: 'github-light',
    dark: 'github-dark'
    // also: 'nord', 'one-dark-pro', 'dracula', 'monokai', ...
  }
})
```

[View all available themes →](https://shiki.style/themes)

## Available Languages

Import languages from `@shikijs/langs`:

```typescript
// Web
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
import vue from '@shikijs/langs/vue'
import tsx from '@shikijs/langs/tsx'

// Backend
import python from '@shikijs/langs/python'
import rust from '@shikijs/langs/rust'
import go from '@shikijs/langs/go'

// Data
import json from '@shikijs/langs/json'
import sql from '@shikijs/langs/sql'

// Shell
import bash from '@shikijs/langs/bash'
```

[View all 180+ languages →](https://shiki.style/languages)

## Learn More

- [Highlight Plugin Documentation](https://comark.dev/plugins/built-in/syntax-highlight)
- [Shiki Documentation](https://shiki.style/)
- [Comark Documentation](https://comark.dev)
