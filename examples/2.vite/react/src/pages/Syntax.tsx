import { useEffect, useState } from 'react'
import { parse } from '@comark/react/parse'
import highlight from '@comark/react/plugins/highlight'
import { ComarkRenderer } from '@comark/react'
import type { ComarkTree } from '@comark/react'
import Alert from '../components/Alert'

const markdown = `
# Comark Syntax Showcase

All syntax features supported by Comark, from standard **CommonMark** to Comark-specific extensions.

---

## Headings

# Heading 1
## Heading 2
### Heading 3

---

## Text Formatting

**Bold** and __also bold__

*Italic* and _also italic_

***Bold and italic*** together

~~Strikethrough~~

\`Inline code\`

---

## Links

A [plain link](https://comark.dev), a [link with title](https://comark.dev "Comark"), and a [link with attributes](https://comark.dev){target="_blank" rel="noopener"}.

---

## Lists

### Unordered

- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

### Ordered

1. First item
2. Second item
   1. Nested ordered
   2. Another nested

### Task list

- [x] Completed task
- [ ] Pending task

---

## Blockquotes

> A simple blockquote.

> Blockquotes support **formatting** and
> can span multiple lines.

---

## Alert Blockquotes

> [!NOTE]
> A note for the reader.

> [!WARNING]
> Something to be cautious about.

---

## Code Blocks

With a language:

~~~javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
~~~

With a filename:

~~~typescript [utils.ts]
export function add(a: number, b: number): number {
  return a + b
}
~~~

With line highlighting:

~~~js {1,3}
const a = 1 // highlighted
const b = 2
const c = 3 // highlighted
~~~

---

## Tables

| Name           | Type       | Required | Description              |
| :------------- | :--------: | :------: | -----------------------: |
| \`markdown\`     | \`string\`   | Yes      | Content to render        |
| \`components\`   | \`object\`   | No       | Custom component map     |

---

## Block Components

::Alert{type="info"}
This is an **info** alert rendered with a custom \`Alert\` component.
::

::Alert{type="warning"}
This is a **warning** alert with a [link](https://comark.dev).
::

### Nested

::Alert{type="info"}
Outer info alert.
  :::Alert{type="warning"}
  Nested warning inside the info.
  :::
::

---

## Frontmatter

Documents can declare YAML frontmatter at the top (before any content). Access it via \`tree.frontmatter\` when using \`ComarkRenderer\`.

---

## Comments

HTML comments are parsed and ignored by the renderer:

<!-- This comment is invisible in the output -->

Text before the comment and text after the comment both render normally.
`

export default function Syntax() {
  const [tree, setTree] = useState<ComarkTree | null>(null)

  useEffect(() => {
    parse(markdown, { plugins: [highlight()] }).then(setTree)
  }, [])

  if (!tree) return null

  return (
    <ComarkRenderer
      tree={tree}
      components={{ Alert }}
    />
  )
}
