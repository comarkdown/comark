// ─── Comark Parser State ───
export const defaultMarkdown = `---
title: Hello Comark
description: A Comark playground
---

# Hello Comark

This is a **Comark** playground inside DevTools.

Write Markdown with component syntax and see the parsed AST in real-time.

## Features

- **Bold** and *italic* text
- [Links](https://github.com/comarkdown/comark)
- Lists and task lists

### Task List

- [x] Parse markdown
- [x] Generate AST
- [ ] Render components

### Component Syntax

::callout{color="info" icon="i-lucide-info"}
This is a Comark component using MDC syntax.
::

### Github Alert

> [!WARNING]
> This is a warning alert.

### Math

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

### Mermaid

\`\`\`mermaid {height="200px"}
graph TD
A[Start] --> B[Stop]
\`\`\`

### Code Block

\`\`\`ts [example.ts]
import { parse } from 'comark'

const tree = await parse('# Hello World')
console.log(tree.nodes)
\`\`\`

### Table

| Feature   | Status |
| --------- | ------ |
| Parsing   | ✅      |
| Streaming | ✅      |
| Vue       | ✅      |
| React     | ✅      |

### JSON Render

\`\`\`json-render
{
  "root": "card-1",
  "elements": {
    "card-1": {
      "type": "Card",
      "props": { "title": "Welcome" },
      "children": ["text-1"]
    },
    "text-1": {
      "type": "Text",
      "props": { "content": "This is Json Render inside Comark" },
      "children": []
    }
  }
}
\`\`\`

### Footnotes

Comark supports footnotes[^1] with automatic numbering and back-references[^2].

[^1]: Footnotes are collected and rendered as a list at the end of the document.
[^2]: Each footnote includes a back-reference link (↩) to jump back to the reference.
`
