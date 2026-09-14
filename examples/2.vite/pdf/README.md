---
title: PDF Preview
description: A live markdown editor that renders Comark content to PDF bytes via jasy, with invoice, fillable form, and product label examples.
navigation:
  icon: i-lucide-file-text
category: Vite
path: /examples/vite/pdf
---

::code-tree{defaultValue="src/main.ts" expandAll}

```ts [src/main.ts]
import { createPdfRenderer } from '@comark/pdf'
import { mount } from '@comark/pdf/preview'
import { examples } from './examples'

const renderPdf = createPdfRenderer({
  plugins: examples[0].plugins,
  components: examples[0].components,
})

const bytes = await renderPdf(examples[0].markdown)
mount(document.getElementById('preview')!, bytes)
```

```ts [src/examples/invoice.ts]
import { Column, Table, Text, … } from '@jasy/pdf'
import type { JasyComponentFn } from '@comark/pdf'

export const Invoice: JasyComponentFn = () =>
  Column({ gap: 0 }, [
    // billed-to, line-item table, totals…
  ])
```

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Comark PDF</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app">
      <div id="editor-pane">
        <div class="pane-header">
          <span>Markdown</span>
          <div id="example-tabs" class="example-tabs"></div>
        </div>
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

::

This example shows a split-pane live preview: write Comark markdown on the left and see PDF bytes mounted on the right via `createPdfRenderer` and `mount`. Use the tabs to switch between:

- **Markdown** — headings, lists, tables, math, and `::page-break`
- **Invoice** — multi-page commercial invoice with a repeating footer (from [jasy showroom](https://jasy.dev/showroom))
- **Fillable form** — AcroForm fields (`TextField`, `Checkbox`, `RadioGroup`, …) via a custom `JasyComponentFn`
- **Product label** — custom `50mm × 65mm` page via frontmatter `pdf.width` / `pdf.height`

Frontmatter `pdf:` options control page size, margins, headers, and footers.
