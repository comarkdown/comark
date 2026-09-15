import { Box, Column, Row, Text } from '@jasy/pdf'
import type { ElementNode } from 'comark'
import type { JasyComponentFn } from '@comark/pdf'

const ink = '#1b2433'

const WIDTHS = [1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 3, 1, 1, 2, 1]

/**
 * Thin bridge: markdown cannot draw variable-width bars.
 * Content (brand, product, price, code) stays in the markdown sample.
 */
export const Barcode: JasyComponentFn = ([, attrs]: ElementNode) => {
  const code = String(attrs.code ?? '')
  return Column({ gap: 4 }, [
    Row(
      { gap: 1.4, align: 'end', justify: 'center' },
      WIDTHS.map((w) => Box({ width: w, height: 28, bg: ink }, [])),
    ),
    ...(code ? [Text(code, { size: 6.5, color: '#6b7280', align: 'center' })] : []),
  ])
}

/** Product label — page size via frontmatter; body is markdown + ::barcode. */
export const productLabelMarkdown = `---
title: Product label
pdf:
  width: 50mm
  height: 65mm
  margin: 3.5mm
  gap: 4
  fontSize: 8
  color: "#1b2433"
---

**MUSTER** · ROASTERS

---

SINGLE ORIGIN

**Ethiopia Yirgacheffe**

Washed · floral, citrus, tea-like

**250 g** · Whole bean

**12,90 €**

---

::barcode{code="4 006381 332149"}
::
`
