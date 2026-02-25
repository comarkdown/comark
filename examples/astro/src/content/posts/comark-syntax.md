---
title: Comark Syntax Guide
description: A quick tour of what you can do with Comark's component syntax.
pubDate: 2025-12-15
tags: [comark, syntax, components]
---

Comark is **Components in Markdown** — it extends standard Markdown with a powerful component syntax.

## Inline formatting

You can use all the usual Markdown formatting: **bold**, *italic*, `code`, and [links](https://comark.dev).

## Components

Components use the `::` syntax. They can have attributes and children:

::alert{type="warning"}
Pay attention to the double-colon syntax — it's how Comark identifies components.
::

## Lists

Comark handles lists, of course:

- First item
- Second item with **bold** text
- Third item with `inline code`

1. Numbered items work too
2. With full Markdown support inside

## Code blocks

Syntax highlighting works out of the box:

```js
function greet(name) {
  return `Hello, ${name}!`
}
```

## Block quotes

> Comark makes Markdown more powerful without sacrificing simplicity.

::alert{type="danger"}
Don't forget to close your components with `::` — otherwise `autoClose` will handle it for you!
::
