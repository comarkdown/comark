---
title: Model
description: "Two-way data binding with `::prop=\"path\"` attributes and the `ComarkModel` protocol."
navigation:
  icon: i-lucide-refresh-cw
seo:
  title: Model — Two-way binding
links:
  - label: Two-way syntax
    icon: i-lucide-link-2
    to: /syntax/components#two-way-binding
    color: neutral
    variant: soft
  - label: Parse API
    icon: i-lucide-code
    to: /reference/parse
    color: neutral
    variant: soft
---

The `comark/model` entry point provides the `ComarkModel` protocol and the `createModelStore` factory for two-way data binding. When a `::prop="path"` attribute is present on a component or native form element, the renderer reads the current value from the model and wires an update handler that writes back when the user interacts with the element.

Two-way binding is opt-in. Consumers who never import `comark/model` pay no bundle cost.

## Basic usage

### Creating a model store

```typescript
import { createModelStore } from 'comark/model'

const model = createModelStore({
  data: { data: { name: 'Alice', active: false } },
})
```

### Using the model with a framework renderer

Pass the `model` prop to `<Markdown>` or `<MarkdownDocument>`. The renderer wires native form elements automatically.

```vue [Vue]
<script setup>
import { Markdown } from '@comark/vue'
import { createModelStore } from 'comark/model'

const model = createModelStore({ data: { data: { name: '' } } })
</script>

<template>
  <Markdown :model="model">
    :input{::value="data.name" type="text"}
  </Markdown>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import { createModelStore } from 'comark/model'

const model = createModelStore({ data: { data: { name: '' } } })

export default function App() {
  return (
    <Markdown model={model}>
      {':input{::value="data.name" type="text"}'}
    </Markdown>
  )
}
```

## `::prop` syntax

A `::prop="path"` attribute performs two-way binding on any Comark component or native HTML element.

```md
<!-- Custom component — receives prop + onUpdate:prop -->
::card{::title="data.heading"}
content
::

<!-- Native input — value is controlled; oninput/onchange updates the model -->
:input{::value="data.name" type="text"}
:input{::checked="data.active" type="checkbox"}
:select{::value="data.color"}
```

The dot-path resolves against the model's data namespaces. By default, only `data.*` paths are writable.

### Supported native element bindings

| Element | Type | Model prop | Event |
|---------|------|-----------|-------|
| `<input>` | `text`, `email`, … | `value` | `input` |
| `<input>` | `number`, `range` | `value` (Number) | `input` |
| `<input>` | `date`, `time`, … | `value` | `change` |
| `<input>` | `checkbox` | `checked` (Boolean) | `change` |
| `<input>` | `radio` | `checked` (String value) | `change` |
| `<input>` | `file` | `files` (FileList) | `change` |
| `<select>` | — | `value` | `change` |
| `<textarea>` | — | `value` | `input` |

## `ComarkModel` protocol

A custom reactive store can be used in place of `createModelStore` by implementing three methods:

```typescript
import type { ComarkModel } from 'comark/model'

const model: ComarkModel = {
  get(path: string): unknown { /* ... */ },
  set(path: string, value: unknown): boolean { /* return false to reject */ },
  subscribe(path: string, fn: (value: unknown) => void): () => void { /* return teardown */ },
  // optional:
  batch<T>(fn: () => T): T { /* ... */ },
}
```

`subscribe` receives the path and every ancestor. A write to `data.a.b` notifies `data.a.b`, `data.a`, and `data`.

## `createModelStore` options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `Record<string, unknown>` | `{}` | Initial store contents. |
| `writable` | `readonly string[]` | `['data']` | Top-level namespace keys that accept writes. |
| `onChange` | `(path, value, snapshot) => void` | — | Called after each accepted write. Use for persistence or controlled-mode observation. |
| `documentKey` | `string` | — | When set, writes are also published as `{ op: 'data' }` patches into `globalThis.comarkContext` for `MarkdownLive` subscribers. |

## Controlled vs. uncontrolled mode

**Uncontrolled** (default) — the renderer creates a private model store from the initial `data` prop and manages state internally.

**Controlled** — pass your own `model` instance (and optionally `onModelChange` to observe writes). The renderer reads from and writes to your store.

