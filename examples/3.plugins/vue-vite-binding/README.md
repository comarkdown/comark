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
- **Built-in filters** — the `standardFilters` catalog is active by default. Pass a custom filter (e.g. `shout`) via `:filters` to extend or override.
- **Parent props** — nested components can reference their enclosing component's resolved attributes via `props.`.
- **Typed values** — bindings come through as real JS values (strings, numbers, objects) thanks to the shared data-binding layer.
- **Conditional content** — `If` supports truthiness checks, role comparisons, age ranges, and nested `#else` branches.
- **Live updates** — text, select, range, textarea, and checkbox controls use `v-model` to update the same reactive data passed to the renderer. The age slider uses `v-model.number` for numeric comparisons.
- **Highlighted source** — the Source view uses the Rangi plugin's Comark grammar to highlight bindings, components, and slots.
- **Responsive playground** — grouped inputs, a reset action, keyboard focus indicators, and a live data summary work in both light and dark system themes.

Run `pnpm dev:binding` from the repository root. Change the name or bio to see filters update, change the role, move the age slider across 18 or 65, and toggle the mood checkboxes to see the selected branches change. Use **Preview** and **Source** above the Markdown panel to switch between rendered content and its source while keeping the form values.

The layout follows [Vercel's design guidance](https://vercel.com/design.md), with Comark branding. It loads the published Vercel CSS foundation and Geist fonts over the network.

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
     :filters="filters"
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

4. Use built-in filters — they are active by default. Import `standardFilters` only when you need to add a custom filter:

   ```ts
   import binding, { Binding, If, standardFilters } from '@comark/vue/plugins/binding'

   // Spread standardFilters and add a custom one.
   const filters = {
     ...standardFilters,
     shout: (val: unknown) => `${String(val ?? '').toUpperCase()}!!!`,
   }
   ```

   ```markdown
   {{ data.user.name | upper }}
   {{ data.user.bio | truncate:40 }}
   {{ data.user.name | shout }}
   ::card{:title="data.user.name | title"}
   ```

5. Use `If` to select content based on the reactive data:

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
