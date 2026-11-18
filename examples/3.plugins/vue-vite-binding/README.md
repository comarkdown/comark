# Binding and conditional content in Vue and Vite

This example updates Markdown data bindings and `::if` branches with live form controls in Vue and Vite using `@comark/vue/plugins/binding`.

## Features

- **`{{ path }}` interpolation**: reads values from frontmatter, the renderer's `data` prop, or a parent component's `props`.
- **`|| default` fallback**: renders an inline fallback when a dot path does not resolve.
- **Parent props**: nested components read their enclosing component's resolved attributes through `props.`.
- **Typed values**: bound props receive strings, numbers, booleans, and objects without stringifying them first.
- **Conditional content**: `If` evaluates truthiness checks, equality checks, numeric ranges, and nested `#else` branches.
- **Live form controls**: text, select, range, and checkbox inputs bind via `v-model` (and `v-model.number` on the age slider) to the reactive state passed to `<Markdown>`.
- **Highlighted source**: the **Source** view uses Rangi's Comark grammar to highlight bindings, components, and slots.

## Run locally

From the monorepo root:

```bash
pnpm dev:binding
```

Change the role, move the age slider across 18 or 65, and toggle the mood checkboxes to watch the selected branches update. Switch between **Preview** and **Source** above the Markdown panel while keeping your form values.

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

3. Interpolate values with `{{ path || default }}` in Markdown:

   ```markdown
   ---
   release:
     version: 2.5.1
   ---

   Hello, {{ data.user.name || friend }}. You are on v{{ frontmatter.release.version }}.
   ```

4. Select branches conditionally with `::if` and `#else`:

   ```markdown
   ::if{:value="data.user.age" :gte="18" :lt="65"}
   You are eligible for the 18 to 64 age group.
   #else
   You are outside the 18 to 64 age group.
   ::
   ```

   Passing `:value` alone checks truthiness. When comparison props are present, every comparison must pass. Nest another `::if` inside `#else` to evaluate a fallback condition.

## Namespaces

Bindings resolve against four namespaces:

| Namespace     | Source                                      |
| ------------- | ------------------------------------------- |
| `frontmatter` | YAML frontmatter on the parsed document     |
| `meta`        | Plugin metadata attached to `document.meta` |
| `data`        | The `data` prop passed to `<Markdown>`      |
| `props`       | Resolved props of the enclosing component   |

## Learn more

- [Binding plugin documentation](https://comark.dev/plugins/built-in/binding)
- [Component data binding](https://comark.dev/syntax/components#data-binding)
- [Comark documentation](https://comark.dev)
