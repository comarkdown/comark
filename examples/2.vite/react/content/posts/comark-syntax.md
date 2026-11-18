---
title: Comark syntax guide
description: A tour of standard Markdown and Comark component syntax.
pubDate: 2025-12-15
tags: [comark, syntax, components]
---

Comark adds block and inline component syntax to CommonMark and GFM.

## Inline formatting

Standard Markdown formatting works everywhere: **bold**, *italic*, `code`, and [links](https://comark.dev).

## Components

Block components open and close with `::` and accept props in `{...}`:

::Alert{type="warning"}
Double colons open a block component, and props inside curly braces pass directly to the rendered React component.
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

::Alert{type="danger"}
Close block components with `::`. During streaming, `autoClose` closes unfinished blocks until the closing marker arrives.
::
