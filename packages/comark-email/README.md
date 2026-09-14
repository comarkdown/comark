# @comark/email

Email renderer for Comark. Convert Markdown to responsive, MJML-compiled HTML for email clients.

## Install

```bash
pnpm add @comark/email mjml
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
  brandColor: "#0066cc"
---

# Order Shipped

Your order is on its way.

::email-button{href="https://example.com/track" background-color="#0066cc" color="#ffffff"}
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
  email: { brandColor: '#0066cc' },
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
  brandColor: "#0066cc"
  theme:
    background: "#f4f5f7"
---
```

## Email components

```markdown
# Send a button

::email-button{href="https://example.com" background-color="#0066cc" color="#ffffff" border-radius="4px"}
Click Here
::

# Multi-column layout

::email-columns
Left column content.

Right column content.
::

# Horizontal divider

::email-divider{border-color="#cccccc"}
::
```

Components map directly to native MJML tags: `mj-button`, `mj-section`+`mj-column`, `mj-divider`. Use MJML attributes (not Tailwind classes).

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
