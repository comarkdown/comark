import { createRender } from '@comark/html'
import highlight from '@comark/html/plugins/highlight'
import math, { Math } from '@comark/html/plugins/math'
import mermaid, { Mermaid } from '@comark/html/plugins/mermaid'
import katexCss from 'katex/dist/katex.min.css?raw'
import previewCss from './preview.css?raw'

const render = createRender({
  plugins: [highlight(), math(), mermaid()],
  components: { Math, Mermaid },
})

const SAMPLE = `---
title: Comark HTML Demo
---

# Comark HTML Renderer

Render **Comark** markdown as _styled_ HTML output.

## Text Formatting

You can use **bold**, _italic_, ~~strikethrough~~, and \`inline code\`.

Links look like this: [comark.dev](https://comark.dev)

## Code Block

\`\`\`typescript [main.ts] {1,3}
import { render } from '@comark/html'

const html = await render('# Hello World')
document.body.innerHTML = html
\`\`\`

## Lists

Unordered:

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Ordered:

1. Step one
2. Step two
3. Step three

## Blockquote

> The web is not just a tool,
> it is a way of life.

## GitHub Alerts

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

## Math

Inline: The energy equation $E = mc^2$ is fundamental to physics.

Block display math:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Mermaid

\`\`\`mermaid
graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug]
  D --> A
\`\`\`

## Table

| Feature     | Status  |
| ----------- | ------- |
| Headings    | ✅      |
| Bold/Italic | ✅      |
| Code blocks | ✅      |
| Math        | ✅      |
| Mermaid     | ✅      |
| Tables      | ✅      |
| Lists       | ✅      |

---

_Edit the markdown on the left to see live updates._
`

async function updatePreview(markdown: string) {
  const html = await render(markdown)
  const frame = document.getElementById('preview') as HTMLIFrameElement
  frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>${katexCss}${previewCss}</style></head><body>${html}</body></html>`
}

const input = document.getElementById('input') as HTMLTextAreaElement
input.value = SAMPLE
updatePreview(SAMPLE)

let debounceTimer: ReturnType<typeof setTimeout>
input.addEventListener('input', () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => updatePreview(input.value), 150)
})
