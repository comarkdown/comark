---
title: Mermaid diagrams
description: Render Mermaid diagrams from fenced code blocks in Comark.
seo:
  title: Mermaid Diagrams Plugin
navigation:
  icon: i-simple-icons-mermaid
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /reference/parse
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/mermaid` plugin renders [Mermaid](https://mermaid.js.org/) diagrams from ` ```mermaid ` code blocks. Diagrams render client-side via the `<Mermaid>` component exported alongside the plugin.

::note
[`beautiful-mermaid`](https://github.com/lukilabs/beautiful-mermaid) is a peer dependency. Install it alongside Comark with `npm install beautiful-mermaid`.
::

## Usage

```typescript
import { parseMarkdown } from 'comark'
import mermaid from 'comark/plugins/mermaid'

const result = await parseMarkdown(content, {
  plugins: [mermaid()]
})
```

With framework components, pass both the plugin and the `Mermaid` renderer component:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
</script>

<template>
  <Suspense>
    <Markdown
      :components="{ mermaid: Mermaid }"
      :plugins="[mermaid()]"
    >{{ content }}</Markdown>
  </Suspense>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import mermaid, { Mermaid } from '@comark/react/plugins/mermaid'

<Markdown
  components={{ mermaid: Mermaid }}
  plugins={[mermaid()]}
>
  {content}
</Markdown>
```

```svelte [Svelte]
<script lang="ts">
  import { Markdown } from '@comark/svelte'
  import mermaid, { Mermaid } from '@comark/svelte/plugins/mermaid'
</script>

<Markdown {content} components={{ mermaid: Mermaid }} plugins={[mermaid()]} />
```

::

---

## Features

### Diagram types

Supported diagram types include:

**Flowchart**

````markdown
```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
```
````

**Sequence diagram**

````markdown
```mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob!
    Bob-->>Alice: Hello Alice!
```
````

**Class diagram**

````markdown
```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal: +isMammal()
```
````

**State diagram**

````markdown
```mermaid
stateDiagram-v2
    [*] --> Still
    Still --> Moving
    Moving --> Crash
    Crash --> [*]
```
````

**Gantt chart**

````markdown
```mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Task 1 :a1, 2024-01-01, 30d
    Task 2 :after a1, 20d
```
````

**Pie chart**

````markdown
```mermaid
pie title Pets
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15
```
````

**Git graph**

````markdown
```mermaid
gitGraph
    commit
    branch develop
    checkout develop
    commit
    checkout main
    merge develop
```
````

**ER diagram**

````markdown
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
```
````

See the [Mermaid documentation](https://mermaid.js.org/intro/) for the syntax reference for each diagram type.

### Code block attributes

Pass component props directly on the opening fence:

````markdown
```mermaid {theme="dark" width="800px" height="600px"}
graph TD
    A --> B
```
````

---

## API

### `mermaid(options?)`

Returns a `ComarkPlugin` that marks ` ```mermaid ` code blocks for custom rendering.

**Parameters:**

- `options?`: Optional `MermaidConfig`:
  - `theme?: ThemeNames`: Sets the `theme` attribute on every diagram node, passed as a prop to the `<Mermaid>` component
  - `themeDark?: ThemeNames`: Sets the `theme-dark` attribute, used in dark mode

**Returns:** `ComarkPlugin`

The plugin converts `mermaid` code blocks into AST nodes that the `<Mermaid>` component renders. Rendering requires passing `Mermaid` to the `components` prop of `<Markdown>` (see [Usage](#usage)).

---

## Component props

Props accepted by the `<Mermaid>` component:

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `string` | required | The Mermaid diagram source |
| `theme` | `string` | `undefined` | Mermaid theme. Defaults to `tokyo-light` (`tokyo-night` in dark mode). See [available themes](https://github.com/lukilabs/beautiful-mermaid#built-in-themes) |
| `themeDark` | `string` | `undefined` | Theme to use in dark mode |
| `width` | `string` | `'100%'` | Container width |
| `height` | `string` | `'auto'` | Container height |
| `class` | `string` | `''` | CSS classes for the container |

---

## Examples

::card{icon="i-simple-icons-mermaid" title="Vue + Vite Mermaid" to="/examples/plugins/vue-vite-mermaid"}
Runnable Vue and Vite example rendering multiple Mermaid diagram types.
::
