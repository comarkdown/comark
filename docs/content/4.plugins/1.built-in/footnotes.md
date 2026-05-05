---
title: Footnotes
description: Plugin for adding footnote references and definitions to your Comark documents.
navigation:
  icon:  i-lucide-footprints
seo:
  title: Footnotes Plugin
  description: Plugin for adding footnote references and definitions to your Comark documents.
links:
  - label: Parse API
    icon: i-lucide-code
    to: /api/parse
    color: neutral
    variant: soft
  - label: Vue Rendering
    icon: i-simple-icons-vuedotjs
    to: /rendering/vue
    color: neutral
    variant: soft
---

The Footnotes plugin adds support for footnote references and definitions. References are rendered as superscript links, and definitions are collected into a numbered list at the end of the document with back-reference links.

No peer dependencies are required.

## Basic Usage

### With Vue

```vue [App.vue]
<script setup lang="ts">
import { Comark } from '@comark/vue'
import footnotes from '@comark/vue/plugins/footnotes'

const markdown = `
Comark supports footnotes[^1] with back-references[^2].

[^1]: Footnotes are rendered as a list at the end of the document.
[^2]: Each footnote includes a back-reference link to return to the text.
`
</script>

<template>
  <Suspense>
    <Comark :plugins="[footnotes()]">{{ markdown }}</Comark>
  </Suspense>
</template>
```

### With React

```tsx [App.tsx]
import { Comark } from '@comark/react'
import footnotes from '@comark/react/plugins/footnotes'

const markdown = `
Comark supports footnotes[^1] with back-references[^2].

[^1]: Footnotes are rendered as a list at the end of the document.
[^2]: Each footnote includes a back-reference link to return to the text.
`

function App() {
  return (
    <Comark plugins={[footnotes()]}>{markdown}</Comark>
  )
}
```

### With Svelte

```svelte [App.svelte]
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import footnotes from '@comark/svelte/plugins/footnotes'

  const markdown = `
Comark supports footnotes[^1] with back-references[^2].

[^1]: Footnotes are rendered as a list at the end of the document.
[^2]: Each footnote includes a back-reference link to return to the text.
`
</script>

<Comark {markdown} plugins={[footnotes()]} />
```

### With Parse API

```typescript [parse.ts]
import { parse } from 'comark'
import footnotes from 'comark/plugins/footnotes'

const result = await parse('Hello[^1]\n\n[^1]: World', {
  plugins: [footnotes()]
})
```

## Syntax

### Footnote References

Use `[^label]` anywhere inline to insert a footnote reference:

```mdc
The theory of relativity[^1] changed physics.

Einstein also contributed to quantum mechanics[^qm].
```

Labels can be numbers or text — they serve as identifiers and are replaced with sequential numbers in the output.

### Footnote Definitions

Define footnotes with `[^label]: content` on its own line:

```mdc
[^1]: Albert Einstein published special relativity in 1905.
[^qm]: See the photoelectric effect paper, also from 1905.
```

Definitions can appear anywhere in the document — they are removed from their original position and collected into the footnotes section.

### Complete Example

```mdc
# Research Notes

The standard model[^sm] describes three of the four fundamental forces.
Gravity remains described by general relativity[^gr].

Dark matter[^dm] accounts for approximately 27% of the universe.

[^sm]: The Standard Model of particle physics classifies all known elementary particles.
[^gr]: Einstein's general theory of relativity, published in 1915.
[^dm]: Dark matter is inferred from gravitational effects on visible matter.
```

## Rendered Output

The plugin produces the following AST structure:

**Inline references** become superscript links:

```json
["sup", { "class": "footnote-ref" },
  ["a", { "href": "#fn-1", "id": "fnref-1" }, "[1]"]
]
```

**Footnotes section** is appended to the end of the document:

```json
["section", { "class": "footnotes" },
  ["hr", {}],
  ["h2", { "id": "footnotes" }, "Footnotes"],
  ["ol", { "class": "footnotes-list" },
    ["li", { "id": "fn-1" },
      "Definition text", " ",
      ["a", { "href": "#fnref-1", "class": "footnote-backref" }, "↩"]
    ]
  ]
]
```

## Configuration

```typescript
footnotes({
  label: 'Footnotes',  // Section heading text
  hr: true,             // Add <hr> before the section
  backRef: '↩',         // Back-reference symbol
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `label` | `string` | `'Footnotes'` | Heading text for the footnotes section |
| `hr` | `boolean` | `true` | Whether to render a horizontal rule before the section |
| `backRef` | `string` | `'↩'` | Symbol used for the back-reference link |

### Custom Configuration

```typescript
import footnotes from 'comark/plugins/footnotes'

// Use "References" heading, no horizontal rule, custom symbol
const plugin = footnotes({
  label: 'References',
  hr: false,
  backRef: '⬆',
})
```

## CSS Classes

The plugin adds CSS classes for styling:

| Element | Class | Description |
|---------|-------|-------------|
| `<sup>` | `footnote-ref` | Wrapper around the inline reference link |
| `<section>` | `footnotes` | The footnotes section container |
| `<ol>` | `footnotes-list` | The ordered list of footnote definitions |
| `<a>` | `footnote-backref` | The back-reference link in each definition |

### Example Styles

```css
.footnote-ref {
  font-size: 0.75em;
  vertical-align: super;
  line-height: 0;
}

.footnote-ref a {
  color: #2563eb;
  text-decoration: none;
}

.footnotes {
  margin-top: 2rem;
  font-size: 0.9em;
  color: #555;
}

.footnotes hr {
  border: none;
  border-top: 1px solid #ddd;
}

.footnotes-list li {
  margin-bottom: 0.4em;
}

.footnote-backref {
  color: #2563eb;
  text-decoration: none;
  margin-left: 0.25em;
}
```

## Numbering

Footnotes are numbered in the order they are **first referenced** in the document, not the order they are defined:

```mdc
Second definition referenced first[^b], then first[^a].

[^a]: This becomes footnote 2.
[^b]: This becomes footnote 1.
```

Referencing the same footnote multiple times reuses the same number.

## Footnotes in Inline Formatting

Footnote references work inside bold, italic, and other inline formatting:

```mdc
**Bold text with a footnote[^1]** and *italic with another[^2]*.

[^1]: Works inside bold.
[^2]: Works inside italic too.
```

## Stringify (Markdown Rendering)

The plugin exports a `Footnote` conditional handler that converts the footnote AST back into standard markdown footnote syntax. This is useful when you want to render a `ComarkTree` back to markdown and preserve footnotes.

```typescript
import { parse } from 'comark'
import { renderMarkdown } from 'comark/render'
import footnotes, { Footnote } from 'comark/plugins/footnotes'

const tree = await parse('Hello[^1]\n\n[^1]: World', {
  plugins: [footnotes()]
})

const md = await renderMarkdown(tree, {
  components: { footnotes: Footnote },
})
// Hello[^1]
//
// [^1]: World
```

Without `Footnote`, `renderMarkdown` would serialize the footnote HTML structure (sup, section, ol, etc.) as Comark component syntax instead of native footnote syntax.

## Related

- [Parse API](/api/parse) — Main parsing API
- [Render API](/api/render) — Rendering API with conditional handlers
- [Alerts](/plugins/built-in/alert) — GitHub-style alert blockquotes
- [Task List](/plugins/built-in/task-list) — Checkbox syntax
- [Creating Plugins](/plugins/creating-plugins) — Build your own plugin
