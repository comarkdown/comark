export const content = `# JSON Render for Comark

[JSON Render](https://json-render.dev/) lets you describe **UI components declaratively as JSON or YAML** inside Markdown code blocks. The Comark plugin parses \`json-render\` and \`yaml-render\` fenced blocks and converts them into AST nodes at parse time — no client-side runtime needed.

---

## Live Demos

### Full Spec

A full spec defines a tree of named elements with a \`root\` entry point and an \`elements\` map:

\`\`\`json-render
{
  "root": "card",
  "elements": {
    "card": {
      "type": "Card",
      "props": { "title": "Welcome to JSON Render" },
      "children": ["description", "badge"]
    },
    "description": {
      "type": "Text",
      "props": { "content": "This card was described entirely in JSON and rendered by the Comark plugin." }
    },
    "badge": {
      "type": "Badge",
      "children": ["poweredby"]
    },
    "poweredby": {
      "type": "Text",
      "props": { "content": "Powered by Comark" }
    }
  }
}
\`\`\`

The same spec in YAML:

\`\`\`yaml-render
root: card
elements:
  card:
    type: Card
    props:
      title: Welcome to YAML Render
    children:
      - description
      - badge
  description:
    type: Text
    props:
      content: "This card was described in YAML and rendered by the same Comark plugin."
  badge:
    type: Badge
    children:
      - poweredby
  poweredby:
    type: Text
    props:
      content: Powered by Comark
\`\`\`

### Single Element (Shorthand)

When you only need one element, skip \`root\` and \`elements\` — the plugin wraps it automatically:

\`\`\`json-render
{
  "type": "Text",
  "props": { "content": "A standalone text element using the JSON shorthand format." }
}
\`\`\`

\`\`\`yaml-render
type: Text
props:
  content: A standalone text element using the YAML shorthand format.
\`\`\`

### Nested Layout

Build deeper trees by referencing children by key:

\`\`\`json-render
{
  "root": "page",
  "elements": {
    "page": {
      "type": "div",
      "props": {},
      "children": ["heading", "body"]
    },
    "heading": {
      "type": "h3",
      "props": {},
      "children": ["heading-text"]
    },
    "heading-text": {
      "type": "Text",
      "props": { "content": "A Nested Layout" }
    },
    "body": {
      "type": "p",
      "props": {},
      "children": ["body-text"]
    },
    "body-text": {
      "type": "Text",
      "props": { "content": "This paragraph and heading were composed from a nested JSON Render spec with five elements." }
    }
  }
}
\`\`\`

---

## Setup

### Installation

The plugin is built into the core \`comark\` package — no extra dependencies required.

\`\`\`bash
pnpm add comark        # or @comark/vue, @comark/react, @comark/svelte
\`\`\`

### Usage

Import the plugin and pass it to \`parse()\` or the \`<Comark>\` component:

\`\`\`ts
import { parse } from 'comark'
import jsonRender from 'comark/plugins/json-render'

const result = await parse(markdown, {
  plugins: [jsonRender()]
})
\`\`\`

With Vue:

\`\`\`vue
<script setup>
import { Comark } from '@comark/vue'
import jsonRender from '@comark/vue/plugins/json-render'
</script>

<template>
  <Suspense>
    <Comark :plugins="[jsonRender()]">{{ content }}</Comark>
  </Suspense>
</template>
\`\`\`

---

## Spec Reference

| Field | Type | Required | Description |
|---|---|---|---|
| \`root\` | \`string\` | Full spec only | Key of the root element in \`elements\` |
| \`elements\` | \`Record<string, UIElement>\` | Full spec only | Map of named element definitions |
| \`type\` | \`string\` | Yes | Component or HTML element name (\`Text\` is special — renders as plain text) |
| \`props\` | \`object\` | Yes | Properties passed to the element |
| \`children\` | \`string[]\` | No | Keys of child elements in the \`elements\` map |

> **Tip** — \`Text\` is a special element type: its \`props.content\` value is rendered as a plain text node rather than as a component.

> **Tip** — Both \`json-render\` and \`yaml-render\` code blocks use the same plugin and produce identical output. Choose whichever format you prefer.
`
