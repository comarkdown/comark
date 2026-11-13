---
title: Title & Description
description: Plugin for extracting the page title and description from document content.
seo:
  title: Title & Description Plugin
navigation:
  icon: i-lucide-heading
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /reference/parse
    color: neutral
    variant: soft
  - label: Document Model
    icon: i-lucide-braces
    to: /getting-started/document-model
    color: neutral
    variant: soft
---

The `comark/plugins/title-description` plugin extracts the page title and description from the top of a document and stores them in `tree.meta.title` and `tree.meta.description`. By default it reads the first `h1` as the title and the first `p` as the description, keeping both nodes in the tree. Set `remove: true` to strip them so they are not rendered twice.

::note
`comark/plugins/headings` is a **deprecated alias** of `comark/plugins/title-description` and will be removed in the next major version. Prefer `import titleDescription from 'comark/plugins/title-description'`.
::

## Usage

::code-group
```typescript [Usage]
import { parseMarkdown } from 'comark'
import titleDescription from 'comark/plugins/title-description'

const result = await parseMarkdown(content, {
  plugins: [titleDescription()]
})

console.log(result.meta.title)       // "My Page Title"
console.log(result.meta.description) // "First paragraph text."
```
```markdown [content.md]
# My Page Title

First paragraph text.

## Section One

More content here.
```
::

## API

### `titleDescription(options?)`

Returns a `ComarkPlugin` that extracts title and description metadata from top-level nodes.

**Parameters:**

- `options?` - Optional configuration, see [Options](#options)

**Returns:** `ComarkPlugin`

Results are stored at `tree.meta.title` and `tree.meta.description`. Neither field is set when the corresponding node is absent or does not match the configured tag.

::tip
The description check always looks at the node **immediately after** the title: a non-matching node between them will prevent description extraction.
::

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`titleTag`](#titletag) | `string \| false` | `'h1'` | Element tag to extract as the page title, or `false` to disable |
| [`descriptionTag`](#descriptiontag) | `string \| false` | `'p'` | Element tag to extract as the page description, or `false` to disable |
| [`remove`](#remove) | `boolean` | `false` | Remove extracted nodes from the tree after extraction |

### `titleTag`

The element tag to read the title from. Set to `false` to disable title extraction entirely.

```typescript
titleDescription({ titleTag: 'h2' })

// Disable title extraction
titleDescription({ titleTag: false })
```

**Default:** `'h1'`

### `descriptionTag`

The element tag to read the description from. Use `'blockquote'` if you prefer a block quote as the lead-in description. Set to `false` to disable description extraction entirely.

```typescript
titleDescription({ descriptionTag: 'blockquote' })

// Disable description extraction
titleDescription({ descriptionTag: false })
```

**Default:** `'p'`

### `remove`

Whether to remove the extracted nodes from the tree after extraction. Set to `true` when you don't want the title and description rendered, for example, when a layout already displays them separately.

```typescript
titleDescription({ remove: true })
```

**Default:** `false`

---

## Examples

### Default extraction

::code-group

```markdown [content.md]
# My Page Title

This is the opening paragraph used as the description.

## Section One

More content here.
```

```typescript [parse.ts]
import { parseMarkdown } from 'comark'
import titleDescription from 'comark/plugins/title-description'

const result = await parseMarkdown(content, {
  plugins: [titleDescription()]
})

console.log(result.meta.title)       // "My Page Title"
console.log(result.meta.description) // "This is the opening paragraph used as the description."
// result.nodes still contains the h1 and the first p (use remove: true to strip them)
```

::

### Blockquote as description

```typescript
const result = await parseMarkdown(content, {
  plugins: [titleDescription({ descriptionTag: 'blockquote' })]
})

console.log(result.meta.description) // "A highlighted lead-in sentence shown as the description."
```

### Combining with the TOC plugin

```typescript
import { parseMarkdown } from 'comark'
import titleDescription from 'comark/plugins/title-description'
import toc from 'comark/plugins/toc'

const result = await parseMarkdown(content, {
  plugins: [titleDescription(), toc()]
})

console.log(result.meta.title)       // page title
console.log(result.meta.description) // page description
console.log(result.meta.toc)         // table of contents
```
