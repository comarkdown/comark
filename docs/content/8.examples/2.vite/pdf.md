---
title: PDF preview
description: A live markdown editor that renders Comark content to PDF bytes with jasy and shows them in an iframe preview.
navigation:
  icon: i-lucide-file-text
---

::code-tree{defaultValue="src/main.ts" expandAll}

```ts [src/main.ts]
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

let mountHandle: { revoke(): void } | null = null

async function updatePreview(markdown: string) {
  const bytes = await renderPdf(markdown)
  mountHandle?.revoke()
  mountHandle = mount(document.getElementById('preview')!, bytes)
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
    "@comark/pdf": "workspace:*"
  },
  "devDependencies": {
    "typescript": "catalog:",
    "vite": "catalog:"
  }
}
```

::

This example shows a split-pane live preview: write Comark markdown on the left and see PDF bytes on the right via `createPdfRenderer` and `mount`. Frontmatter `pdf:` options control page size, margins, headers, and footers. Use `::page-break` to force a new page.

Math and Mermaid parse correctly but **degrade** in PDF output (monospace source text). Code blocks have no Shiki colors. See [Render Comark to PDF](/rendering/pdf#feature-support) for the full support table.
