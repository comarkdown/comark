---
title: 'Mermaid Diagrams in Vue Markdown'
description: 'A Vue and Vite app that turns mermaid code blocks in Markdown into diagrams with the Comark mermaid plugin.'
navigation:
  title: 'Mermaid diagrams (Vue)'
  icon:  i-simple-icons-mermaid
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
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
   import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
   ```

2. Pass the plugin and component to `Markdown`:
   ```vue
   <Markdown :plugins="[mermaid()]" :components="{ mermaid: Mermaid }" />
   ```

4. Use mermaid code blocks in your markdown:
   ````markdown
   ```mermaid
   graph TD
       A[Start] --> B[End]
   ```
   ````
