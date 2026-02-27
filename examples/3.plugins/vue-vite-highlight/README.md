---
title: Syntax Highlighting
description: Example showing how to use Comark with syntax highlighting using Shiki in Vue and Vite.
navigation.icon: i-lucide-code
category: Plugins
---

::code-tree{defaultValue="src/App.vue" expandAll}

```ts [src/main.ts]
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

```vue [src/App.vue]
<template>
  <div>
    <button class="theme-toggle" @click="toggleTheme">
      {{ isDark ? '☀️ Light' : '🌙 Dark' }}
    </button>

    <Suspense>
      <Comark
        :plugins="[
          highlight({
            themes: {
              light: githubLight,
              dark: githubDark
            },
            languages: [
              python,
              rust,
              go,
              sql,
              css,
            ]
          })
        ]"
      >
        {{ content }}
      </Comark>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { content } from './content'
import { Comark } from 'comark/vue'
import highlight from 'comark/plugins/highlight'

// Import themes and languages directly
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'
import python from '@shikijs/langs/python'
import rust from '@shikijs/langs/rust'
import go from '@shikijs/langs/go'
import sql from '@shikijs/langs/sql'
import css from '@shikijs/langs/css'

// Theme toggle
const isDark = ref(false)

onMounted(() => {
  isDark.value = document.body.classList.contains('dark')
})

function toggleTheme() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark', isDark.value)
}
</script>

<style>
.dark .shiki span {
  color: var(--shiki-dark) !important;
}
</style>
```

```ts [src/content.ts]
export const content = `# Syntax Highlighting Examples

The \`highlight\` plugin provides beautiful syntax highlighting using [Shiki](https://shiki.style/) with support for multiple themes and 180+ languages.

## JavaScript

\`\`\`javascript
// Array methods
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
const sum = numbers.reduce((acc, n) => acc + n, 0)

// Async/await
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
\`\`\`

## TypeScript

\`\`\`typescript
// Generics and interfaces
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

async function getData<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint)
  return response.json()
}
\`\`\`

## Python

\`\`\`python
# List comprehensions
squares = [x**2 for x in range(10)]

# Decorators
def timer(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        print(f"Time: {time.time() - start}s")
        return result
    return wrapper
\`\`\`

_...and many more languages (Vue, React, Rust, Go, SQL, CSS, JSON, Bash, Markdown)_
`
```

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

```json [package.json]
{
  "name": "comark-vue-highlight-example",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@shikijs/langs": "^1.27.0",
    "@shikijs/themes": "^1.27.0",
    "comark": "workspace:*",
    "shiki": "^1.27.0",
    "vue": "^3.5.28"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.4",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vue-tsc": "^3.2.4"
  }
}
```

```html [index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comark + Highlight - Vue Example</title>
    <style>
      body {
        margin: 0;
        padding: 2rem;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
      }

      .theme-toggle {
        position: fixed;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem 1rem;
        background: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
      }

      body.dark {
        background: #1a1a1a;
        color: #e0e0e0;
      }

      pre.shiki {
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1rem 0;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```json [tsconfig.json]
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

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

- [Highlight Plugin Documentation](/plugins/highlight)
- [Shiki Documentation](https://shiki.style/)
- [Comark Documentation](https://comark.dev)
