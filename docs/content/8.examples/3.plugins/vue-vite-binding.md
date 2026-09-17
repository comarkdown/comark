---
title: Binding (frontmatter + data)
description: Example showing how to interpolate frontmatter and runtime data into Markdown using the Comark `binding` plugin in Vue and Vite.
navigation:
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

## Features

This example demonstrates the Comark `binding` plugin in a Vue + Vite app:

- **`{{ path }}` shorthand** — interpolate values from frontmatter, the renderer's `data` prop, or a parent component's `props` directly in your markdown.
- **`|| default` fallback** — supply an inline default rendered when the dot-path doesn't resolve.
- **Built-in filters** — the `standardFilters` catalog is active by default. Pass a custom filter via the `filters` prop to extend or override.
- **Custom filters** — spread `standardFilters` and add your own so custom filters override built-ins by name.
- **Parent props** — nested components can reference their enclosing component's resolved attributes via `props.`.
- **Typed values** — bindings come through as real JS values (strings, numbers, objects) thanks to the shared data-binding layer.

## Usage

1. Import the plugin and its matching Vue component:

   ```ts
   import binding, { Binding } from '@comark/vue/plugins/binding'
   ```

2. Wire them into `<Markdown>`:

   ```vue
   <Markdown
     :value="markdown"
     :plugins="[binding()]"
     :components="{ Binding }"
     :data="data"
     :filters="filters"
   />
   ```

3. Use `{{ path || default }}` and built-in filters anywhere in your markdown:

   ```markdown
   ---
   release:
     version: 2.5.1
   ---

   Hello, {{ data.user.name || friend }} — you are on v{{ frontmatter.release.version }}.
   {{ data.user.name | upper }}
   {{ data.user.bio | truncate:40 }}
   {{ data.user.name | shout }}
   ```

4. To add a custom filter, import `standardFilters` and spread it:

   ```ts
   import binding, { Binding, If, standardFilters } from '@comark/vue/plugins/binding'

   const filters = {
     ...standardFilters,
     shout: (val: unknown) => `${String(val ?? '').toUpperCase()}!!!`,
   }
   ```

## Namespaces

Bindings resolve against four namespaces:

| Namespace     | Source                                                 |
| ------------- | ------------------------------------------------------ |
| `frontmatter` | The document's YAML frontmatter                        |
| `meta`        | Plugin-populated metadata on the parsed tree            |
| `data`        | The `data` prop passed to `<Markdown>`                 |
| `props`       | Props of the enclosing Comark component                |

See the [Binding plugin docs](/plugins/built-in/binding) and the [data binding contract](/syntax/components#data-binding) for the full reference.
