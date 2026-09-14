import { createPdfRenderer } from '@comark/pdf'
import { mount } from '@comark/pdf/preview'
import math, { Math } from '@comark/pdf/plugins/math'
import mermaid, { Mermaid } from '@comark/pdf/plugins/mermaid'

const renderPdf = createPdfRenderer({
  plugins: [math(), mermaid()],
  components: { Math, Mermaid },
  pdf: {
    format: 'A4',
    margin: '20mm',
    footer: 'Page {{ page }} of {{ totalPages }}',
  },
})

const SAMPLE = `---
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

const preview = document.getElementById('preview') as HTMLDivElement
const pageCount = document.getElementById('page-count') as HTMLSpanElement
const input = document.getElementById('input') as HTMLTextAreaElement

let generation = 0
let mountHandle: { revoke(): void } | null = null

const updatePreview = async (markdown: string) => {
  const current = ++generation
  pageCount.textContent = 'Rendering…'

  const bytes = await renderPdf(markdown)
  if (current !== generation) return

  mountHandle?.revoke()
  mountHandle = mount(preview, bytes)

  pageCount.textContent = 'Ready'
}

input.value = SAMPLE
updatePreview(SAMPLE)

let debounceTimer: ReturnType<typeof setTimeout>
input.addEventListener('input', () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => updatePreview(input.value), 300)
})
