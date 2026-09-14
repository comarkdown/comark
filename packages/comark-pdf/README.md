# @comark/pdf

PDF renderer for Comark. Convert Markdown to print-ready PDF bytes via [jasy](https://jasy.dev) — no headless browser required.

## Install

```bash
pnpm add @comark/pdf
```

## Usage

### Render to PDF bytes

```typescript
import { renderPdf, createPdfRenderer } from '@comark/pdf'
import { writeFile } from 'node:fs/promises'

// One-shot
const bytes = await renderPdf(`
---
pdf:
  format: A4
  margin: 20mm
  footer: "Page {{ page }} of {{ totalPages }}"
---

# My Document

Content here.

::page-break
::

# Chapter 2

More content.
`)

await writeFile('output.pdf', bytes)

// Reusable renderer (parser initialized once)
const render = createPdfRenderer({
  pdf: { format: 'A4', margin: '20mm', footer: 'Page {{ page }} of {{ totalPages }}' },
})
const bytes = await render(markdownString)
```

### Node.js PDF export

```typescript
import { renderPdfToBuffer, renderPdfToFile } from '@comark/pdf/node'

// Export to Uint8Array
const buffer = await renderPdfToBuffer(markdown)
await writeFile('output.pdf', buffer)

// Or write directly to a file
await renderPdfToFile(markdown, 'output.pdf')
```

### Browser preview

```typescript
import { renderPdf } from '@comark/pdf'
import { mount } from '@comark/pdf/preview'

const bytes = await renderPdf(markdownString)
const handle = mount(document.getElementById('preview'), bytes)

// Later, to free the Blob URL:
handle.revoke()
```

## Frontmatter configuration

```yaml
---
pdf:
  format: A4          # page size (A4, Letter, A3, …)
  orientation: portrait  # portrait | landscape
  margin: 20mm        # or { top, right, bottom, left }
  header: "My Report" # center header; tokens: {{ page }}, {{ totalPages }}
  headerLeft: "Draft"
  headerRight: "Confidential"
  footer: "Page {{ page }} of {{ totalPages }}"
  footerLeft: "Company Name"
  footerRight: "2026"
---
```

## Plugins and feature support

Parser plugins still parse markdown. Render support depends on whether jasy can express the output.

**Supported:** headings, paragraphs, bold/italic/strikethrough, links, lists, blockquotes, rules, tables, page size/margins, headers/footers (`{{ page }}` / `{{ totalPages }}`), `::page-break`, multi-page flow, browser `mount`, Node export.

**Partial (degraded — source kept, rich visual not drawn):**

| Feature | PDF output | Why |
|---------|------------|-----|
| Code blocks (+ Shiki / highlight / rangi) | Monospace text in a tinted box; no theme colors | Highlighters emit HTML; jasy has no HTML intake |
| Math (KaTeX) | LaTeX source as monospace text | KaTeX emits HTML |
| Mermaid | Diagram source as a monospace block | Mermaid emits SVG/HTML |
| Images | Alt-text placeholder | Local path / bytes not wired for remote URLs yet |
| Alerts / task checkboxes / binding UI | Structure or plain text only | No dedicated jasy chrome yet |

**Not yet:** raw HTML blocks as layout, full footnote chrome, checkbox glyphs.

Degrade (not omit) so author content stays in the PDF. Richer math/diagrams can later use rasterized images; Shiki tokens can later map to colored `span`s.

```typescript
import { renderPdf } from '@comark/pdf'
import math, { Math } from '@comark/pdf/plugins/math'
import mermaid, { Mermaid } from '@comark/pdf/plugins/mermaid'
import { PageBreak } from '@comark/pdf/plugins/page-break'

const bytes = await renderPdf(markdown, {
  plugins: [math(), mermaid()],
  components: { Math, Mermaid, 'page-break': PageBreak },
})
```

See the [PDF docs](https://comark.dev/rendering/pdf) for the full support table.

## Custom components

Override any Comark component tag with a jasy component function:

```typescript
import { renderPdf } from '@comark/pdf'
import { Box, Text } from '@jasy/pdf'

const bytes = await renderPdf(markdown, {
  components: {
    alert: ([, attrs, ...children], ctx) =>
      Box({ bg: '#fff3cd', padding: 12, radius: 4 }, ctx.mapNodes(children)),
  },
})
```
