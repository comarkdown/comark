---
title: Mermaid diagrams
description: Example showing how to use Comark with Mermaid diagrams in Vue and Vite.
navigation.icon: i-simple-icons-mermaid
category: Plugins
path: /examples/plugins/vue-vite-mermaid
---

::code-tree{defaultValue="src/App.vue" expandAll}

```ts [src/main.ts]
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

```vue [src/App.vue]
<script setup lang="ts">
import { Comark } from 'comark/vue'
import mermaid from '@comark/mermaid'
import { Mermaid } from '@comark/mermaid/vue'

const markdown = `
# Mermaid Diagram Example

## Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
\`\`\`

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant App
    participant API
    User->>App: Request data
    App->>API: Fetch data
    API-->>App: Return data
    App-->>User: Display data
\`\`\`
`
</script>

<template>
  <Suspense>
    <Comark
      :components="{ mermaid: Mermaid }"
      :plugins="[mermaid()]"
    >{{ markdown }}</Comark>
  </Suspense>
</template>
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
  "name": "comark-vue-mermaid-example",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@comark/mermaid": "latest",
    "comark": "latest",
    "vue": "^3.5.27"
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
    <title>Comark + Mermaid - Vue Example</title>
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

This example demonstrates how to use Comark with Mermaid diagrams in Vue:

- **Mermaid Plugin**: Import and configure `@comark/mermaid` plugin to parse mermaid code blocks
- **Mermaid Component**: Register the `Mermaid` component to render diagrams as SVG
- **Multiple Diagram Types**: Supports flowcharts, sequence diagrams, and all other Mermaid diagram types
- **Configurable**: Customize theme, width, and height via component props

## Usage

1. Import the mermaid plugin and component:
   ```ts
   import mermaid from '@comark/mermaid'
   import { Mermaid } from '@comark/mermaid/vue'
   ```

2. Pass the plugin to Comark:
   ```vue
   <Comark :plugins="[mermaid()]" />
   ```

3. Register the Mermaid component:
   ```vue
   <Comark :components="{ mermaid: Mermaid }" />
   ```

4. Use mermaid code blocks in your markdown:
   ````markdown
   ```mermaid
   graph TD
       A[Start] --> B[End]
   ```
   ````
