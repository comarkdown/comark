import { Component } from '@angular/core'
import { ComarkComponent } from '@comark/angular'
import highlight from 'comark/plugins/highlight'
import alert from 'comark/plugins/alert'
import { AlertComponent } from '../components/alert.component'
import { FeatureCardComponent } from '../components/feature-card.component'
import python from '@shikijs/langs/python'

@Component({
  selector: 'app-syntax',
  standalone: true,
  imports: [ComarkComponent],
  template: `
    <comark
      [markdown]="markdown"
      [plugins]="plugins"
      [components]="components"
    />
  `,
})
export class SyntaxComponent {
  components = { alert: AlertComponent, 'feature-card': FeatureCardComponent }
  plugins = [
    highlight({
      languages: [python],
    }),
    alert(),
  ]

  markdown = `
# Comark Syntax Showcase

All syntax features supported by Comark, from standard **CommonMark** to Comark-specific extensions.

---

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

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
    - Deep nested
- Item three

### Ordered

1. First item
2. Second item
   1. Nested ordered
   2. Another nested
3. Third item

### Task list

- [x] Completed task
- [ ] Pending task
- [x] Another done
- [ ] Yet to do

---

## Blockquotes

> A simple blockquote.

> Blockquotes support **formatting** and
> can span multiple lines.
>
> > Nested blockquotes work too.

---

## Alert Blockquotes

> [!NOTE]
> A note for the reader.

> [!TIP]
> A helpful tip.

> [!WARNING]
> Something to be cautious about.

> [!CAUTION]
> A potential risk or danger.

---

## Code Blocks

Plain fenced block:

~~~
No syntax highlighting
~~~

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

~~~python {1,3-5}
print("Line 1 — highlighted")
print("Line 2 — not highlighted")
print("Line 3 — highlighted")
print("Line 4 — highlighted")
print("Line 5 — highlighted")
~~~

---

## Tables

| Name           | Type       | Required | Description              |
| :------------- | :--------: | :------: | -----------------------: |
| \`markdown\`     | \`string\`   | Yes      | Content to render        |
| \`options\`      | \`object\`   | No       | Parser options           |
| \`components\`   | \`object\`   | No       | Custom component map     |

---

## Block Components

Block components are declared with \`::name\` and closed with \`::\`.
Props can be passed inline or as YAML frontmatter.

### Inline props

::alert{type="info"}
This is an **info** alert rendered with a custom \`AlertComponent\`.
::

::alert{type="warning"}
This is a **warning** alert with a [link](https://comark.dev).
::

::alert{type="success"}
Task completed successfully.
::

::alert{type="error"}
Something went wrong.
::

### YAML frontmatter props

::alert
---
type: warning
---
This alert uses **YAML frontmatter** for its \`type\` prop.
::

---

## Component Slots

Angular components receive default content via \`<ng-content />\`, and named slots via \`<ng-content select="[slot=name]" />\`:

::feature-card
#header
Slot-aware Angular component

#default
This body is the default slot. It can contain **Markdown**, links, lists, or any nested Comark content.

#footer
Rendered through the \`footer\` slot in \`FeatureCardComponent\`.
::

---

## Nested Block Components

Increase fence depth with extra colons (\`:::\`, \`::::\`, …) to nest:

::alert{type="info"}
Outer info alert.
  :::alert{type="warning"}
  Nested warning inside the info.
  :::
::

---

## Inline Components

Inline components are prefixed with a single colon.

Plain: :span

With label: :span[hello]

With props: :span[hello]{style="color: tomato;"}

---

## Frontmatter

Documents can declare YAML frontmatter at the top (before any content):

~~~yaml
---
title: My Document
description: A short description
tags:
  - markdown
  - comark
published: true
---
~~~

Access frontmatter via \`tree.frontmatter\` when using the \`ComarkRendererComponent\`.

---

## Comments

HTML comments are parsed and ignored by the renderer:

<!-- This comment is invisible in the output -->

Text before the comment and text after the comment both render normally.
`
}
