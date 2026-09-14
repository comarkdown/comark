# @comark/email

Email renderer for Comark. Convert Markdown to responsive, inline-styled HTML for email clients via [Maizzle](https://maizzle.com) and Tailwind CSS.

## Install

```bash
pnpm add @comark/email @maizzle/framework
```

## Usage

### Render to email HTML

```typescript
import { renderEmail } from '@comark/email'

const { html, subject, previewText } = await renderEmail(`
---
email:
  subject: "Your order has shipped!"
  previewText: "Track your package delivery status."
  theme:
    primary: "#0066cc"
---

# Order Shipped

Your order is on its way.

::email-button{href="https://example.com/track" class="bg-primary text-white py-3 px-6"}
Track Package
::
`)

// Pass html directly to your email provider
await sendEmail({ to: user.email, subject, html })
```

### Reusable renderer

```typescript
import { createEmailRenderer } from '@comark/email'

const render = createEmailRenderer({
  email: { theme: { primary: '#0066cc' } },
})

const result = await render(markdownString)
```

### From a pre-parsed document

```typescript
import { parseMarkdown } from 'comark'
import { renderEmailFromDocument } from '@comark/email'

const doc = await parseMarkdown('---\nemail:\n  subject: Hello\n---\n# Hi')
const { html, subject } = await renderEmailFromDocument(doc)
```

## Frontmatter configuration

```yaml
---
email:
  subject: "Your order #{{ order.id }} has shipped!"
  previewText: "Track your package delivery status."
  theme:
    primary: "#0066cc"
    background: "#f4f5f7"
---
```

## Email components

```markdown
# Send a button

::email-button{href="https://example.com" class="bg-primary text-white py-3 px-6 rounded-lg"}
Click Here
::

# Multi-column layout

::email-columns
Left column content.

Right column content.
::

# Horizontal divider

::email-divider{class="border-gray-200"}
::
```

## Plugins

All core Comark plugins are available via `@comark/email/plugins/*`:

```typescript
import { renderEmail } from '@comark/email'
import shiki from '@comark/email/plugins/shiki'
import math, { Math } from '@comark/email/plugins/math'
import binding, { Binding, If } from '@comark/email/plugins/binding'

const { html } = await renderEmail(markdown, {
  plugins: [shiki(), math()],
  components: { Math, Binding, If },
})
```
