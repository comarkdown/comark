# Parsing & AST Generation

Complete guide for parsing Comark documents and working with the Comark AST format.

## Table of Contents

- [String Parsing](#string-parsing)
- [Async Parsing with Syntax Highlighting](#async-parsing-with-syntax-highlighting)
- [Stream Parsing](#stream-parsing)
- [AST Structure](#ast-structure)
- [Rendering AST](#rendering-ast)

---

## String Parsing

The primary way to parse Comark content is using the `parse()` function:

```typescript
import { parse } from 'comark'

const content = `---
title: My Document
---

# Hello World

This is **markdown** with :icon-star component.

::alert{type="info"}
Important message here
::
`

const result = await parse(content)
```

### Result Structure

```typescript
interface ComarkTree {
  nodes: ComarkNode[]                   // Parsed AST nodes
  frontmatter: Record<string, any>      // YAML frontmatter data
  meta: {
    toc?: any                           // Table of contents (from toc plugin)
    summary?: ComarkNode[]              // Summary content (from summary plugin)
    [key: string]: any                  // Other plugin metadata
  }
}
```

### Parse Options

```typescript
interface ParseOptions {
  autoUnwrap?: boolean      // Remove unnecessary <p> wrappers (default: true)
  autoClose?: boolean       // Auto-close unclosed syntax (default: true)
  plugins?: ComarkPlugin[]  // Enable plugins (e.g., highlight, emoji, toc)
}
```

### Examples

```typescript
// Default parsing
const result = await parse(content)

// Disable auto-unwrap
const result = await parse(content, { autoUnwrap: false })

// Disable auto-close
const result = await parse(content, { autoClose: false })

// Both disabled
const result = await parse(content, {
  autoUnwrap: false,
  autoClose: false
})
```

### Auto-Unwrap Feature

Auto-unwrap removes unnecessary paragraph wrappers from container components:

**Without auto-unwrap:**
```json
["alert", {}, ["p", {}, "Text"]]
```

**With auto-unwrap:**
```json
["alert", {}, "Text"]
```

Container components: `alert`, `card`, `callout`, `note`, `warning`, `tip`, `info`

### Auto-Close Feature

Auto-close automatically closes unclosed markdown syntax, essential for streaming:

```typescript
import { autoCloseMarkdown } from 'comark'

// Unclosed bold
const partial = '**bold text'
const closed = autoCloseMarkdown(partial)
// Result: '**bold text**'

// Unclosed component
const component = '::alert{type="info"}\nMessage'
const closedComponent = autoCloseMarkdown(component)
// Result: '::alert{type="info"}\nMessage\n::'

// Unclosed properties
const props = 'Text {prop="value'
const closedProps = autoCloseMarkdown(props)
// Result: 'Text {prop="value"}'
```

**Auto-close handles:**
- Inline markers: `*`, `**`, `***`, `~~`, backticks
- Brackets: `[`, `]`, `(`, `)`
- Comark components: `::component`
- Property braces: `{...}`

---

## Async Parsing with Syntax Highlighting

For syntax highlighting support, use the `highlight` plugin:

```typescript
import { parse } from 'comark'
import highlight from 'comark/plugins/highlight'

const content = `
# Code Example

\`\`\`javascript
function hello() {
  console.log("Hello!")
}
\`\`\`
`

// Enable syntax highlighting
const result = await parse(content, {
  plugins: [highlight()]
})

// With custom Shiki options
const result = await parse(content, {
  plugins: [
    highlight({
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      languages: ['javascript', 'typescript', 'python']
    })
  ]
})
```

### Highlight Plugin Options

```typescript
interface HighlightOptions {
  themes?: Record<string, string>  // { light: 'github-light', dark: 'github-dark' }
  languages?: string[]             // Languages to preload
  preStyles?: boolean              // Add pre background/foreground styles
}
```

### Dual Theme Support

```typescript
import highlight from 'comark/plugins/highlight'

const result = await parse(content, {
  plugins: [
    highlight({
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      }
    })
  ]
})
```

---

## AST Structure

Comark uses a lightweight array-based AST structure.

### Comark AST Format

```typescript
interface ComarkTree {
  nodes: ComarkNode[]                   // Parsed AST nodes
  frontmatter: Record<string, any>      // YAML frontmatter data
  meta: {
    toc?: any                           // Table of contents (from toc plugin)
    summary?: ComarkNode[]              // Summary content (from summary plugin)
    [key: string]: any                  // Other plugin metadata
  }
}

type ComarkNode =
  | string                    // Text nodes
  | [tag: string, props?: Record<string, any>, ...children: ComarkNode[]]
```

### Node Structure

**Text Node:**
```json
"plain text content"
```

**Element Node:**
```json
["tag", { "prop": "value" }, ...children]
```

### Examples

```json
// Paragraph with text
["p", {}, "Simple paragraph"]

// Paragraph with bold text
["p", {}, "Text with ", ["strong", {}, "bold"], " word"]

// Heading with ID
["h1", { "id": "hello-world" }, "Hello World"]

// Link with attributes
["a", { "href": "https://example.com", "target": "_blank" }, "Link"]

// Comark Component
["alert", { "type": "info" }, ["p", {}, "Message"]]

// Component with slots
[
  "card",
  {},
  ["template", { "name": "header" }, ["h2", {}, "Title"]],
  ["template", { "name": "content" }, ["p", {}, "Content"]]
]
```

### Complete AST Example

**Input:**
```markdown
---
title: Example
---

# Hello World

This is **bold** and *italic* text.

::alert{type="warning"}
Warning message
::
```

**AST:**
```json
{
  "nodes": [
    [
      "h1",
      { "id": "hello-world" },
      "Hello World"
    ],
    [
      "p",
      {},
      "This is ",
      ["strong", {}, "bold"],
      " and ",
      ["em", {}, "italic"],
      " text."
    ],
    [
      "alert",
      { "type": "warning" },
      ["p", {}, "Warning message"]
    ]
  ],
  "frontmatter": {
    "title": "Example"
  },
  "meta": {}
}
```

### Property Conventions

- **Boolean props:** `:bool="true"` (props starting with `:`)
- **Standard props:** `key="value"`
- **ID:** `id="value"` (from `{#value}`)
- **Class:** `class="value"` (from `{.value}`)
- **Custom data:** Any attribute name and value

---

## Rendering AST

### Render to HTML

```typescript
import { parse } from 'comark'
import { renderHTML } from 'comark/string'

const content = '# Hello World\n\nThis is **markdown**.'
const tree = await parse(content)

const html = renderHTML(tree)
console.log(html)
```

**Output:**
```html
<h1 id="hello-world">Hello World</h1>
<p>This is <strong>markdown</strong>.</p>
```

### Render to Markdown

Convert AST back to Comark markdown:

```typescript
import { parse } from 'comark'
import { renderMarkdown } from 'comark/string'

const content = '# Hello\n\n::alert{type="info"}\nMessage\n::'
const result = await parse(content)

const markdown = renderMarkdown(result.nodes)
console.log(markdown)
```

**Output:**
```markdown
# Hello

::alert{type="info"}
Message
::
```

### Use Cases

- Round-trip parsing (parse → modify AST → render back)
- AST transformation
- Content normalization
- Markdown generation from programmatic AST

---

[← Back to Main Skills Guide](../../SKILLS.md)
