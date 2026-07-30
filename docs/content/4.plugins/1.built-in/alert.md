---
title: Alerts
description: Built-in plugin that transforms GitHub-style blockquote alerts into styled callout blocks with icons and colors.
seo:
  title: Alerts Plugin
navigation:
  icon: i-lucide-bell
links:
  - label: Markdown Syntax
    icon: i-lucide-file-text
    to: /syntax/markdown
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The alerts plugin transforms GitHub-flavored alert blockquotes into styled callout blocks with icons and colors, identical to how GitHub renders them in READMEs and issues.

The plugin is **built-in and enabled by default**. No installation or registration required.

## Usage

Alerts use standard blockquote syntax with a special marker on the first line:

```mdc
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

The plugin tags the blockquote in the AST and leaves the visuals to your renderer: map each alert type to your own component ([see below](#custom-components)) or style the plain output with CSS. On this site, alert types are mapped to callout components and render as:

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

---

## Features

### Alert Types

| Marker | Color | Use for |
|---|---|---|
| `[!NOTE]` | Blue | Supplementary information |
| `[!TIP]` | Green | Helpful hints and best practices |
| `[!IMPORTANT]` | Purple | Critical information for success |
| `[!WARNING]` | Yellow | Potential issues and gotchas |
| `[!CAUTION]` | Red | Dangerous actions or destructive operations |

### Multi-line Content

Alerts can span multiple lines and contain inline markdown:

```mdc
> [!WARNING]
> **Breaking change** in v2.0: the `parse()` function is now async.
> Update all call sites to use `await parse(...)`.
```

---

## How It Works

The plugin transforms the alert blockquote in the AST: the `[!NOTE]` marker is removed and an `as` attribute is added to the `blockquote` node.

```ts
import { parse } from 'comark'

const tree = await parse(`> [!NOTE]
> Useful information for users.`)

console.log(tree.nodes)
// [
//   ['blockquote', { as: 'note' }, 'Useful information for users.']
// ]
```

The Vue, React, and Angular renderers resolve the `as` attribute against your components map first, then fall back to the tag name (`blockquote`). This means you can render each alert type with its own component. In the HTML renderer, register a `blockquote` component and read the alert type from `attrs.as`.

## Custom Components

Register a component for each alert type you want to customize:

::code-group
```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import Note from './Note.vue'
import Warning from './Warning.vue'

const markdown = `> [!NOTE]
> Useful information for users.`
</script>

<template>
  <Markdown :components="{ note: Note, warning: Warning }">{{ markdown }}</Markdown>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import { Note } from './Note'
import { Warning } from './Warning'

const markdown = `> [!NOTE]
> Useful information for users.`

export default function Page() {
  return <Markdown components={{ note: Note, warning: Warning }}>{markdown}</Markdown>
}
```

```ts [HTML]
import { render } from '@comark/html'

const html = await render(`> [!NOTE]
> Useful information for users.`, {
  components: {
    // The HTML renderer resolves by tag name: read the alert type from `attrs.as`
    blockquote: async ([, attrs, ...children], { render }) => {
      if (!attrs.as) return `<blockquote>${await render(children)}</blockquote>`
      return `<div class="alert alert-${attrs.as}" role="alert">${await render(children)}</div>`
    },
  },
})
// <div class="alert alert-note" role="alert">Useful information for users.</div>
```
::

Alert types without a registered component render as a regular `<blockquote as="...">` element, so you can also target them with CSS: `blockquote[as="note"]`.

---

## Nuxt UI Integration

When using the [Nuxt module](/rendering/nuxt) alongside `@nuxt/ui`, alert blocks are automatically mapped to Nuxt UI's `<Note>`, `<Warning>`, `<Caution>`, and `<Tip>` components. No extra configuration needed.
