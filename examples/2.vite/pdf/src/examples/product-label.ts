import {
  Box,
  Column,
  Divider,
  Row,
  Spacer,
  Text,
} from '@jasy/pdf'
import type { JasyComponentFn } from '@comark/pdf'

const ink = '#1b2433'
const muted = '#6b7280'
const brand = '#1450aa'
const hair = '#dfe4ee'

const WIDTHS = [1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 3, 1, 1, 2, 1]

const barcode = Row(
  { gap: 1.4, align: 'end', justify: 'center' },
  WIDTHS.map((w) => Box({ width: w, height: 28, bg: ink }, [])),
)

/** 50×65 mm product label adapted from https://jasy.dev/showroom */
export const ProductLabel: JasyComponentFn = () =>
  Column({ gap: 0 }, [
    Row({ justify: 'between', align: 'center' }, [
      Text('MUSTER', { size: 11, bold: true, color: brand }),
      Text('ROASTERS', { size: 6.5, bold: true, color: muted }),
    ]),
    Divider({ color: hair, margin: { y: 7 } }),

    Text('SINGLE ORIGIN', { size: 7, bold: true, color: muted }),
    Text('Ethiopia Yirgacheffe', { size: 13, bold: true, color: ink, lineHeight: 1.15 }),
    Text('Washed · floral, citrus, tea-like', { size: 7.5, color: muted, lineHeight: 1.2 }),

    Spacer(),

    Row({ justify: 'between', align: 'end' }, [
      Column({ gap: 1 }, [
        Text('250 g', { size: 8.5, bold: true, color: ink }),
        Text('Whole bean', { size: 7, color: muted }),
      ]),
      Text('12,90 €', { size: 17, bold: true, color: ink }),
    ]),

    Divider({ color: hair, margin: { y: 7 } }),

    Column({ gap: 4 }, [
      barcode,
      Text('4 006381 332149', { size: 6.5, color: muted, align: 'center' }),
    ]),
  ])

export const productLabelMarkdown = `---
title: Product label
pdf:
  width: 50mm
  height: 65mm
  margin: 3.5mm
  gap: 0
---

::product-label
::
`
