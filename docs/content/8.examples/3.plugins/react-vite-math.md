---
title: 'LaTeX Math Formulas in React with Comark and KaTeX'
description: 'A React and Vite app that renders inline and display LaTeX math in Markdown with the Comark math plugin and KaTeX.'
navigation:
  title: 'Math formulas (React)'
  icon: i-lucide-calculator
---

::code-explorer
---
org: comarkdown
repo: comark@8d0c4a8023b71e8588ee6328820a2f26f2285232
path: examples/3.plugins/react-vite-math
defaultValue: src/App.tsx
---
::

This example renders inline and display LaTeX math expressions in React and Vite using `@comark/react/plugins/math` and KaTeX.

## Features

- Parses `$...$` inline formulas and `$$...$$` display blocks with the `math` plugin.
- Renders parsed expressions through the `Math` React component and KaTeX stylesheet.
- Supports fractions, integrals, sums, matrices, Greek letters, subscripts, and superscripts.

## Usage

1. Install the renderer and `katex` peer dependency:
   ```bash
   npm install @comark/react katex
   ```

2. Import the `math` plugin, `Math` component, and KaTeX stylesheet:
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

4. Write math expressions in Markdown:
   ```markdown
   Inline: $E = mc^2$

   Display:
   $$
   x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
   $$
   ```

## Syntax examples

- **Inline math**: wrap an expression in single `$` delimiters:
  ```markdown
  The formula $x^2 + y^2 = z^2$ is inline.
  ```

- **Display math**: wrap a block equation in `$$` delimiters:
  ```markdown
  $$
  \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
  $$
  ```

- **Fractions**: use `\frac{numerator}{denominator}`:
  ```markdown
  $\frac{a}{b}$
  ```

- **Greek letters**: use commands such as `\alpha`, `\beta`, and `\gamma`:
  ```markdown
  $\alpha + \beta = \gamma$
  ```

- **Subscripts and superscripts**: use `_` and `^`:
  ```markdown
  $x_1^2 + x_2^2$
  ```

## Learn more

- [Mathematics plugin documentation](/plugins/built-in/math)
- [React rendering](/rendering/react)
- [KaTeX documentation](https://katex.org)
