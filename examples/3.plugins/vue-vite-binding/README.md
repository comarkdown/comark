---
title: Binding and conditional content
description: Update Markdown bindings and If branches with live form controls using Vue and Vite.
navigation:
  icon: i-lucide-replace
category: Plugins
path: /examples/plugins/vue-vite-binding
---

::code-explorer
---
org: comarkdown
repo: comark@c78885ca7504b38afc7ced59aac1a3c6b3cc5425
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
- **Conditional content** — `If` supports truthiness checks, role comparisons, age ranges, and nested `#else` branches.
- **Live updates** — text, select, range, and checkbox controls use `v-model` to update the same reactive data passed to the renderer. The age slider uses `v-model.number` for numeric comparisons.
- **Highlighted source** — the Source view uses the Rangi plugin's Comark grammar to highlight bindings, components, and slots.

Run `pnpm dev:binding` from the repository root. Change the role, move the age slider across 18 or 65, and toggle the mood checkboxes to see the selected branches change. Use **Preview** and **Source** above the Markdown panel to switch between rendered content and its source while keeping the form values.

## Usage

1. Import the plugin and its Vue components:

   ```ts
   import binding, { Binding, If } from '@comark/vue/plugins/binding'
   ```

2. Wire them into `<Markdown>`:

   ```vue
   <Markdown
     :value="markdown"
     :plugins="[binding()]"
     :components="{ Binding, If }"
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

4. Use `If` to select content based on the reactive data:

   ```markdown
   ::if{:value="data.user.age" :gte="18" :lt="65"}
   You are eligible for the 18–64 age group.
   #else
   You are outside the 18–64 age group.
   ::
   ```

   `value` alone checks truthiness. With comparison props, every comparison must pass. Nest another `If` inside `#else` to check a second value, as the mood example does.

## Namespaces

Bindings resolve against four namespaces:

| Namespace     | Source                                                 |
| ------------- | ------------------------------------------------------ |
| `frontmatter` | The document's YAML frontmatter                        |
| `meta`        | Plugin-populated metadata on the parsed tree            |
| `data`        | The `data` prop passed to `<Markdown>`                   |
| `props`       | Props of the enclosing Comark component                |

See the [Binding plugin docs](/plugins/built-in/binding) and the [data binding contract](/syntax/components#data-binding) for the full reference.
