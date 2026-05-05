---
title: JSON Render
description: Plugin for rendering JSON Render specs as UI components in Comark. Supports both json-render and yaml-render code blocks.
seo:
  title: JSON Render Plugin
navigation:
  icon: i-lucide-braces
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /api/parse
    color: neutral
    variant: soft
  - label: Plugin Example
    icon: i-lucide-code
    to: /examples/plugins/vue-vite-json-render
    color: neutral
    variant: soft
---

The `comark/plugins/json-render` plugin transforms `json-render` and `yaml-render` code blocks into UI components. It parses [JSON Render](https://json-render.dev/) specs and converts them into Comark AST nodes, enabling declarative UI composition within markdown. No additional dependencies required.

## Usage

::code-group

```vue [Vue]
<script setup lang="ts">
import { Comark } from '@comark/vue'
import jsonRender from '@comark/vue/plugins/json-render'
</script>

<template>
  <Suspense>
    <Comark :plugins="[jsonRender()]">{{ content }}</Comark>
  </Suspense>
</template>
```

```tsx [React]
import { Comark } from '@comark/react'
import jsonRender from '@comark/react/plugins/json-render'

<Comark plugins={[jsonRender()]}>{content}</Comark>
```

```svelte [Svelte]
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import jsonRender from '@comark/svelte/plugins/json-render'
</script>

<Comark {content} plugins={[jsonRender()]} />
```

::

---

## Features

### Full Spec

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

- **`root`** — Key of the root element in the `elements` map
- **`elements`** — Map of element definitions, each with `type`, `props`, and optional `children`

### Single Element

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

The plugin automatically wraps this shorthand in a full spec with a `template` root.

---

## API

### `jsonRender()`

Returns a `ComarkPlugin` that replaces `json-render` and `yaml-render` code blocks with Comark AST nodes. Takes no options.

**Returns:** `ComarkPlugin`

The plugin runs in the `post` phase, walking the AST for `pre` nodes with `language: "json-render"` or `language: "yaml-render"`, parsing the spec, and replacing the node with the generated elements. `Text` type elements become plain text nodes; all other types become element nodes with their props as attributes.
