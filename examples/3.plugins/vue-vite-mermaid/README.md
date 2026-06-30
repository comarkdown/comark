---
title: Mermaid diagrams
description: Example showing how to use Comark with Mermaid diagrams in Vue and Vite.
navigation:
  icon:  i-simple-icons-mermaid
category: Plugins
path: /examples/plugins/vue-vite-mermaid
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/3.plugins/vue-vite-mermaid
defaultValue: src/App.vue
---
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
   import { Mermaid } from '@comark/vue/plugins/mermaid/vue'
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
