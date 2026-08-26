---
title: Attributes
description: Built-in plugin that parses inline attributes into AST props.
seo:
  title: Attributes Plugin
navigation:
  icon: i-lucide-tag
links:
  - label: Attribute Syntax
    icon: i-lucide-file-text
    to: /syntax/attributes
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/attributes` plugin enables Comark **inline attributes** (`{...}` after a token):

- Props after a token: `Hello {.cls}` → paragraph gets `class="cls"`
- Props on links, emphasis, headings, list items, and components
- Props on span wrappers from the [components plugin](/plugins/defaults/components): `[world]{.accent}`

The plugin is **enabled by default** via `registerDefaultPlugins`. No installation or registration required.

::tip
For the full authoring guide (shorthands, binding prefixes, limits), see [Attribute Syntax](/syntax/attributes).
::

## Usage

```mdc
# Title {.hero}

Hello [world]{class="accent"}.

[Docs](https://comark.dev){target="_blank"}
```

```typescript
import { parseMarkdown } from 'comark'

const result = await parseMarkdown('Hello {.cls}')
// → [ ['p', { class: 'cls' }, 'Hello'] ]

const span = await parseMarkdown('[world]{.accent}')
// → [ ['p', {}, ['span', { class: 'accent' }, 'world']] ]
```

### Explicit registration

When default plugins are off, opt in with the plugin directly:

```typescript
import { parseMarkdown } from 'comark'
import attributes from 'comark/plugins/attributes'

const result = await parseMarkdown(content, {
  registerDefaultPlugins: false,
  plugins: [attributes()],
})
```

With framework packages:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import attributes from '@comark/vue/plugins/attributes'
</script>

<template>
  <Markdown :plugins="[attributes()]">{{ content }}</Markdown>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import attributes from '@comark/react/plugins/attributes'

<Markdown plugins={[attributes()]}>{content}</Markdown>
```

::

### Disable attribute syntax

Turn off all defaults (including attributes):

```typescript
const result = await parseMarkdown(content, { registerDefaultPlugins: false })
```

With attributes disabled, `{...}` is left as plain text. Bare `[text]` span wrappers still require the [components plugin](/plugins/defaults/components).

## markdown-it / markdown-exit adapter

```typescript
import { markdownItAttributes } from 'comark/plugins/attributes'

md.use(markdownItAttributes)
```

Pair with [components](/plugins/defaults/components) when you also need `::name` / `:name` syntax:

```typescript
import { markdownItComponents } from 'comark/plugins/components'
import { markdownItAttributes } from 'comark/plugins/attributes'

md.use(markdownItComponents)
md.use(markdownItAttributes)
```

## How it works

The plugin registers `comark_inline_props` for `{class="highlight" id="intro"}` after a preceding token.

Hidden `mdc_inline_props` tokens are merged onto the previous token (or a wrapping span for bare text). Parent-level props on headings, paragraphs, and list items are lifted during `md.parse`.

Span openers (`[text]`) are provided by the [components plugin](/plugins/defaults/components); attributes only attach the trailing `{...}`.
