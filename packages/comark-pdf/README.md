# @comark/pdf

PDF renderer for Comark. Convert Markdown to print-ready paginated HTML and PDF via [paged.js](https://pagedjs.org) and Playwright.

## Install

```bash
pnpm add @comark/pdf
# Optional: install peers for PDF export
pnpm add -D pagedjs playwright
```

## Usage

### Paged-media HTML (environment-neutral)

```typescript
import { renderPdf } from '@comark/pdf'

const html = await renderPdf(`
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

// html is a complete <!doctype html> document with @page CSS embedded.
// Serve it in a browser with paged.js for a live paginated preview,
// or pass it to renderPdfToBuffer() for headless PDF export.
```

### Node.js PDF export (requires playwright peer)

```typescript
import { renderPdfToBuffer, renderPdfToFile } from '@comark/pdf/node'

// Export to Buffer/Uint8Array
const buffer = await renderPdfToBuffer(markdown)
await fs.writeFile('output.pdf', buffer)

// Or write directly to a file
await renderPdfToFile(markdown, 'output.pdf')

// Inject your own Playwright browser for connection reuse
import { chromium } from 'playwright'
const browser = await chromium.launch()
await renderPdfToFile(markdown, 'output.pdf', { browser })
await browser.close()
```

### Browser paginated preview (requires pagedjs peer)

```typescript
import { paginate } from '@comark/pdf/preview'

// Paginates the current document into a container element.
const container = document.getElementById('preview')
const flow = await paginate(container)
console.log(`Total pages: ${flow.total}`)
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

## Plugins

All core Comark plugins are available via `@comark/pdf/plugins/*`:

```typescript
import { renderPdf } from '@comark/pdf'
import shiki from '@comark/pdf/plugins/shiki'
import math, { Math } from '@comark/pdf/plugins/math'
import mermaid, { Mermaid } from '@comark/pdf/plugins/mermaid'
import binding, { Binding, If } from '@comark/pdf/plugins/binding'
import { PageBreak } from '@comark/pdf/plugins/page-break'

const html = await renderPdf(markdown, {
  plugins: [shiki(), math()],
  components: { Math, Mermaid, Binding, If, 'page-break': PageBreak },
})
```
