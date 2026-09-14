import {
  Box,
  Column,
  Divider,
  Padding,
  Row,
  Table,
  Text,
} from '@jasy/pdf'
import type { JasyComponentFn } from '@comark/pdf'

const ink = '#1b2433'
const muted = '#6b7280'
const brand = '#1450aa'
const hair = '#e6eaf2'
const paper = '#f5f8fd'

const eur = (n: number): string =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

interface Item {
  qty: number
  name: string
  price: number
}

const items: Item[] = [
  { qty: 2, name: 'Brand identity workshop', price: 680 },
  { qty: 1, name: 'Logo design, primary and variants', price: 1450 },
  { qty: 1, name: 'Visual identity guidelines', price: 920 },
  { qty: 3, name: 'UI design, key screens', price: 540 },
  { qty: 1, name: 'Design system in Figma', price: 1680 },
  { qty: 2, name: 'Interactive prototype', price: 460 },
  { qty: 1, name: 'Frontend setup (Nuxt)', price: 780 },
  { qty: 6, name: 'Component implementation', price: 220 },
  { qty: 1, name: 'Responsive pass', price: 640 },
  { qty: 1, name: 'Accessibility audit', price: 540 },
  { qty: 2, name: 'Content modelling', price: 380 },
  { qty: 1, name: 'CMS integration', price: 1120 },
  { qty: 3, name: 'Page templates', price: 360 },
  { qty: 1, name: 'Animation polish', price: 480 },
  { qty: 1, name: 'Performance tuning', price: 560 },
  { qty: 2, name: 'QA and bug fixing', price: 340 },
  { qty: 1, name: 'Deployment and CI', price: 420 },
  { qty: 1, name: 'Documentation', price: 380 },
  { qty: 2, name: 'Stakeholder review', price: 260 },
  { qty: 1, name: 'Project management', price: 1200 },
]

const net = items.reduce((s, it) => s + it.qty * it.price, 0)
const vat = net * 0.19
const gross = net + vat

const hcell = (t: string, align: 'left' | 'right' = 'left') =>
  Text(t, { size: 8.5, bold: true, color: muted, align })

const cell = (t: string, align: 'left' | 'right' = 'left', bold = false) =>
  Text(t, { size: 10.5, color: ink, align, bold })

const rows = items.map((it) => [
  cell(String(it.qty)),
  cell(it.name),
  cell(eur(it.price), 'right'),
  cell(eur(it.qty * it.price), 'right', true),
])

const detail = (label: string, value: string) =>
  Row({ justify: 'between', gap: 18 }, [
    Text(label, { size: 10, color: muted }),
    Text(value, { size: 10, color: ink, bold: true, align: 'right' }),
  ])

const totalRow = (
  label: string,
  value: string,
  o: { bold?: boolean; size?: number; color?: string } = {},
) =>
  Row({ justify: 'between' }, [
    Text(label, { size: o.size ?? 10.5, color: o.color ?? muted, bold: o.bold }),
    Text(value, { size: o.size ?? 10.5, color: o.color ?? ink, bold: o.bold, align: 'right' }),
  ])

/** Commercial invoice layout adapted from https://jasy.dev/showroom */
export const Invoice: JasyComponentFn = () =>
  Column({ gap: 0 }, [
    Row({ justify: 'between', align: 'start' }, [
      Column({ gap: 1 }, [
        Text('Muster Studio', { size: 19, bold: true, color: brand }),
        Text('Design & Development', { size: 10, color: muted }),
      ]),
      Column({ gap: 1, align: 'end' }, [
        Text('INVOICE', { size: 26, bold: true, color: ink }),
        Text('RE-2026-0142', { size: 11, color: muted }),
      ]),
    ]),

    Padding(
      { top: 22 },
      Row({ justify: 'between', align: 'start', gap: 40 }, [
        Column({ gap: 2 }, [
          Text('BILLED TO', { size: 8, bold: true, color: brand }),
          Padding({ top: 2 }, Text('Beispiel Kunde AG', { size: 12, bold: true, color: ink })),
          Text('Marienplatz 1', { size: 10.5, color: ink }),
          Text('80331 München', { size: 10.5, color: ink }),
          Text('Germany', { size: 10.5, color: muted }),
        ]),
        Box({ width: 230, bg: paper, padding: { x: 16, y: 14 }, radius: 8 }, [
          Column({ gap: 7 }, [
            detail('Invoice no.', 'RE-2026-0142'),
            detail('Issue date', '20 Jun 2026'),
            detail('Due date', '04 Jul 2026'),
            detail('Reference', 'PO-99213'),
          ]),
        ]),
      ]),
    ),

    Padding(
      { top: 26 },
      Table(
        {
          columns: ['auto', '1fr', 92, 92],
          header: [
            hcell('QTY'),
            hcell('DESCRIPTION'),
            hcell('UNIT', 'right'),
            hcell('AMOUNT', 'right'),
          ],
          rowGap: 9,
          colGap: 14,
          cellPadding: { y: 4 },
          rule: hair,
        },
        rows,
      ),
    ),

    Padding(
      { top: 18 },
      Row({ justify: 'end' }, [
        Box({ width: 250 }, [
          Column({ gap: 8 }, [
            totalRow('Subtotal', eur(net)),
            totalRow('VAT 19%', eur(vat)),
            Divider({ color: hair, margin: { y: 2 } }),
            totalRow('Total due', eur(gross), { bold: true, size: 13, color: brand }),
          ]),
        ]),
      ]),
    ),

    Padding(
      { top: 22 },
      Box({ border: hair, bg: paper, padding: { x: 14, y: 12 }, radius: 8 }, [
        Column({ gap: 3 }, [
          Text('Payment', { size: 9, bold: true, color: brand }),
          Text(
            'Please transfer the total to IBAN DE02 1203 0000 0000 2020 51 within 14 days, quoting the invoice number.',
            { size: 10, color: ink },
          ),
        ]),
      ]),
    ),
  ])

export const invoiceMarkdown = `---
title: Invoice
pdf:
  format: A4
  margin: 17mm
  gap: 0
  footerLeft: "Muster Studio GmbH · Hauptstraße 1 · 10115 Berlin"
  footerRight: "VAT DE123456789 · hello@muster.studio"
---

::invoice
::
`
