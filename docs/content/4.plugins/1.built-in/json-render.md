---
title: JSON Render
description: Render JSON Render specs as UI components from json-render and yaml-render code blocks.
seo:
  title: JSON Render Plugin
navigation:
  icon: i-lucide-braces
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /reference/parse
    color: neutral
    variant: soft
  - label: Plugin example
    icon: i-lucide-code
    to: /examples/plugins/vue-vite-json-render
    color: neutral
    variant: soft
---

The `comark/plugins/json-render` plugin parses [JSON Render](https://json-render.dev/) specs in `json-render` and `yaml-render` code blocks and converts them into Comark AST nodes that render through your `components` map. It requires no extra dependencies.

## Usage

::code-group

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import jsonRender from '@comark/vue/plugins/json-render'
</script>

<template>
  <Suspense>
    <Markdown :plugins="[jsonRender()]">{{ content }}</Markdown>
  </Suspense>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import jsonRender from '@comark/react/plugins/json-render'

<Markdown plugins={[jsonRender()]}>{content}</Markdown>
```

```svelte [Svelte]
<script lang="ts">
  import { Markdown } from '@comark/svelte'
  import jsonRender from '@comark/svelte/plugins/json-render'
</script>

<Markdown {content} plugins={[jsonRender()]} />
```

::

---

## Features

### Full spec

A full spec defines a tree of named elements with a root entry point. Both JSON and YAML are supported and produce identical output:

::code-group

~~~json [json-render]
```json-render
{
  "root": "card-1",
  "elements": {
    "card-1": {
      "type": "Card",
      "props": { "title": "Welcome" },
      "children": ["text-1"]
    },
    "text-1": {
      "type": "Text",
      "props": { "content": "Hello from JSON Render" }
    }
  }
}
```
~~~

~~~yaml [yaml-render]
```yaml-render
root: card-1
elements:
  card-1:
    type: Card
    props:
      title: Welcome
    children:
      - text-1
  text-1:
    type: Text
    props:
      content: Hello from JSON Render
```
~~~

::

- **`root`**: Key of the root element in the `elements` map
- **`elements`**: Map of element definitions, each with `type`, `props`, and optional `children`

### Single element

When only one element is needed, omit `root` and `elements`:

::code-group

~~~json [json-render]
```json-render
{
  "type": "Text",
  "props": { "content": "Hello World" }
}
```
~~~

~~~yaml [yaml-render]
```yaml-render
type: Text
props:
  content: Hello World
```
~~~

::

The plugin wraps this shorthand in a full spec with a `template` root.

---

## API

### `jsonRender()`

Returns a `ComarkPlugin` that replaces `json-render` and `yaml-render` code blocks with Markdown AST nodes. Takes no options.

**Returns:** `ComarkPlugin`

In the `post` hook, the plugin finds `pre` nodes with `language: "json-render"` or `language: "yaml-render"`, parses the spec, and replaces each block with the resulting AST nodes. `Text` elements become plain text nodes, and all other element types become element nodes with their `props` as attributes.
