import type { JasyComponentFn, PdfRendererOptions } from '@comark/pdf'
import math, { Math } from '@comark/pdf/plugins/math'
import mermaid, { Mermaid } from '@comark/pdf/plugins/mermaid'
import {
  Checkbox,
  Dropdown,
  ListBox,
  PushButton,
  RadioGroup,
  SignatureField,
  TextField,
  fillableFormMarkdown,
} from './fillable-form.ts'
import { invoiceMarkdown } from './invoice.ts'
import { markdownSample } from './markdown.ts'
import { Barcode, productLabelMarkdown } from './product-label.ts'

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
  },
  {
    id: 'fillable-form',
    label: 'Fillable form',
    markdown: fillableFormMarkdown,
    components: {
      'text-field': TextField,
      dropdown: Dropdown,
      'radio-group': RadioGroup,
      'list-box': ListBox,
      checkbox: Checkbox,
      'signature-field': SignatureField,
      'push-button': PushButton,
    },
  },
  {
    id: 'product-label',
    label: 'Product label',
    markdown: productLabelMarkdown,
    components: { barcode: Barcode },
  },
]
