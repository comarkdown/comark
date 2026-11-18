---
title: 'Mermaid Diagrams in Vue Markdown'
description: 'A Vue and Vite app that renders Mermaid fenced code blocks in Markdown with the Comark mermaid plugin.'
navigation:
  title: 'Mermaid diagrams (Vue)'
  icon: i-simple-icons-mermaid
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/3.plugins/vue-vite-mermaid
defaultValue: src/App.vue
---
::

This example renders fenced `mermaid` code blocks as SVG diagrams in Vue and Vite using `@comark/vue/plugins/mermaid` and `beautiful-mermaid`.

## Features

- Parses fenced `mermaid` code blocks into `Mermaid` nodes with the `mermaid` plugin.
- Renders flowcharts, sequence diagrams, state diagrams, and class diagrams as SVG through the `Mermaid` Vue component.
- Accepts per-diagram theme, width, and height props in the fence info string.

## Usage

1. Import the `mermaid` plugin and `Mermaid` component:
   ```ts
   import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
   ```

2. Pass the plugin and component to `<Markdown>`:
   ```vue
   <Suspense>
     <Markdown
       :plugins="[mermaid()]"
       :components="{ Mermaid }"
     >
       {{ content }}
     </Markdown>
   </Suspense>
   ```

3. Add a `mermaid` code block to your Markdown:
   ````markdown
   ```mermaid
   graph TD
       A[Start] --> B[End]
   ```
   ````

## Learn more

- [Mermaid plugin documentation](/plugins/built-in/mermaid)
- [Vue rendering](/rendering/vue)
- [Mermaid documentation](https://mermaid.js.org)
