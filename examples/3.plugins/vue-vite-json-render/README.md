---
title: JSON Render
description: Example showing how to use Comark with JSON Render and YAML Render in Vue and Vite.
navigation:
  icon: i-lucide-braces
category: Plugins
path: /examples/plugins/vue-vite-json-render
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/3.plugins/vue-vite-json-render
defaultValue: src/App.vue
---
::

::browser{src="https://comark-json-render.vercel.app"}
::

## Features

This example demonstrates how to use Comark with JSON Render and YAML Render in Vue:

- **JSON Render Plugin**: Import and configure the `json-render` plugin to parse `json-render` and `yaml-render` code blocks
- **Full Spec Format**: Define a tree of named elements with a root entry point
- **Single Element Shorthand**: Use a simplified format for single elements
- **Nested Layout**: Compose deep component trees by referencing children by key
- **YAML Support**: Write specs in YAML for improved readability
- **Nuxt UI**: Styled with Nuxt UI for a polished look with dark mode support

## Usage

1. Import the json-render plugin:
   ```ts
   import jsonRender from '@comark/vue/plugins/json-render'
   ```

2. Pass the plugin to Comark:
   ```vue
   <Comark :plugins="[jsonRender()]" />
   ```

3. Use `json-render` or `yaml-render` code blocks in your markdown:
   ````json
   ```json-render
   {
     "type": "Text",
     "props": { "content": "Hello" }
   }
   ```
   ````

   ````yaml
   ```yaml-render
   type: Text
   props:
     content: Hello
   ```
   ````

## Learn More

- [JSON Render Plugin Documentation](/plugins/built-in/json-render)
- [JSON Render](https://json-render.dev/)