```vue [Controlled mode — Vue]
<script setup>
import { Markdown } from '@comark/vue'
import { createModelStore } from 'comark/model'
import { ref, watchEffect } from 'vue'

const model = createModelStore({ data: { data: { name: 'Alice' } } })

// Observe writes externally.
model.subscribe('data.name', (v) => console.log('name changed to', v))
</script>
<template>
  <Markdown :model="model">
    :input{::value="data.name"}
  </Markdown>
</template>
```

## Security

Two-way bindings share the same URL-safety guard as one-way (`:prop`) bindings. A `::href` or `::src` that resolves to a `javascript:` or `data:text/html` URL is silently dropped.

Writes are checked against the `writable` namespace list before the path is applied. The `set()` utility rejects `__proto__`, `constructor`, and `prototype` path segments to prevent prototype pollution.

Filtered expressions (`::prop="path | filter"`) are not assignable — they degrade to one-way read-only in production and throw in development.

## `::form` aggregate

The `::form` component wraps a `<form>` element and aggregates all native field values into one object when the form is submitted, writing the result to a single model path.

```md
::form{::value="data.contact"}
  :input{::value="data.name" name="name" type="text"}
  :input{::value="data.email" name="email" type="email"}
  :button{type="submit"} Submit ::
::
```

On submit, the component collects `FormData` from the underlying `<form>` and calls the model write handler with `{ name: …, email: … }`.

### Setup per framework

```vue [Vue]
<script setup>
import { Markdown } from '@comark/vue'
import { Form } from '@comark/vue/plugins/form'
import { createModelStore } from 'comark/model'

const model = createModelStore({ data: { data: { contact: {} } } })
</script>

<template>
  <Markdown :model="model" :components="{ form: Form }">
    ::form{::value="data.contact"}
      :input{::value="data.name" name="name" type="text"}
    ::
  </Markdown>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import { Form } from '@comark/react/plugins/form'
import { createModelStore } from 'comark/model'

const model = createModelStore({ data: { data: { contact: {} } } })

export default function App() {
  return (
    <Markdown model={model} components={{ form: Form }}>
      {'::form{::value="data.contact"}\n  :input{name="name" type="text"}\n::'}
    </Markdown>
  )
}
```

```svelte [Svelte]
<script>
  import { Markdown } from '@comark/svelte'
  import { Form } from '@comark/svelte/plugins/form'
  import { createModelStore } from 'comark/model'

  const model = createModelStore({ data: { data: { contact: {} } } })
</script>

<Markdown {model} components={{ form: Form }}>
  ::form{::value="data.contact"}
    :input{name="name" type="text"}
  ::
</Markdown>
```

## Inputs recipe

The table below maps every common HTML input type to its Comark two-way binding form.

| Input | Comark syntax | Model value type |
|-------|--------------|-----------------|
| Text field | `:input{::value="data.name" type="text"}` | `string` |
| Email | `:input{::value="data.email" type="email"}` | `string` |
| Number | `:input{::value="data.count" type="number"}` | `number` |
| Range slider | `:input{::value="data.volume" type="range"}` | `number` |
| Checkbox | `:input{::checked="data.active" type="checkbox"}` | `boolean` |
| Radio | `:input{::checked="data.color" value="red" type="radio"}` | `string` (the `value` attr) |
| Date | `:input{::value="data.date" type="date"}` | `string` (ISO format) |
| Password | `:input{::value="data.pass" type="password"}` | `string` |
| Textarea | `:textarea{::value="data.bio"}` | `string` |
| Select | `:select{::value="data.country"}` | `string` |
| File | `:input{::value="data.file" type="file"}` | `FileList` |

All read-back coercions (string → number, string → boolean, …) happen automatically via the `resolveModelElement` helper shared across all framework renderers.

## HTML progressive enhancement

When using `@comark/html`, the rendered output includes `data-comark-model-{prop}` attributes on two-way-bound elements. Import `@comark/html/runtime` in the browser to activate client-side updates without a framework.

```html
<!-- Server-rendered output (inert by default) -->
<input value="Alice" data-comark-model-value="data.name" type="text">

<!-- Add the runtime in the browser -->
<script type="module">
  import { initModelRuntime } from '@comark/html/runtime'
  initModelRuntime(document.getElementById('root'))
</script>
```

## ANSI renderer

The ANSI renderer (`@comark/ansi`) renders `::prop` bindings as read-only. The current value is shown; writes are silently ignored. A single per-process warning is emitted in development.
