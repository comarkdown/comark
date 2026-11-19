---
title: Alerts
description: Built-in plugin that turns GitHub-style alert blockquotes into typed callout blocks.
seo:
  title: Alerts Plugin
navigation:
  icon: i-lucide-bell
links:
  - label: Markdown syntax
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

The alerts plugin recognizes GitHub-flavored alert blockquotes (the `[!NOTE]` syntax used in GitHub READMEs and issues) and tags them in the AST so your renderer can display callout blocks.

This plugin is **built-in and enabled by default**, so you don't need to install or register it.

## Usage

Alerts use standard blockquote syntax with a marker on the first line:

```mdc
> [!NOTE]
> Background information worth noticing, even when skimming.

> [!TIP]
> Practical advice for getting a better result.

> [!IMPORTANT]
> Key details readers need to finish the task.

> [!WARNING]
> Urgent details that require immediate attention to avoid problems.

> [!CAUTION]
> Risks or destructive consequences of an action.
```

The plugin tags the blockquote in the AST and leaves visuals to your renderer. You can map each alert type to your own component (see [Custom components](#custom-components)) or style the plain output with CSS. On this site, alert types map to callout components and render as follows:

> [!NOTE]
> Background information worth noticing, even when skimming.

> [!TIP]
> Practical advice for getting a better result.

> [!IMPORTANT]
> Key details readers need to finish the task.

> [!WARNING]
> Urgent details that require immediate attention to avoid problems.

> [!CAUTION]
> Risks or destructive consequences of an action.

---

## Features

### Alert types

| Marker | Color | Use for |
|---|---|---|
| `[!NOTE]` | Blue | Supplementary information |
| `[!TIP]` | Green | Practical tips and shortcuts |
| `[!IMPORTANT]` | Purple | Critical information for completing a task |
| `[!WARNING]` | Yellow | Potential problems that need attention |
| `[!CAUTION]` | Red | Dangerous actions or destructive operations |

### Multi-line content

Alerts can span multiple lines and contain inline Markdown:

```mdc
> [!WARNING]
> **Breaking change** in v2.0: the `parseMarkdown()` function is now async.
> Update all call sites to use `await parseMarkdown(...)`.
```

---

## How it works

The plugin strips the `[!NOTE]` marker from the blockquote and adds an `as` attribute to the `blockquote` node in the AST:

```ts
import { parseMarkdown } from 'comark'

const tree = await parseMarkdown(`> [!NOTE]
> Useful information for users.`)

console.log(tree.nodes)
// [
//   ['blockquote', { as: 'note' }, 'Useful information for users.']
// ]
```

The Vue, React, and Angular renderers check your `components` map for the `as` attribute before falling back to the `blockquote` tag, so each alert type can render with its own component. In the HTML renderer, register a `blockquote` handler and read the alert type from `attrs.as`.

## Custom components

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
import { renderHtml } from '@comark/html'

const html = await renderHtml(`> [!NOTE]
> Useful information for users.`, {
  components: {
    // The HTML renderer resolves by tag name, so read the alert type from `attrs.as`
    blockquote: async ([, attrs, ...children], { render }) => {
      if (!attrs.as) return `<blockquote>${await render(children)}</blockquote>`
      return `<div class="alert alert-${attrs.as}" role="alert">${await render(children)}</div>`
    },
  },
})
// <div class="alert alert-note" role="alert">Useful information for users.</div>
```
::

Alert types without a registered component render as `<blockquote as="...">`, which you can style in CSS with `blockquote[as="note"]`.

---

## Nuxt UI integration

When you use the [Nuxt module](/rendering/vue#nuxt) with `@nuxt/ui`, alert blocks map to Nuxt UI's `<Note>`, `<Warning>`, `<Caution>`, and `<Tip>` components without extra configuration.
