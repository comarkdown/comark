---
title: 'LaTeX Math Formulas in Vue with Comark and KaTeX'
description: 'A Vue and Vite app that renders inline and display LaTeX math in Markdown with the Comark math plugin and KaTeX.'
navigation:
  title: 'Math formulas (Vue)'
  icon: i-lucide-calculator
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/3.plugins/vue-vite-math
defaultValue: src/App.vue
---
::

This example renders inline and display LaTeX math expressions in Vue and Vite using `@comark/vue/plugins/math` and KaTeX.

## Features

- Parses `$...$` inline formulas and `$$...$$` display blocks with the `math` plugin.
- Renders parsed expressions through the `Math` Vue component and KaTeX stylesheet.
- Supports fractions, integrals, sums, matrices, Greek letters, subscripts, and superscripts.

## Usage

1. Import the `math` plugin, `Math` component, and KaTeX stylesheet:
   ```ts
   import math, { Math } from '@comark/vue/plugins/math'
   import 'katex/dist/katex.min.css'
   ```

2. Pass the plugin and component to `<Markdown>`:
   ```vue
   <Suspense>
     <Markdown
       :plugins="[math()]"
       :components="{ math: Math }"
     >
       {{ content }}
     </Markdown>
   </Suspense>
   ```

3. Write math expressions in Markdown:
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
- [Vue rendering](/rendering/vue)
- [KaTeX documentation](https://katex.org)
