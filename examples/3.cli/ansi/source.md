---
title: Comark ANSI Demo
---

# Comark ANSI Renderer

Render **Comark** markdown as _styled_ terminal output.

## Text Formatting

You can use **bold**, _italic_, ~~strikethrough~~, and `inline code`.

Links look like this: [xtermjs.org](https://xtermjs.org)

## Code Block

```typescript [main.ts]
import { parseMarkdown } from 'comark'
import { renderAnsiFromDocument } from '@comark/ansi'

const tree = await parseMarkdown('# Hello World')
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

> The terminal is not just a tool,
> it is a way of life.

## GitHub Alerts

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

## Component Slots

::alert
#title
Hello from the title slot

#default
This is the **default** slot with _markdown_ content.

#footer
Footer slot content here.
::

## Math

Inline: The energy equation $E = mc^2$ is fundamental to physics.

Block display math:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

## Table

| Feature     | Status  |
| ----------- | ------- |
| Headings    | ✅      |
| Bold/Italic | ✅      |
| Code blocks | ✅      |
| Tables      | ✅      |
| Lists       | ✅      |

---
