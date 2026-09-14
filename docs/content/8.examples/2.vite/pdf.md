---
title: PDF preview
description: A live markdown editor that renders Comark content to paginated PDF pages with paged.js, including headers, footers, and page breaks.
navigation:
  icon: i-lucide-file-text
---

::code-tree{defaultValue="src/main.ts" expandAll}

```ts [src/main.ts]
import { createPdfRenderer } from '@comark/pdf'
import { paginate } from '@comark/pdf/preview'
import shiki from '@comark/pdf/plugins/shiki'
import math, { Math } from '@comark/pdf/plugins/math'
import mermaid, { Mermaid } from '@comark/pdf/plugins/mermaid'

const renderPdf = createPdfRenderer({
  plugins: [shiki(), math(), mermaid()],
  components: { Math, Mermaid },
  pdf: {
    format: 'A4',
    margin: '20mm',
    footer: 'Page {{ page }} of {{ totalPages }}',
  },
})

async function updatePreview(markdown: string) {
  const html = await renderPdf(markdown)
  const { css, body } = splitPagedHtml(html)
  const preview = document.getElementById('preview') as HTMLDivElement
  preview.innerHTML = ''
  const flow = await paginate(preview, [css], body)
  pageCount.textContent = `${flow.total} pages`
}
```

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comark PDF</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app">
      <div id="editor-pane">
        <div class="pane-header">Markdown</div>
        <textarea id="input" spellcheck="false"></textarea>
      </div>
      <div id="preview-pane">
        <div class="pane-header">
          <span>PDF Preview</span>
          <span id="page-count"></span>
        </div>
        <div id="preview"></div>
      </div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```json [package.json]
{
  "name": "comark-pdf",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@comark/pdf": "workspace:*",
    "pagedjs": "^0.4.3",
    "shiki": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vite": "^7.3.1"
  }
}
```

::

This example shows a split-pane live preview: write Comark markdown on the left and see it rendered as paginated A4 pages on the right via `createPdfRenderer` and `paginate`. Frontmatter `pdf:` options control page size, margins, headers, and footers. Use `::page-break` to force a new page.
