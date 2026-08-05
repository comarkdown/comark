---
title: Components
description: Built-in plugin that parses block and inline Comark component syntax into AST nodes.
seo:
  title: Components Plugin
navigation:
  icon: i-lucide-component
links:
  - label: Component Syntax
    icon: i-lucide-file-text
    to: /syntax/components
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/components` plugin enables Comark **block** and **inline** component syntax, plus span wrappers:

- Block: `::name` … `::` (and single-line shorthand `:name[content]{props}`)
- Inline: `:name`, `:name[content]`, `:name[content]{props}`
- Spans: `[text]` (add `{attrs}` with the [attributes plugin](/plugins/built-in/attributes))

The plugin is **enabled by default** via `registerDefaultPlugins`. No installation or registration required.

::tip
For the full authoring guide (props, slots, nesting), see [Component Syntax](/syntax/components).
::

## Usage

```mdc
::alert{type="info"}
Hello **world**
::

Inline :badge[New]{color="blue"} component.
```

```typescript
import { parseMarkdown } from 'comark'

const result = await parseMarkdown(`
::alert{type="info"}
Hello
::
`)
// → [ ['alert', { type: 'info' }, 'Hello'] ]
```

### Explicit registration

When default plugins are off, opt in with the plugin directly:

```typescript
import { parseMarkdown } from 'comark'
import components from 'comark/plugins/components'

const result = await parseMarkdown(content, {
  registerDefaultPlugins: false,
  plugins: [components()],
})
```

With framework packages, use the same plugin path under the framework scope (plain re-export):

::code-group

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import components from '@comark/vue/plugins/components'
</script>

<template>
  <Markdown :plugins="[components()]">{{ content }}</Markdown>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import components from '@comark/react/plugins/components'

<Markdown plugins={[components()]}>{content}</Markdown>
```

::

### Disable component syntax

Disable all defaults (including components):

```typescript
const result = await parseMarkdown(content, { registerDefaultPlugins: false })
```

Or replace the built-in plugin with a same-name stub while keeping other defaults:

```typescript
const result = await parseMarkdown(content, {
  plugins: [{ name: 'components' }],
})
```

When the components plugin is not active, `autoClose` also skips component-fence completion (`::` closers).

## markdown-it / markdown-exit adapter

For hosts that use markdown-it or markdown-exit directly (for example VitePress), use the exported adapter:

```typescript
import { markdownItComponents } from 'comark/plugins/components'
import { markdownItAttributes } from 'comark/plugins/attributes'

md.use(markdownItComponents)
md.use(markdownItAttributes) // optional; props on components need attributes too
```

## How it works

The plugin registers markdown-exit block and inline rules:

| Rule | Syntax |
|------|--------|
| `comark_block` / `comark_block_shorthand` | `::name` blocks and one-line shorthands |
| `comark_block_yaml` | YAML / fenced props blocks on components |
| `comark_block_slots` | `#slot` named slots |
| `comark_inline_span` | `[text]` span wrappers |
| `comark_inline_component` | `:name[content]{props}` inline components |

Token → AST conversion is handled by the core token processor (`mdc_block_*`, `mdc_inline_span`, `mdc_inline_component`).
