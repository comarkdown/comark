import { createPdfRenderer } from '@comark/pdf'
import { paginate } from '@comark/pdf/preview'
import shiki from '@comark/pdf/plugins/shiki'
import math, { Math } from '@comark/pdf/plugins/math'
import mermaid, { Mermaid } from '@comark/pdf/plugins/mermaid'
import katexCss from 'katex/dist/katex.min.css?raw'
import previewCss from './preview.css?raw'

const renderPdf = createPdfRenderer({
  plugins: [shiki(), math(), mermaid()],
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

Render **Comark** markdown as _paginated_ print-ready pages.

## Text Formatting

You can use **bold**, _italic_, ~~strikethrough~~, and \`inline code\`.

Links look like this: [comark.dev](https://comark.dev)

## Code Block

\`\`\`typescript [main.ts] {1,3}
import { createPdfRenderer } from '@comark/pdf'
import { paginate } from '@comark/pdf/preview'

const renderPdf = createPdfRenderer()
const html = await renderPdf('# Hello World')
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

## GitHub Alerts

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

## Math

Inline: The energy equation $E = mc^2$ is fundamental to physics.

Block display math:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

::page-break
::

## Mermaid

\`\`\`mermaid
graph TD
  A[Markdown] --> B[renderPdf]
  B --> C[paginate]
  C --> D[Paged preview]
\`\`\`

## Table

| Feature      | Status |
| ------------ | ------ |
| Headings     | ✅     |
| Bold/Italic  | ✅     |
| Code blocks  | ✅     |
| Math         | ✅     |
| Mermaid      | ✅     |
| Page breaks  | ✅     |
| Headers/Footers | ✅  |

---

_Edit the markdown on the left to see live paginated updates._
`

const splitPagedHtml = (html: string): { css: string; body: string } => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const css = Array.from(doc.querySelectorAll('style'))
    .map((el) => el.textContent ?? '')
    .join('\n')
  return { css, body: doc.body.innerHTML }
}

const preview = document.getElementById('preview') as HTMLDivElement
const pageCount = document.getElementById('page-count') as HTMLSpanElement
const input = document.getElementById('input') as HTMLTextAreaElement

let generation = 0

const updatePreview = async (markdown: string) => {
  const current = ++generation
  pageCount.textContent = 'Rendering…'

  const html = await renderPdf(markdown)
  if (current !== generation) return

  const { css, body } = splitPagedHtml(html)
  preview.innerHTML = ''
  const flow = await paginate(preview, [katexCss, previewCss, css], body)
  if (current !== generation) return

  pageCount.textContent = `${flow.total} page${flow.total === 1 ? '' : 's'}`
}

input.value = SAMPLE
updatePreview(SAMPLE)

let debounceTimer: ReturnType<typeof setTimeout>
input.addEventListener('input', () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => updatePreview(input.value), 300)
})
