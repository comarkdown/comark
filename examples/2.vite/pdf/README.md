---
title: PDF Preview
description: A live markdown editor that renders Comark markdown to PDF bytes via jasy — invoice, fillable form, and product label samples included.
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

const example = examples[0]
const renderPdf = createPdfRenderer({
  plugins: example.plugins,
  components: example.components,
})

const bytes = await renderPdf(example.markdown)
mount(document.getElementById('preview')!, bytes)
```

```md [src/examples/invoice.ts]
<!-- invoice body is a markdown string: headings + GFM table + frontmatter pdf: -->
# Muster Studio
## Line items
| QTY | DESCRIPTION | UNIT | AMOUNT |
| ... | ... | ... | ... |
```

```md [src/examples/product-label.ts]
---
pdf:
  width: 50mm
  height: 65mm
---

**Ethiopia Yirgacheffe**

::barcode{code="4 006381 332149"}
::
```

::

This example shows a split-pane live preview: write Comark markdown on the left and see PDF bytes mounted on the right via `createPdfRenderer` and `mount`.

Tabs:

- **Markdown** — headings, lists, tables, math, `::page-break`
- **Invoice** — pure markdown (GFM table + frontmatter). No custom jasy tree.
- **Fillable form** — markdown copy + thin `::text-field` / `::checkbox` / … bridges (AcroForm has no markdown syntax)
- **Product label** — markdown body + thin `::barcode` for the bar graphics only

Frontmatter `pdf:` options control page size, margins, headers, and footers.
