---
title: Binding, conditions, and loops
description: Try live Markdown bindings, If branches, and For loops with editable posts in Vue and Vite.
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

## Features

This example demonstrates the Comark `binding` plugin in a Vue + Vite app:

- **`{{ path }}` shorthand** — interpolate values from frontmatter, the renderer's `data` prop, or a parent component's `props` directly in your markdown.
- **`|| default` fallback** — supply an inline default rendered when the dot-path doesn't resolve.
- **Parent props** — nested components can reference their enclosing component's resolved attributes via `props.`.
- **Typed values** — bindings come through as real JS values (strings, numbers, objects) thanks to the shared data-binding layer.

## Try repeated content

Run `pnpm dev:binding` from the repository root. In **Posts**, edit titles and descriptions, toggle **Published**, add or remove posts, or use **Reverse order**. **Clear posts** selects the `#empty` slot. **Reset** restores the initial posts. The highlighted **Source** view includes the `For` block and its nested `If`.

```mdc
::for{:each="data.posts" item="post" index="position" key="id"}
### {{ props.post.title }}

{{ props.post.description }}
#empty
No posts published yet.
::
```

## Usage

1. Import the plugin and its matching Vue component:

   ```ts
   import binding, { Binding, For, If } from '@comark/vue/plugins/binding'
   ```

2. Wire them into `<Markdown>`:

   ```vue
   <Markdown
     :value="markdown"
     :plugins="[binding()]"
     :components="{ Binding, For, If }"
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
| `data`        | The `data` prop passed to `<Markdown>`                 |
| `props`       | Props of the enclosing Comark component                |

See the [Binding plugin docs](/plugins/built-in/binding) and the [data binding contract](/syntax/components#data-binding) for the full reference.
