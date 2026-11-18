# Markdown syntax guide

Syntax reference for authoring Comark (Components in Markdown) documents.

## Standard Markdown

Comark parses CommonMark and GitHub Flavored Markdown (GFM). A few constructs differ, for example `[text]` without a link destination is a span, not a shortcut reference link. See https://comark.dev/syntax/markdown#differences-from-commonmark-and-gfm.

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

**Note:** All headings automatically get an `id` from their visible text (for example, `# Hello World` becomes `<h1 id="hello-world">`). Unicode letters, marks, and numbers are kept (`## Café` -> `café`); punctuation and symbols are stripped, and a heading that slugifies to nothing gets no ID. A leading digit is prefixed with `_` (`## 1. Introduction` -> `_1-introduction`), and a duplicate anywhere in the document gets a numeric suffix (`options`, `options-1`, `options-2`). IDs are flat by default (`## Setup` / `### Install` -> `setup`, `install`); set `headingIds: 'nested'` in parse options to prefix each ID from `h3` down with the nearest `h2`+ ancestor (`setup-install`). Inline marks and link labels contribute their text; an inline component name is omitted (`:icon-star` does not appear in the slug). An explicit `{id="..."}` replaces the generated ID. Set `headingIds: false` to disable generation; a user-supplied `id` is still kept.

### Text formatting

```markdown
**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
`Inline code`
```

### Lists

```markdown
<!-- Unordered lists -->
- Item 1
- Item 2
  - Nested item
  - Another nested item

<!-- Ordered lists -->
1. First item
2. Second item
   1. Nested item
   2. Another nested item
```

### Links and images

```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Link title")
![Image alt text](https://example.com/image.png)
```

### Blockquotes

```markdown
> This is a blockquote
> It can span multiple lines
>
> And contain other Markdown elements
```

### Horizontal rules

```markdown
---
***
___
```

### Line breaks

```markdown
Line with two trailing spaces
Creates a hard line break
```

---

## Frontmatter

Comark supports YAML frontmatter at the beginning of documents:

```markdown
---
title: My Document Title
author: John Doe
date: 2024-01-15
tags:
  - markdown
  - documentation
custom_field: custom value
---

# Document Content

Your markdown content here...
```

### Features

- Must be at the very beginning of the document
- Enclosed by `---` delimiters
- Parsed as YAML
- Stored in `document.frontmatter` on `MarkdownDocument`

### Common fields

- **title**: often used for page titles or TOC labels

Note: `depth` and `searchDepth` are not automatically read from frontmatter. Pass them explicitly to the `toc` plugin options.

### Example

```typescript
import { parseMarkdown } from 'comark'

const content = `---
title: My Article
depth: 3
---

# Introduction
Content here...
`

const result = await parseMarkdown(content)
console.log(result.frontmatter)
// { title: 'My Article', depth: 3 }
```

---

## Comark components

Comark (Components in Markdown) extends standard Markdown with custom component syntax.

### Block components

Block components use the `::component-name` syntax:

```markdown
::component-name{prop1="value1" prop2="value2"}
Content inside the component

Can have **Markdown** and other elements
::
```

#### Examples

```markdown
<!-- Alert component -->
::alert{type="info"}
This is an important message!
::

<!-- Card component -->
::card{title="My Card"}
Card content with **Markdown** support
::

<!-- Empty component -->
::divider
::
```

### Inline components

Inline components use the `:component-name` syntax:

```markdown
<!-- Standalone inline component -->
:icon-check

<!-- Inline component with content -->
:badge[New]{color="blue"}

<!-- Inline component with properties -->
:tooltip{text="Hover text"}
```

#### Examples

```markdown
Check out this :icon-star component in the middle of text.

Click the :button[Submit]{type="primary"} to continue.

The status is :badge[Active]{color="green"} right now.
```

### Component properties

Components support the following property syntaxes:

```markdown
::component{prop="value"}
<!-- Standard key-value pair -->
::

::component{bool}
<!-- Boolean property (becomes :bool="true" in AST) -->
::

::component{#custom-id}
<!-- ID attribute -->
::

::component{.class-name}
<!-- CSS class -->
::

::component{:obj='{"key": "value"}'}
<!-- Object/JSON value -->
::

::component{:arr='["item1", "item2"]'}
<!-- Array/JSON value -->
::

::component{multiple="props" bool #id .class}
<!-- Multiple properties combined -->
::
```

### Component slots

Block components support named slots using the `#slot-name` syntax:

```markdown
::card
#header
## Card Title

#content
This is the main content of the card

#footer
Footer text here

#default
Default slot
::
```

#### AST output

```json
{
  "nodes": [
    [
      "card",
      {},
      [
        "template",
        { "name": "header" },
        ["h2", {}, "Card Title"]
      ],
      [
        "template",
        { "name": "content" },
        ["p", {}, "This is the main content of the card"]
      ],
      [
        "template",
        { "name": "footer" },
        ["p", {}, "Footer text here"]
      ],
      [
        "template",
        { "name": "default" },
        ["p", {}, "Default slot"]
      ]
    ]
  ],
  "frontmatter": {},
  "meta": {}
}
```

### Default slot

Content inside a component without a slot marker goes to the **default slot**. These two forms render the same way:

```markdown
::component
hello
::
```

