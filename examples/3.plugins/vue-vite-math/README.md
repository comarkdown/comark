---
title: Math formulas
description: Example showing how to use Comark with LaTeX math formulas in Vue and Vite.
navigation:
  icon:  i-lucide-calculator
category: Plugins
path: /examples/plugins/vue-vite-math
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/3.plugins/vue-vite-math
defaultValue: src/App.vue
---
::

## Features

This example demonstrates how to use Comark with LaTeX math formulas in Vue:

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

2. Pass the plugin to Comark:
   ```vue
   <Comark :plugins="[math()]" />
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
