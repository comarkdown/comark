---
title: Binding (frontmatter + data)
description: Example showing how to interpolate frontmatter and runtime data into Markdown using the Comark `binding` plugin in Vue and Vite.
navigation:
  icon: i-lucide-replace
category: Plugins
path: /examples/plugins/vue-vite-binding
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/3.plugins/vue-vite-binding
defaultValue: src/App.vue
---
::

## Features

This example demonstrates the Comark `binding` plugin in a Vue + Vite app:

- **`{{ path }}` shorthand** — interpolate values from frontmatter, the renderer's `data` prop, or a parent component's `props` directly in your markdown.
- **`|| default` fallback** — supply an inline default rendered when the dot-path doesn't resolve.
- **Parent props** — nested components can reference their enclosing component's resolved attributes via `props.`.
- **Typed values** — bindings come through as real JS values (strings, numbers, objects) thanks to the shared data-binding layer.

## Usage

1. Import the plugin and its matching Vue component:

   ```ts
   import binding, { Binding } from '@comark/vue/plugins/binding'
   ```

2. Wire them into `<Comark>`:

   ```vue
   <Comark
     :markdown="markdown"
     :plugins="[binding()]"
     :components="{ Binding }"
     :data="data"
   />
   ```

3. Use `{{ path || default }}` anywhere in your markdown:

   ```markdown
   ---
   release:
     version: 2.5.1
   ---

   Hello, {{ data.user.name || friend }} — you are on v{{ frontmatter.release.version }}.
   ```

## Namespaces

Bindings resolve against four namespaces:

| Namespace     | Source                                                 |
| ------------- | ------------------------------------------------------ |
| `frontmatter` | The document's YAML frontmatter                        |
| `meta`        | Plugin-populated metadata on the parsed tree            |
| `data`        | The `data` prop passed to `<Comark>`                   |
| `props`       | Props of the enclosing Comark component                |

See the [Binding plugin docs](/plugins/built-in/binding) and the [data binding contract](/syntax/components#data-binding) for the full reference.
