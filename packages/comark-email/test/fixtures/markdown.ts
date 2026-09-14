/**
 * Shared markdown fixtures for @comark/email tests.
 * BASIC_EMAIL_MARKDOWN: minimal document with common elements and email frontmatter.
 * ADVANCED_EMAIL_MARKDOWN: document with email components, theme, and more Markdown features.
 */

export const BASIC_EMAIL_MARKDOWN = `---
email:
  subject: "Hello from Comark"
  previewText: "This is the email preview text."
---

# Welcome

This is a **basic** email with _italic_ text and a [link](https://comark.dev).

## Features

- Fast rendering
- MJML-compiled output
- Email-safe HTML
`

export const ADVANCED_EMAIL_MARKDOWN = `---
email:
  subject: "Your order has shipped!"
  previewText: "Track your package delivery status."
  brandColor: "#0066cc"
  theme:
    primary: "#0066cc"
    background: "#f4f5f7"
---

# Order Shipped

Your order is on its way.

::email-button{href="https://example.com/track" background-color="#0066cc" color="#ffffff"}
Track Package
::

---

## What's next

::email-columns
Left column content.

Right column content.
::

::email-divider{border-color="#cccccc"}
::

A final paragraph to confirm rendering.
`
