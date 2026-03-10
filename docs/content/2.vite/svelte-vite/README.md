---
title: Svelte
category: Vite
description: A minimal example showing how to use Comark with Svelte and Vite.
navigation:
  icon: i-simple-icons-svelte
---

::code-tree{expand-all default-value="src/App.svelte"}
```ts [src/main.ts]
import { mount } from 'svelte'
import App from './App.svelte'

mount(App, {
  target: document.getElementById('app')!,
})
```

```svelte [src/App.svelte]
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import Alert from './components/Alert.svelte'

  const markdown = `
# Hello *World*

::alert{type="info"}
This is an alert!
::
`
</script>

<Comark markdown={markdown} components={{ Alert }} />
```

```svelte [src/components/Alert.svelte]
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    type = 'info',
    children,
  }: {
    type?: 'info' | 'warning' | 'success' | 'danger'
    children?: Snippet
  } = $props()

  const config = {
    info: 'bg-blue-50 border-blue-400 text-blue-900 dark:bg-blue-950/50 dark:border-blue-500/50 dark:text-blue-200',
    warning: 'bg-amber-50 border-amber-400 text-amber-900 dark:bg-amber-950/50 dark:border-amber-500/50 dark:text-amber-200',
    success: 'bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-500/50 dark:text-emerald-200',
    danger: 'bg-red-50 border-red-400 text-red-900 dark:bg-red-950/50 dark:border-red-500/50 dark:text-red-200',
  }
</script>

<div
  class="my-4 rounded-lg border-l-4 px-4 py-3 text-sm leading-relaxed {config[type]}"
  role="alert"
>
  {@render children?.()}
</div>
```

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    svelte(),
    tailwindcss(),
  ],
})
```

```json [package.json]
{
  "name": "comark-svelte-vite",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@comark/svelte": "workspace:*",
    "@tailwindcss/vite": "^4.2.0",
    "comark": "workspace:*"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^6.2.4",
    "svelte": "^5.53.7",
    "typescript": "^5.9.3",
    "vite": "^7.3.1"
  }
}
```

```html [index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comark - Svelte Example</title>
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
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src/**/*.ts", "src/**/*.svelte"]
}
```
::

This example demonstrates the simplest way to use Comark with Svelte - use the `Comark` component and pass it markdown content. The component handles parsing and rendering automatically using Svelte 5's `$state` and `$effect` runes.
