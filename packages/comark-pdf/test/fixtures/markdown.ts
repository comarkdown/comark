/**
 * Shared markdown fixtures for @comark/pdf tests.
 * BASIC_MARKDOWN: minimal two-page document with common Markdown elements.
 * ADVANCED_MARKDOWN: document that uses more Comark plugins and PDF frontmatter options.
 */

export const BASIC_MARKDOWN = `---
pdf:
  format: A4
  margin: 20mm
---

# Hello PDF

This is a **basic** paragraph with _italic_ text and a [link](https://comark.dev).

## Lists

- Item one
- Item two
- Item three

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

::page-break
::

## Second Page

> A blockquote on the second page.

A final paragraph to confirm multi-page rendering.
`

export const ADVANCED_MARKDOWN = `---
title: Advanced PDF
pdf:
  format: A4
  margin: 20mm
  header: 'Advanced PDF'
  footer: 'Page {{ page }} of {{ totalPages }}'
---

# Advanced Document

## Code Block

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`
console.log(greet('World'))
\`\`\`

## Math

Inline: $E = mc^2$.

Block:

$$
\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}
$$

::page-break
::

## Second Page

> A blockquote on the second page.

Additional content to verify multi-page layout and page numbering in the footer.
`