```markdown
::component
#default
hello
::
```

**Without `#default`**, content becomes direct children (auto-unwrapped):
```json
["component", {}, "hello"]
```

**With `#default`**, content is wrapped in an explicit template node:
```json
["component", {}, ["template", { "name": "default" }, "hello"]]
```

Both serialize back to the same Markdown (without `#default`). The Vue, React, Svelte, and Angular renderers treat both forms identically: direct children and `template[name="default"]` children both become the default slot. Use `#default` explicitly when mixing named and default slots in the same component.

### Nested components

Components can be nested within each other:

```markdown
::outer-component
Content in outer

:::inner-component{variant="compact"}
Content in inner
:::

More content in outer
::
```

---

## Attributes

Add custom attributes to native Markdown elements by placing `{...}` right after the element.

### Strong/bold attributes

```markdown
**bold text**{.highlight #important}
**bold text**{data-value="custom"}
**bold text**{bool}
```

### Italic/emphasis attributes

```markdown
*italic text*{.emphasized}
_italic text_{#custom-id}
```

### Link attributes

```markdown
[Link text](url){target="_blank" rel="noopener"}
[Link text](url){.button .primary}
[External](https://example.com){target="_blank" .external-link}
```

### Image attributes

```markdown
![Alt text](image.png){.responsive width="800" height="600"}
![Logo](logo.svg){.logo #site-logo}
```

### Inline code attributes

```markdown
`code snippet`{.language-js}
`variable`{data-type="string"}
```

### Span attributes

```markdown
This is [highlighted text]{.highlight .yellow} in a paragraph.
```

### Attribute types

- **Boolean:** `{bool}` -> `:bool="true"`
- **ID:** `{#my-id}` -> `id="my-id"`
- **Class:** `{.my-class}` -> `class="my-class"`
- **Key-value:** `{key="value"}` -> `key="value"`
- **JSON objects:** `{:data='{"key": "val"}'}` -> `data={"key": "val"}`

---

## Code blocks

Fenced code blocks support a language identifier, filename, line highlights, and custom metadata.

### Basic code block

````markdown
```javascript
function hello() {
  console.log("Hello, World!")
}
```
````

### Language with syntax highlighting

````markdown
```typescript
interface User {
  name: string
  age: number
}
```
````

### Filename metadata

````markdown
```javascript [server.js]
const express = require('express')
const app = express()
```
````

Enclose the filename in `[...]` brackets.

### Line highlighting

````markdown
```javascript {1-3,5}
function example() {
  const a = 1  // Lines 1-3 highlighted
  const b = 2
  const c = 3
  return a + b + c  // Line 5 highlighted
}
```
````

#### Highlighting syntax

- Single line: `{3}`
- Range: `{1-5}`
- Multiple: `{1,3,5}`
- Combined: `{1-3,7,10-12}`

### Combined metadata

````markdown
```javascript {1-3} [utils.ts] meta=value
function hello() {
  console.log("Hello")
}
```
````

Metadata tokens after the language can appear in any order:
- `language {highlights} [filename] meta`
- `language [filename] {highlights} meta`

### Special characters in filename

````markdown
```typescript [@[...slug\].ts]
// Brackets and special chars are supported
// Backslash escapes special characters
```
````

### No language specified

````markdown
```
Plain text code block
No syntax highlighting
```
````

### AST structure

```json
{
  "nodes": [
    [
      "pre",
      {
        "language": "javascript",
        "filename": "server.js",
        "highlights": [1, 2, 3],
        "meta": "meta=value"
      },
      [
        "code",
        { "class": "language-javascript" },
        "code content here"
      ]
    ]
  ],
  "frontmatter": {},
  "meta": {}
}
```

---

## Task lists

Comark supports GitHub Flavored Markdown task lists:

```markdown
- [x] Completed task
- [ ] Pending task
- [x] Another completed task
  - [ ] Nested pending task
  - [x] Nested completed task
```

### Features

- `[x]` or `[X]` for completed tasks
- `[ ]` for pending tasks
- Works in both ordered and unordered lists
- Supports nesting

### HTML output

```html
<ul class="contains-task-list">
  <li class="task-list-item">
    <input type="checkbox" disabled checked class="task-list-item-checkbox">
    Completed task
  </li>
  <li class="task-list-item">
    <input type="checkbox" disabled class="task-list-item-checkbox">
    Pending task
  </li>
</ul>
```

---

## Tables

Comark supports GitHub Flavored Markdown tables:

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Aligned tables

```markdown
| Left Aligned | Center Aligned | Right Aligned |
| :----------- | :------------: | ------------: |
| Left         | Center         | Right         |
| Text         | Text           | Text          |
```

#### Alignment syntax

- Left: `:---`
- Center: `:---:`
- Right: `---:`

### Inline Markdown in tables

```markdown
| Feature      | Status          | Link                    |
| ------------ | --------------- | ----------------------- |
| **Bold**     | *Italic*        | [Link](https://example) |
| `Code`       | ~~Strike~~      | ![Image](img.png)       |
```

### Varying column widths

```markdown
| Short | Medium Column | Very Long Column Name Here |
| ----- | ------------- | -------------------------- |
| A     | B             | C                          |
```

---

[Back to skill guide](../SKILL.md)
