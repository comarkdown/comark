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
repo: comark
path: examples/3.plugins/vue-vite-highlight
defaultValue: src/App.vue
---
::

## Features

This example demonstrates how to use Comark with syntax highlighting in Vue:

- **Dual-theme support**: Automatically switches between light and dark themes
- **180+ languages**: Supports JavaScript, TypeScript, Python, Rust, Go, SQL, and many more
- **Beautiful highlighting**: Uses Shiki for high-quality syntax highlighting
- **Direct imports**: Import themes and languages from `@shikijs/themes` and `@shikijs/langs` for type safety and tree-shaking
- **Theme toggle**: Switch between light and dark modes with a button
- **preStyles option**: Optionally add background/foreground colors to `<pre>` elements

## Usage

### 1. Install Dependencies

```bash
npm install shiki @shikijs/themes @shikijs/langs
```

### 2. Import Themes and Languages

Import directly from `@shikijs/themes` and `@shikijs/langs`:

```typescript
import highlight from 'comark/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
import python from '@shikijs/langs/python'
```

### 3. Configure the Plugin

Pass the imported themes and languages to the plugin:

```vue
<template>
  <Suspense>
    <Comark
      :plugins="[
        highlight({
          themes: {
            light: githubLight,
            dark: githubDark
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

### 4. Use Code Blocks in Markdown

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

## Why Import Directly?

- ✅ **Type Safety**: TypeScript autocomplete for themes and languages
- ✅ **Tree Shaking**: Only bundle the themes/languages you use
- ✅ **No Typos**: Import errors caught at build time
- ✅ **Smaller Bundle**: Import only what you need

## Configuration Options

```typescript
import type { BundledLanguage, BundledTheme } from 'shiki'

interface HighlightOptions {
  // Theme configuration - import from @shikijs/themes
  themes?: Record<string, BundledTheme>

  // Languages to include - import from @shikijs/langs
  languages?: BundledLanguage[]

  // Add inline styles to <pre> elements
  preStyles?: boolean
}
```

## Available Themes

Import themes from `@shikijs/themes`:

```typescript
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'
import materialLight from '@shikijs/themes/material-theme-lighter'
import materialDark from '@shikijs/themes/material-theme-palenight'
import nord from '@shikijs/themes/nord'
import oneDarkPro from '@shikijs/themes/one-dark-pro'
import dracula from '@shikijs/themes/dracula'
import monokai from '@shikijs/themes/monokai'
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

- [Highlight Plugin Documentation](/plugins/built-in/highlight)
- [Shiki Documentation](https://shiki.style/)
- [Comark Documentation](https://comark.dev)
