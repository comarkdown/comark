---
title: Headings
description: Plugin for extracting the page title and description from document content.
seo:
  title: Headings Plugin
navigation:
  icon: i-lucide-heading
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /api/parse
    color: neutral
    variant: soft
  - label: Comark AST
    icon: i-lucide-braces
    to: /syntax/comark-ast
    color: neutral
    variant: soft
---

The `comark/plugins/headings` plugin extracts the page title and description from the top of a document and stores them in `tree.meta.title` and `tree.meta.description`. By default it reads the first `h1` as the title and the first `p` as the description, then removes both nodes from the tree so they are not rendered twice.

## Usage

```typescript
import { parse } from 'comark'
import headings from 'comark/plugins/headings'

const result = await parse(content, {
  plugins: [headings()]
})

console.log(result.meta.title)       // "My Page Title"
console.log(result.meta.description) // "First paragraph text."
```

---

## API

### `headings(options?)`

Returns a `ComarkPlugin` that extracts title and description metadata from top-level nodes.

**Parameters:**

- `options?` - Optional configuration — see [Options](#options)

**Returns:** `ComarkPlugin`

Results are stored at `tree.meta.title` and `tree.meta.description`. Neither field is set when the corresponding node is absent or does not match the configured tag.

::tip
The description check always looks at the node **immediately after** the title — a non-matching node between them will prevent description extraction.
::

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`titleTag`](#code-titletag) | `string` | `'h1'` | Element tag to extract as the page title |
| [`descriptionTag`](#code-descriptiontag) | `string` | `'p'` | Element tag to extract as the page description |
| [`remove`](#code-remove) | `boolean` | `true` | Remove extracted nodes from the tree after extraction |

### `titleTag`

The element tag to read the title from.

```typescript
headings({ titleTag: 'h2' })
```

**Default:** `'h1'`

### `descriptionTag`

The element tag to read the description from. Use `'blockquote'` if you prefer a block quote as the lead-in description.

```typescript
headings({ descriptionTag: 'blockquote' })
```

**Default:** `'p'`

### `remove`

Whether to remove the extracted nodes from the tree after extraction. Set to `false` when you want the metadata available but still need the nodes rendered — for example, when a custom component handles the `h1` display.

```typescript
headings({ remove: false })
```

**Default:** `true`

---

## Examples

### Default Extraction

::code-group

```markdown [content.md]
# My Page Title

This is the opening paragraph used as the description.

## Section One

More content here.
```

```typescript [parse.ts]
import { parse } from 'comark'
import headings from 'comark/plugins/headings'

const result = await parse(content, {
  plugins: [headings()]
})

console.log(result.meta.title)       // "My Page Title"
console.log(result.meta.description) // "This is the opening paragraph used as the description."
// result.nodes no longer contains the h1 or the first p
```

::

### Blockquote as Description

```typescript
const result = await parse(content, {
  plugins: [headings({ descriptionTag: 'blockquote' })]
})

console.log(result.meta.description) // "A highlighted lead-in sentence shown as the description."
```

### Combining with the TOC Plugin

```typescript
import { parse } from 'comark'
import headings from 'comark/plugins/headings'
import toc from 'comark/plugins/toc'

const result = await parse(content, {
  plugins: [headings(), toc()]
})

console.log(result.meta.title)       // page title
console.log(result.meta.description) // page description
console.log(result.meta.toc)         // table of contents
```
