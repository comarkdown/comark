# Parsing and document model

Guide to parsing Comark content and working with the serializable `MarkdownDocument` model.

## String parsing

Parse Markdown strings with `parseMarkdown()`:

```typescript
import { parseMarkdown } from 'comark'

const content = `---
title: My Document
---

# Hello World

This is **Markdown** with :icon-star component.

::alert{type="info"}
Important message here
::
`

const result = await parseMarkdown(content)
```

### Result structure

```typescript
interface MarkdownDocument {
  nodes: Node[]                   // Parsed AST nodes
  frontmatter: Record<string, any>      // YAML frontmatter data
  meta: {
    toc?: any                           // Table of contents (from toc plugin)
    summary?: Node[]              // Summary content (from summary plugin)
    [key: string]: any                  // Other plugin metadata
  }
}
```

### Parse options

```typescript
interface ParserOptions {
  autoUnwrap?: boolean      // Remove single-paragraph <p> wrappers (default: true)
  autoClose?: boolean       // Auto-close unfinished syntax (default: true)
  plugins?: ComarkPlugin[]  // Enable plugins (for example, shiki, emoji, toc)
}
```

### Examples

```typescript
// Default parsing
const result = await parseMarkdown(content)

// Disable auto-unwrap
const result = await parseMarkdown(content, { autoUnwrap: false })

// Disable auto-close
const result = await parseMarkdown(content, { autoClose: false })

// Both disabled
const result = await parseMarkdown(content, {
  autoUnwrap: false,
  autoClose: false
})
```

### Auto-unwrap feature

Auto-unwrap removes single-paragraph `<p>` wrappers from container components:

**Without auto-unwrap:**
```json
["alert", {}, ["p", {}, "Text"]]
```

**With auto-unwrap:**
```json
["alert", {}, "Text"]
```

Auto-unwrap applies to any container whose only child is a single paragraph.

### Auto-close feature

Auto-close completes unfinished Markdown syntax so partial input renders cleanly during streaming:

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

## Async parsing with syntax highlighting

For syntax highlighting, pass the `shiki` plugin:

```typescript
import { parseMarkdown } from 'comark'
import shiki from 'comark/plugins/shiki'

const content = `
# Code Example

\`\`\`javascript
function hello() {
  console.log("Hello!")
}
\`\`\`
`

// Enable syntax highlighting
const result = await parseMarkdown(content, {
  plugins: [shiki()]
})

// With custom Shiki options
const result = await parseMarkdown(content, {
  plugins: [
    shiki({
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      languages: ['javascript', 'typescript', 'python']
    })
  ]
})
```

### Shiki plugin options

```typescript
// Standard entry: comark/plugins/shiki
interface ShikiOptions {
  registerDefaultLanguages?: boolean  // default: true
  registerDefaultThemes?: boolean     // default: true
  themes?: {
    light?: ThemeRegistration         // default: material-theme-lighter
    dark?: ThemeRegistration          // default: material-theme-palenight
  }
  languages?: Array<LanguageRegistration | LanguageRegistration[]>  // merged onto default set
  transformers?: ShikiTransformer[]
  preStyles?: boolean
}

// Core entry: comark/plugins/shiki/core (no defaults, no registerDefault* options)
interface ShikiCoreOptions {
  themes: {                           // required
    light?: ThemeRegistration
    dark?: ThemeRegistration
  }
  languages: Array<LanguageRegistration | LanguageRegistration[]>  // required
  transformers?: ShikiTransformer[]
  preStyles?: boolean
}
```

### Dual theme support

```typescript
import shiki from 'comark/plugins/shiki'

const result = await parseMarkdown(content, {
  plugins: [
    shiki({
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      }
    })
  ]
})
```

---

## Document structure

Comark returns a serializable `MarkdownDocument` with compact tuple-based nodes.

### MarkdownDocument format

```typescript
interface MarkdownDocument {
  nodes: Node[]                   // Parsed AST nodes
  frontmatter: Record<string, any>      // YAML frontmatter data
  meta: {
    toc?: any                           // Table of contents (from toc plugin)
    summary?: Node[]              // Summary content (from summary plugin)
    [key: string]: any                  // Other plugin metadata
  }
}

type Node =
  | string                    // Text nodes
  | [tag: string, props?: Record<string, any>, ...children: Node[]]
  | [null, Record<string, any>, string] // Comment nodes
```

### Node structure

**Text node:**
```json
"plain text content"
```

**Element node:**
```json
["tag", { "prop": "value" }, ...children]
```

### Examples

```json
// Paragraph with text
["p", {}, "First paragraph"]

// Paragraph with bold text
["p", {}, "Text with ", ["strong", {}, "bold"], " word"]

// Heading with ID
["h1", { "id": "hello-world" }, "Hello World"]

// Link with attributes
["a", { "href": "https://example.com", "target": "_blank" }, "Link"]

// Comark component
["alert", { "type": "info" }, "Message"]

// Component with slots
[
  "card",
  {},
  ["template", { "name": "header" }, ["h2", { "id": "title" }, "Title"]],
  ["template", { "name": "content" }, "Content"]
]

// Default slot: content without #slot-name becomes direct children
["component", {}, "hello"]

// Explicit #default wraps in a template node (equivalent in rendering)
["component", {}, ["template", { "name": "default" }, "hello"]]
```

### Complete document example

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

### Property conventions

- **Boolean props:** `:bool="true"` (props starting with `:`)
- **Standard props:** `key="value"`
- **ID:** `id="value"` (from `{#value}`)
- **Class:** `class="value"` (from `{.value}`)
- **Custom data:** any attribute name and value

---

## Rendering documents

### Render to HTML

```typescript
import { parseMarkdown } from 'comark'
import { renderHtmlFromDocument } from '@comark/html'

const content = '# Hello World\n\nThis is **Markdown**.'
const doc = await parseMarkdown(content)

const html = await renderHtmlFromDocument(doc)
console.log(html)
```

**Output:**
```html
<h1 id="hello-world">Hello World</h1>
<p>This is <strong>Markdown</strong>.</p>
```

### Render to Markdown

Convert a document back to Comark Markdown:

```typescript
import { parseMarkdown } from 'comark'
import { renderMarkdown } from 'comark/render'

const content = '# Hello\n\n::alert{type="info"}\nMessage\n::'
const document = await parseMarkdown(content)

const markdown = await renderMarkdown(document)
console.log(markdown)
```

**Output:**
```markdown
# Hello

::alert{type="info"}
Message
::
```

### Use cases

- Round-trip parsing (parse, modify nodes, render back)
- AST transformation
- Content normalization
- Markdown generation from programmatic node trees

---

[Back to skill guide](../SKILL.md)
