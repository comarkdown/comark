---
title: Binding
description: "Comark plugin that adds a `{{ path || default }}` inline shorthand for interpolating frontmatter, meta, or runtime data into your content."
navigation:
  icon: i-lucide-replace
seo:
  title: Binding Plugin
links:
  - label: Data Binding
    icon: i-lucide-link-2
    to: /syntax/components#data-binding
    color: neutral
    variant: soft
  - label: Parse API
    icon: i-lucide-code
    to: /api/parse
    color: neutral
    variant: soft
---

The `comark/plugins/binding` plugin adds a `{{ path || default }}` inline shorthand for interpolating values from frontmatter, the renderer's `data` prop, the tree's `meta`, or a parent component's `props` directly into your markdown.

Under the hood it emits a `binding` component node whose `:value` attribute points at a dot-path. The [data binding](/syntax/components#data-binding) layer resolves that path against the ambient render context, so bindings work seamlessly across HTML, ANSI, React, Svelte, and Vue — and round-trip back to their source form via `renderMarkdown`.

## Basic Usage

### Registering the Plugin

```typescript [parse.ts]
import { parse } from 'comark'
import binding from 'comark/plugins/binding'

const tree = await parse(content, {
  plugins: [binding()],
})
```

### In Markdown

Wrap a dot-path in `{{ … }}` to interpolate a value, and use `||` to declare a default for unresolved paths:

```mdc
---
user:
  name: Ada
  role: admin
---

Welcome, {{ frontmatter.user.name || guest }} ({{ frontmatter.user.role }}).
```

Rendered HTML:

```html
<p>Welcome, Ada (admin).</p>
```

## Render Handlers

The plugin ships a renderer-specific `Binding` export for every first-party package so the `<binding>` AST node turns into the resolved value (falling back to the `|| default`) rather than a literal `<binding>` tag.

::code-group

```typescript [HTML]
import binding, { Binding } from '@comark/html/plugins/binding'
import { createRender } from '@comark/html'

const render = createRender({
  plugins: [binding()],
  components: { Binding },
})

const html = await render(`
---
user:
  name: Ada
---

Hello {{ frontmatter.user.name }}!
`)
// → <p>Hello Ada!</p>
```

```typescript [ANSI]
import binding, { Binding } from '@comark/ansi/plugins/binding'
import { renderANSI } from '@comark/ansi'
import { parse } from 'comark'

const tree = await parse('Score: {{ data.score || 0 }}', { plugins: [binding()] })
const out = await renderANSI(tree, {
  components: { Binding },
  data: { score: 42 },
})
// → Score: 42
```

```vue [Vue]
<script setup lang="ts">
import { Comark } from '@comark/vue'
import binding, { Binding } from '@comark/vue/plugins/binding'

const markdown = `---
user:
  name: Ada
---

Welcome, {{ frontmatter.user.name || guest }}.`
</script>

<template>
  <Suspense>
    <Comark
      :markdown="markdown"
      :plugins="[binding()]"
      :components="{ Binding }"
    />
  </Suspense>
</template>
```

```tsx [React]
import { Comark } from '@comark/react'
import binding, { Binding } from '@comark/react/plugins/binding'

const markdown = `---
user:
  name: Ada
---

Welcome, {{ frontmatter.user.name || guest }}.`

export default function App() {
  return (
    <Comark
      markdown={markdown}
      plugins={[binding()]}
      components={{ Binding }}
    />
  )
}
```

```svelte [Svelte]
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import binding, { Binding } from '@comark/svelte/plugins/binding'

  const markdown = `---
user:
  name: Ada
---

Welcome, {{ frontmatter.user.name || guest }}.`
</script>

<Comark
  {markdown}
  plugins={[binding()]}
  components={{ Binding }}
/>
```

::

### Markdown round-trip

When you re-serialize the AST with `renderMarkdown`, you can pass the core `Binding` handler to preserve the original `{{ … }}` shorthand:

```typescript [render-markdown.ts]
import { parse } from 'comark'
import { renderMarkdown } from 'comark/render'
import binding, { Binding } from 'comark/plugins/binding'

const tree = await parse('Hi {{ user.name }}!', { plugins: [binding()] })

const source = await renderMarkdown(tree, {
  components: { Binding },
})
// → "Hi {{ user.name }}!\n"
```

## Resolution Scope

A binding value (`{{ path }}`) is resolved as a dot-path against the same render context used by `:prefix` component bindings:

| Namespace     | Source                                                             |
| ------------- | ------------------------------------------------------------------ |
| `frontmatter` | The document's YAML frontmatter                                    |
| `meta`        | Plugin-populated metadata on the parsed tree                        |
| `data`        | Runtime values passed via the renderer's `data` prop               |
| `props`       | The enclosing component's own props (useful for nested components) |

See [Data Binding](/syntax/components#data-binding) for the full contract and additional examples.

## Default Values

Use `|| default` to specify a fallback that's emitted when the dot-path does not resolve:

```mdc
Hello {{ data.user.name || guest }}!
```

- If `data.user.name` resolves, its value is rendered.
- Otherwise the literal text after `||` is rendered (trim and quote as you see fit — YAML rules don't apply here).

## Custom Tag Name

You can swap the emitted element tag via the plugin's `tag` option. This is handy if you already use `binding` as a custom component name:

```typescript
import binding from 'comark/plugins/binding'

const tree = await parse('{{ x }}', {
  plugins: [binding({ tag: 'prop' })],
})

// AST: ['p', {}, ['prop', { ':value': 'x' }]]
```

Pair this with a `components: { prop: Binding }` mapping to preserve the render behavior.

## API Reference

### `binding(options?: MdcInlineBindingOptions): ComarkPlugin`

Register the inline-binding parser.

| Option | Type     | Default     | Description                                  |
| ------ | -------- | ----------- | -------------------------------------------- |
| `tag`  | `string` | `"binding"` | Tag name used for the emitted inline element |

### `Binding`

Every first-party package exports a `Binding` handler/component tailored to its rendering target. Each one:

- Prefers the already-resolved `value` prop supplied by the data-binding layer
- Falls back to `defaultValue` when the path does not resolve
- Emits an empty string when neither is available (the ANSI variant shows a dimmed `{{ path }}` placeholder for debuggability)

```typescript
// markdown (source shorthand)
import { Binding } from 'comark/plugins/binding'

// HTML
import { Binding } from '@comark/html/plugins/binding'

// ANSI
import { Binding } from '@comark/ansi/plugins/binding'

// React
import { Binding } from '@comark/react/plugins/binding'

// Svelte
import { Binding } from '@comark/svelte/plugins/binding'

// Vue
import { Binding } from '@comark/vue/plugins/binding'
```

## Use Cases

1. **Personalized content** — greet users by name from frontmatter or runtime data:

   ```mdc
   Hello {{ data.user.name || friend }}!
   ```

2. **Documentation templates** — interpolate configuration or versioned values:

   ```mdc
   ---
   version: 2.5.1
   ---

   You are reading the docs for **v{{ frontmatter.version }}**.
   ```

3. **Dynamic tables** — combine with frontmatter-driven rows:

   ```mdc
   ---
   stats:
     users: 1200
     uptime: 99.9%
   ---

   | Metric | Value                       |
   | ------ | --------------------------- |
   | Users  | {{ frontmatter.stats.users }} |
   | Uptime | {{ frontmatter.stats.uptime }} |
   ```

4. **Component props** — reference an enclosing component's resolved attributes:

   ```mdc
   ::card{title="Hello"}
     Title is {{ props.title }}.
   ::
   ```

## See Also

- [Data Binding](/syntax/components#data-binding) — the underlying `:prefix` resolution contract
- [Component Syntax](/syntax/components) — the full Comark component API
- [Creating Plugins](/plugins/creating-plugins) — build your own plugins
