/** Commercial invoice as Comark markdown — exercises table pagination through the real AST → jasy path. */
export const invoiceMarkdown = `---
title: Invoice
pdf:
  format: A4
  margin: 17mm
  gap: 10
  fontSize: 10.5
  color: "#1b2433"
  footerLeft: "Muster Studio GmbH · Hauptstraße 1 · 10115 Berlin"
  footerRight: "VAT DE123456789 · hello@muster.studio"
---

# Muster Studio

Design & Development

## Invoice RE-2026-0142

**Billed to**

Beispiel Kunde AG  
Marienplatz 1  
80331 München  
Germany

| | |
| --- | ---: |
| Invoice no. | RE-2026-0142 |
| Issue date | 20 Jun 2026 |
| Due date | 04 Jul 2026 |
| Reference | PO-99213 |

## Line items

| QTY | DESCRIPTION | UNIT | AMOUNT |
| ---: | --- | ---: | ---: |
| 2 | Brand identity workshop | 680,00 € | 1.360,00 € |
| 1 | Logo design, primary and variants | 1.450,00 € | 1.450,00 € |
| 1 | Visual identity guidelines | 920,00 € | 920,00 € |
| 3 | UI design, key screens | 540,00 € | 1.620,00 € |
| 1 | Design system in Figma | 1.680,00 € | 1.680,00 € |
| 2 | Interactive prototype | 460,00 € | 920,00 € |
| 1 | Frontend setup (Nuxt) | 780,00 € | 780,00 € |
| 6 | Component implementation | 220,00 € | 1.320,00 € |
| 1 | Responsive pass | 640,00 € | 640,00 € |
| 1 | Accessibility audit | 540,00 € | 540,00 € |
| 2 | Content modelling | 380,00 € | 760,00 € |
| 1 | CMS integration | 1.120,00 € | 1.120,00 € |
| 3 | Page templates | 360,00 € | 1.080,00 € |
| 1 | Animation polish | 480,00 € | 480,00 € |
| 1 | Performance tuning | 560,00 € | 560,00 € |
| 2 | QA and bug fixing | 340,00 € | 680,00 € |
| 1 | Deployment and CI | 420,00 € | 420,00 € |
| 1 | Documentation | 380,00 € | 380,00 € |
| 2 | Stakeholder review | 260,00 € | 520,00 € |
| 1 | Project management | 1.200,00 € | 1.200,00 € |

## Totals

| | |
| --- | ---: |
| Subtotal | 18.430,00 € |
| VAT 19% | 3.501,70 € |
| **Total due** | **21.931,70 €** |

---

**Payment**

Please transfer the total to IBAN DE02 1203 0000 0000 2020 51 within 14 days, quoting the invoice number.
`
