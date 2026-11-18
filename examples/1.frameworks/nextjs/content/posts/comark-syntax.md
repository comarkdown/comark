---
title: Comark syntax guide
description: A tour of standard Markdown, custom components, and named slots in Comark.
pubDate: 2025-12-15
tags: [comark, syntax, components]
---

Comark adds block and inline component syntax to CommonMark and GFM.

## Inline formatting

Standard Markdown formatting works everywhere: **bold**, *italic*, `code`, and [links](https://comark.dev).

## Components

Block components open and close with `::` and accept props in `{...}`:

::alert{type="warning"}
Double colons open a block component, and props inside curly braces pass directly to the rendered React component.
::

## Component slots

React components receive default content as `children` and named `#slot` sections as `slot*` props such as `slotHeader` and `slotFooter`:

::feature-card
#header
Slot-aware React component

#default
This body renders in the default `children` slot. It can contain **Markdown**, links, lists, or nested Comark components.

#footer
Rendered through the `slotFooter` prop in `FeatureCard.tsx`.
::

## Lists

Unordered and ordered lists support nested inline formatting:

- First item
- Second item with **bold** text
- Third item with `inline code`

1. Numbered items
2. Nested Markdown inside each item

## Code blocks

Fenced code blocks highlight through the `shiki` plugin:

```js
function greet(name) {
  return `Hello, ${name}!`
}
```

## Block quotes

> Standard block quotes, lists, and code blocks can sit outside or inside custom components.

::alert{type="danger"}
Close block components with `::`. During streaming, `autoClose` closes unfinished blocks until the closing marker arrives.
::
