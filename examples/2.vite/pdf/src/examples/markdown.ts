export const markdownSample = `---
title: Comark PDF Demo
pdf:
  format: A4
  margin: 20mm
  header: Comark PDF
  footer: "Page {{ page }} of {{ totalPages }}"
---

# Comark PDF Renderer

Render **Comark** markdown as _paginated_ print-ready pages using jasy.

## Text Formatting

You can use **bold**, _italic_, ~~strikethrough~~, and \`inline code\`.

Links look like this: [comark.dev](https://comark.dev)

## Code Block

\`\`\`typescript
import { createPdfRenderer } from '@comark/pdf'

const renderPdf = createPdfRenderer()
const bytes = await renderPdf('# Hello World')
\`\`\`

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

> The page is not just a container,
> it is a unit of reading.

## Math

Inline: $E = mc^2$

Block:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

::page-break
::

## Table

| Feature         | Status |
| --------------- | ------ |
| Headings        | ✅     |
| Bold/Italic     | ✅     |
| Code blocks     | ✅     |
| Page breaks     | ✅     |
| Headers/Footers | ✅     |

---

_Edit the markdown on the left to see live paginated updates._
`
