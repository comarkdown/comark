---
title: Comark OpenTUI Demo
---

# Comark OpenTUI Renderer

Render **Comark** markdown as a _terminal UI layout tree_. Every construct the
renderer handles is on this page — if something looks wrong here, it is wrong.

## Text Formatting

You can use **bold**, _italic_, **_both_**, ~~strikethrough~~, and `inline code`.

Links look like this: [comark.dev](https://comark.dev) — OSC 8, so cmd-click it.

An image degrades to its alt text: ![a diagram](diagram.png).

This paragraph is wrapped at eighty columns in the source on purpose, because a
soft line break in markdown is a space: the renderer has to collapse them so the
terminal can reflow to **its own width**, keeping emphasis intact across breaks.

## Code Block

```typescript [main.ts]
import { parseMarkdown } from 'comark'
import { Markdown } from '@comark/opentui'

const tree = await parseMarkdown('# Hello World')

export function App() {
  return <Markdown value={tree} />
}
```

Another language, to check the highlighter switches. Python is not in the Shiki
plugin's default set, so the app registers its grammar — without that it renders
as plain text:

```python
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

Unlabelled, so there is nothing to highlight:

```
$ comark render README.md
wrote 4.1 kB
```

## Lists

Unordered:

- First item
- Second item
  - Nested item
    - Third level
- Third item

Ordered:

1. Step one
2. Step two
3. Step three

Starting partway through:

7. Seven
8. Eight

Tasks, which arrive as `input` nodes rather than text:

- [x] Done
- [ ] Not done
- [x] Done with **bold**

An item carrying a block child, which makes the container change shape:

- Run this first:

  ```bash
  pnpm install
  ```

- Then check the output

## Blockquote

> The terminal is not just a tool,
> it is a way of life.

One holding block children:

> First paragraph of the quote.
>
> - a list inside a quote
> - second item

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

## Component Slots

::alert
#title
Hello from the title slot

#default
This is the **default** slot with _markdown_ content.

#footer
Footer slot content here.
::

An unregistered component, which falls back to a passthrough container rather
than throwing:

::not-registered
Body of a component nobody mapped.
::

## Math

Inline: the energy equation $E = mc^2$ is fundamental to physics.

Block display math:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

## Table

| Feature     | Renderer             | Status |
| ----------- | -------------------- | ------ |
| Headings    | text weight + colour | ✅     |
| Bold/Italic | native span hosts    | ✅     |
| Code blocks | tree-sitter          | ✅     |
| Tables      | measured columns     | ✅     |
| Lists       | Yoga hanging indent  | ✅     |

Columns are sized to their widest cell, counted in code points. `✅` occupies two
terminal cells but counts as one, so a column whose widest cell is a
double-width glyph under-measures and pushes the columns after it out of line.
Harmless above, where the header is the widest cell and absorbs the difference.

## Raw HTML

The html plugin is on by default, so these arrive as `div` and `span` nodes that
OpenTUI has no host for. They should render, not crash:

<div class="a-raw-div">A raw HTML block.</div>

Inline <span>html span</span> and an unknown <mark>mark tag</mark> mid-sentence.

---

_Press `s` to replay this document as a stream._
