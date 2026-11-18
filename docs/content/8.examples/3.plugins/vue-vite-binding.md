---
title: 'Frontmatter and Data Binding in Vue Markdown'
description: Interpolate frontmatter and reactive data into Markdown with the Comark binding plugin in Vue and Vite.
navigation:
  title: 'Binding (frontmatter + data)'
  icon: i-lucide-replace
---

::code-explorer
---
org: comarkdown
repo: comark@c78885ca7504b38afc7ced59aac1a3c6b3cc5425
path: examples/3.plugins/vue-vite-binding
defaultValue: src/App.vue
---
::

::browser{src="https://comark-binding.vercel.app"}
::

This example interpolates YAML frontmatter, reactive application state, and component props into Markdown in a Vue and Vite app with `@comark/vue/plugins/binding`.

## Features

- **`{{ path }}` interpolation**: reads values from frontmatter, the renderer's `data` prop, or an enclosing component's `props`.
- **`|| default` fallback**: renders an inline fallback when the dot path is undefined.
- **Conditional blocks**: selects branches with `::if` and `#else` using truthiness or comparison operators.
- **Typed prop bindings**: passes strings, numbers, booleans, and objects without stringifying them first.

## Usage

1. Import the plugin and its Vue components:

   ```ts
   import binding, { Binding, If } from '@comark/vue/plugins/binding'
   ```

2. Pass them to `<Markdown>` along with reactive `data`:

   ```vue
   <Markdown
     :value="markdown"
     :plugins="[binding()]"
     :components="{ Binding, If }"
     :data="data"
   />
   ```

3. Reference values with `{{ path || default }}` in Markdown:

   ```markdown
   ---
   release:
     version: 2.5.1
   ---

   Hello, {{ data.user.name || friend }}. You are on v{{ frontmatter.release.version }}.
   ```

## Namespaces

Bindings resolve against four namespaces:

| Namespace     | Source                                      |
| ------------- | ------------------------------------------- |
| `frontmatter` | YAML frontmatter on the parsed document     |
| `meta`        | Plugin metadata attached to `document.meta` |
| `data`        | The `data` prop passed to `<Markdown>`      |
| `props`       | Resolved props of the enclosing component   |

## Learn more

- [Binding plugin documentation](/plugins/built-in/binding)
- [Component data binding](/syntax/components#data-binding)
