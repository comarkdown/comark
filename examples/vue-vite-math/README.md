---
title: Math formulas
description: Example showing how to use Comark with LaTeX math formulas in Vue 3 and Vite.
icon: i-lucide-calculator
category: Plugins
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
import math from '@comark/math'
import { Math } from '@comark/math/vue'

const markdown = `
# Math Formula Examples

## Inline Math

The famous equation $E = mc^2$ relates energy and mass.

The Pythagorean theorem states that $a^2 + b^2 = c^2$.

## Display Math

The quadratic formula:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Complex Formulas

The integral:

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

Summation:

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

Matrix:

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$
`
</script>

<template>
  <Suspense>
    <Comark
      :components="{ math: Math }"
      :options="{ plugins: [math()] }"
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
  "name": "comark-vue-math-example",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@comark/math": "latest",
    "comark": "latest",
    "katex": "^0.16.28",
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
    <title>Comark + Math - Vue Example</title>
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

This example demonstrates how to use Comark with LaTeX math formulas in Vue 3:

- **Math Plugin**: Import and configure `@comark/math` plugin to parse `$...$` and `$$...$$` expressions
- **Math Component**: Register the `Math` component to render formulas using KaTeX
- **Inline & Display Math**: Supports both inline formulas and display equations
- **Full LaTeX Syntax**: All KaTeX-supported LaTeX commands work

## Usage

1. Import the math plugin, component, and KaTeX CSS:
   ```ts
   import math from '@comark/math'
   import { Math } from '@comark/math/vue'
   import 'katex/dist/katex.min.css'
   ```

2. Pass the plugin to Comark options:
   ```vue
   <Comark :options="{ plugins: [math()] }" />
   ```

3. Register the Math component:
   ```vue
   <Comark :components="{ math: Math }" />
   ```

4. Use math expressions in your markdown:
   ```markdown
   Inline: $E = mc^2$

   Display:
   $$
   x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
   $$
   ```

## Syntax Examples

**Inline Math**: Use single `$` delimiters
```markdown
The formula $x^2 + y^2 = z^2$ is inline.
```

**Display Math**: Use double `$$` delimiters
```markdown
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

**Fractions**: `\frac{numerator}{denominator}`
```markdown
$\frac{a}{b}$
```

**Greek Letters**: `\alpha`, `\beta`, `\gamma`, etc.
```markdown
$\alpha + \beta = \gamma$
```

**Subscripts & Superscripts**: `_` and `^`
```markdown
$x_1^2 + x_2^2$
```
