---
title: Math formulas
description: Example showing how to use Comark with LaTeX math formulas in React and Vite.
navigation:
  icon:  i-lucide-calculator
---

::code-explorer
---
org: comarkdown
repo: comark@8d0c4a8023b71e8588ee6328820a2f26f2285232
path: examples/3.plugins/react-vite-math
defaultValue: src/App.tsx
---
::

## Features

This example demonstrates how to use Comark with LaTeX math formulas in React:

- **Math Plugin**: Import and configure the `math` plugin to parse `$...$` and `$$...$$` expressions
- **Math Component**: Register the `Math` component to render formulas using KaTeX
- **Inline & Display Math**: Supports both inline formulas and display equations
- **Full LaTeX Syntax**: All KaTeX-supported LaTeX commands work

## Usage

1. Install dependencies:
   ```bash
   npm install @comark/react katex
   ```

2. Import the math plugin, component, and KaTeX CSS:
   ```tsx
   import { MarkdownClient } from '@comark/react'
   import math, { Math } from '@comark/react/plugins/math'
   import 'katex/dist/katex.min.css'
   ```

3. Pass the plugin and component to `MarkdownClient`:
   ```tsx
   <MarkdownClient
     value={content}
     components={{ Math }}
     plugins={[math()]}
   />
   ```

4. Use math expressions in your markdown:
   ```markdown
   Inline: $E = mc^2$

   Display:
   $$
   x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
   $$
   ```

## Syntax examples

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

## Learn more

- [Math Plugin Documentation](/plugins/built-in/math)
- [KaTeX Documentation](https://katex.org)
- [Comark Documentation](https://comark.dev)
