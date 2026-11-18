---
title: Comark ANSI demo
---

# Comark ANSI renderer

Render **Comark** Markdown as _styled_ terminal output.

## Text formatting

Use **bold**, _italic_, ~~strikethrough~~, and `inline code`.

Terminal hyperlinks target URLs such as [xtermjs.org](https://xtermjs.org).

## Code block

```typescript [main.ts]
import { parseMarkdown } from 'comark'
import { renderAnsiFromDocument } from '@comark/ansi'

const tree = await parseMarkdown('# Hello world')
console.log(await renderAnsiFromDocument(tree))
```

## Lists

Unordered:

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Ordered:

1. Step one
2. Step two
3. Step three

## Blockquote

> Parse once into a serializable document, then print styled output straight to standard output.

## GitHub alerts

> [!NOTE]
> Notes call out context you need before running a command.

> [!TIP]
> Tips share optional flags, such as passing a custom `width` to wrap long lines.

> [!IMPORTANT]
> Important alerts highlight prerequisites required for a command to succeed.

> [!WARNING]
> Warnings flag operations that overwrite files or reset local state.

> [!CAUTION]
> Caution alerts mark destructive actions that cannot be undone.

## Component slots

::alert
#title
Hello from the title slot

#default
This is the **default** slot with _Markdown_ content.

#footer
Footer slot content here.
::

## Math

Inline: the energy equation $E = mc^2$ relates energy and mass.

Block display math:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

## Table

| Feature           | Status    |
| ----------------- | --------- |
| Headings          | Supported |
| Bold and italic   | Supported |
| Code blocks       | Supported |
| Tables            | Supported |
| Lists             | Supported |

---
