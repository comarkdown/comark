---
title: Footnotes
description: Add footnote references, numbered definitions, and back-links to Comark documents.
navigation:
  icon: i-lucide-footprints
seo:
  title: Footnotes Plugin
  description: Add footnote references, numbered definitions, and back-links to Comark documents.
links:
  - label: Parse API
    icon: i-lucide-code
    to: /reference/parse
    color: neutral
    variant: soft
  - label: Vue rendering
    icon: i-simple-icons-vuedotjs
    to: /rendering/vue
    color: neutral
    variant: soft
---

The `comark/plugins/footnotes` plugin adds GFM-style footnote references and definitions. It renders inline references as superscript links and collects definitions into a numbered list at the end of the document, each with a link back to the reference. It requires no peer dependencies.

## Basic usage

### With Vue

```vue [App.vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import footnotes from '@comark/vue/plugins/footnotes'

const markdown = `
Comark supports footnotes[^1] with back-references[^2].

[^1]: Footnotes are rendered as a list at the end of the document.
[^2]: Each footnote includes a back-reference link to return to the text.
`
</script>

<template>
  <Suspense>
    <Markdown :plugins="[footnotes()]">{{ markdown }}</Markdown>
  </Suspense>
</template>
```

### With React

```tsx [App.tsx]
import { Markdown } from '@comark/react'
import footnotes from '@comark/react/plugins/footnotes'

const markdown = `
Comark supports footnotes[^1] with back-references[^2].

[^1]: Footnotes are rendered as a list at the end of the document.
[^2]: Each footnote includes a back-reference link to return to the text.
`

function App() {
  return (
    <Markdown plugins={[footnotes()]}>{markdown}</Markdown>
  )
}
```

### With Svelte

```svelte [App.svelte]
<script lang="ts">
  import { Markdown } from '@comark/svelte'
  import footnotes from '@comark/svelte/plugins/footnotes'

  const markdown = `
Comark supports footnotes[^1] with back-references[^2].

[^1]: Footnotes are rendered as a list at the end of the document.
[^2]: Each footnote includes a back-reference link to return to the text.
`
</script>

<Markdown value={markdown} plugins={[footnotes()]} />
```

### With parse API

```typescript [parse.ts]
import { parseMarkdown } from 'comark'
import footnotes from 'comark/plugins/footnotes'

const result = await parseMarkdown('Hello[^1]\n\n[^1]: World', {
  plugins: [footnotes()]
})
```

## Syntax

### Footnote references

Use `[^label]` anywhere inline to insert a footnote reference:

```mdc
The theory of relativity[^1] changed physics.

Einstein also contributed to quantum mechanics[^qm].
```

Labels can be numbers or words. Comark uses them to match references to definitions and replaces them with sequential numbers in the output.

### Footnote definitions

Define footnotes with `[^label]: content` on its own line:

```mdc
[^1]: Albert Einstein published special relativity in 1905.
[^qm]: See the photoelectric effect paper, also from 1905.
```

Definitions can appear anywhere in the document. The plugin removes them from their original position and appends them to the footnotes section at the end.

### Complete example

```mdc
# Research Notes

The standard model[^sm] describes three of the four fundamental forces.
Gravity remains described by general relativity[^gr].

Dark matter[^dm] accounts for approximately 27% of the universe.

[^sm]: The Standard Model of particle physics classifies all known elementary particles.
[^gr]: Einstein's general theory of relativity, published in 1915.
[^dm]: Dark matter is inferred from gravitational effects on visible matter.
```

## Rendered output

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

### Custom configuration

```typescript
import footnotes from 'comark/plugins/footnotes'

// Use "References" heading, no horizontal rule, custom symbol
const plugin = footnotes({
  label: 'References',
  hr: false,
  backRef: '⬆',
})
```

## CSS classes

The plugin adds CSS classes for styling:

| Element | Class | Description |
|---------|-------|-------------|
| `<sup>` | `footnote-ref` | Wrapper around the inline reference link |
| `<section>` | `footnotes` | The footnotes section container |
| `<ol>` | `footnotes-list` | The ordered list of footnote definitions |
| `<a>` | `footnote-backref` | The back-reference link in each definition |

### Example styles

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

## Footnotes in inline formatting

Footnote references work inside bold, italic, and other inline formatting:

```mdc
**Bold text with a footnote[^1]** and *italic with another[^2]*.

[^1]: Works inside bold.
[^2]: Works inside italic too.
```

## Stringify (Markdown rendering)

The plugin exports a `Footnote` conditional handler that serializes the footnote AST back into standard `[^label]` Markdown syntax when you pass a `MarkdownDocument` to `renderMarkdown`:

```typescript
import { parseMarkdown } from 'comark'
import { renderMarkdown } from 'comark/render'
import footnotes, { Footnote } from 'comark/plugins/footnotes'

const document = await parseMarkdown('Hello[^1]\n\n[^1]: World', {
  plugins: [footnotes()]
})

const md = await renderMarkdown(document, {
  components: { footnotes: Footnote },
})
// Hello[^1]
//
// [^1]: World
```

Without `Footnote`, `renderMarkdown` serializes the generated `<sup>`, `<section>`, and `<ol>` nodes as Comark component syntax instead of `[^label]` footnotes.

## Related

- [Parse API](/reference/parse) for parser configuration
- [Render API](/reference/render) for Markdown rendering with conditional handlers
- [Alerts](/plugins/defaults/alert) for GitHub-style alert blockquotes
- [Task list](/plugins/defaults/task-list) for checkbox syntax
- [Plugin API](/plugins/custom/plugin-api) for writing custom plugins
