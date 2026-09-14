import type { JasyComponentFn, PdfRendererOptions } from '@comark/pdf'
import math, { Math } from '@comark/pdf/plugins/math'
import mermaid, { Mermaid } from '@comark/pdf/plugins/mermaid'
import { FillableForm, fillableFormMarkdown } from './fillable-form.ts'
import { Invoice, invoiceMarkdown } from './invoice.ts'
import { markdownSample } from './markdown.ts'
import { ProductLabel, productLabelMarkdown } from './product-label.ts'

export interface DemoExample {
  id: string
  label: string
  markdown: string
  plugins?: PdfRendererOptions['plugins']
  components?: Record<string, JasyComponentFn>
}

export const examples: DemoExample[] = [
  {
    id: 'markdown',
    label: 'Markdown',
    markdown: markdownSample,
    plugins: [math(), mermaid()],
    components: { Math, Mermaid },
  },
  {
    id: 'invoice',
    label: 'Invoice',
    markdown: invoiceMarkdown,
    components: { invoice: Invoice },
  },
  {
    id: 'fillable-form',
    label: 'Fillable form',
    markdown: fillableFormMarkdown,
    components: { 'fillable-form': FillableForm },
  },
  {
    id: 'product-label',
    label: 'Product label',
    markdown: productLabelMarkdown,
    components: { 'product-label': ProductLabel },
  },
]
