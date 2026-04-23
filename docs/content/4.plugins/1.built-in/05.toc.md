---
title: Table of Contents
description: Plugin for automatically generating a table of contents from document headings.
seo:
  title: Table of Contents Plugin
navigation:
  icon: i-lucide-list
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

The `comark/plugins/toc` plugin generates a hierarchical table of contents from document headings and stores it in `tree.meta.toc`. Headings `h2` through `h6` are included — `h1` is always excluded.

## Usage

```typescript
import { parse } from 'comark'
import toc from 'comark/plugins/toc'

const result = await parse(content, {
  plugins: [toc()]
})

console.log(result.meta.toc) // TocTree
```

---

## API

### `toc(options?)`

Returns a `ComarkPlugin` that generates a hierarchical TOC from headings.

**Parameters:**

- `options?` - Optional configuration — see [Options](#options)

**Returns:** `ComarkPlugin`

The result is stored at `tree.meta.toc`:

```typescript
interface TocTree {
  title: string       // TOC title (from options or frontmatter)
  depth: number       // Maximum heading depth included
  searchDepth: number // Search depth in nested structures
  links: TocLink[]    // Hierarchical list of links
}

interface TocLink {
  id: string           // Heading ID for anchor links
  text: string         // Heading text
  depth: number        // Heading level (2–6)
  children?: TocLink[] // Nested child headings
}
```

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`depth`](#code-depth) | `number` | `2` | Heading levels to include: `1` = h2 only, `2` = h2–h3, `3` = h2–h4, etc. |
| [`searchDepth`](#code-searchdepth) | `number` | `2` | How deep to search for headings in nested component structures |
| [`title`](#code-title) | `string` | `''` | Title field on the returned `TocTree` |

::tip
All three options can also be set via frontmatter — `depth`, `searchDepth`, and `title` keys are read automatically and override the plugin options.
::

### `depth`

Controls which heading levels to include. Maps to heading levels: `1` = h2 only, `2` = h2–h3, `3` = h2–h4, up to `5` = h2–h6.

```typescript
toc({ depth: 3 }) // include h2, h3, and h4
```

**Default:** `2`

### `searchDepth`

Controls how deep to search for headings in nested component structures. Increase when headings are inside components or containers.

```typescript
toc({ searchDepth: 3 })
```

**Default:** `2`

### `title`

Sets the `title` field on the returned `TocTree`. Has no effect on rendering — use it to label the TOC in your layout component.

```typescript
toc({ title: 'On This Page' })
```

**Default:** `''`

---

## Examples

### Basic TOC Generation

::code-group

```typescript [Parse API]
import { parse } from 'comark'
import toc from 'comark/plugins/toc'

const content = `## Introduction

## Features

### Performance
### Flexibility

## Conclusion
`

const result = await parse(content, { plugins: [toc()] })
console.log(result.meta.toc)
```

```json [Output]
{
  "title": "",
  "depth": 2,
  "searchDepth": 2,
  "links": [
    { "id": "introduction", "text": "Introduction", "depth": 2 },
    {
      "id": "features",
      "text": "Features",
      "depth": 2,
      "children": [
        { "id": "performance", "text": "Performance", "depth": 3 },
        { "id": "flexibility", "text": "Flexibility", "depth": 3 }
      ]
    },
    { "id": "conclusion", "text": "Conclusion", "depth": 2 }
  ]
}
```

::

### Docs Layout

Parse once to get the TOC, then render it alongside the `<Comark>` component:

::code-group

```vue [Vue]
<script setup lang="ts">
import { parse } from 'comark'
import { Comark } from '@comark/vue'
import toc from '@comark/vue/plugins/toc'

const props = defineProps<{ content: string }>()

const plugins = [toc({ depth: 3 })]
const result = await parse(props.content, { plugins })
const tocData = result.meta.toc
</script>

<template>
  <div class="docs-layout">
    <aside>
      <h2>{{ tocData.title || 'On This Page' }}</h2>
      <nav>
        <ul>
          <li v-for="link in tocData.links" :key="link.id">
            <a :href="`#${link.id}`">{{ link.text }}</a>
            <ul v-if="link.children">
              <li v-for="child in link.children" :key="child.id">
                <a :href="`#${child.id}`">{{ child.text }}</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
    <main>
      <Comark :plugins="plugins">{{ props.content }}</Comark>
    </main>
  </div>
</template>
```

```tsx [React]
import { useEffect, useState } from 'react'
import { parse } from 'comark'
import { Comark } from '@comark/react'
import toc from '@comark/react/plugins/toc'

const plugins = [toc({ depth: 3 })]

export function DocsLayout({ content }: { content: string }) {
  const [tocData, setTocData] = useState<any>(null)

  useEffect(() => {
    parse(content, { plugins }).then(result => setTocData(result.meta.toc))
  }, [content])

  return (
    <div className="docs-layout">
      <aside>
        <h2>{tocData?.title || 'On This Page'}</h2>
        <nav>
          <ul>
            {tocData?.links.map((link: any) => (
              <li key={link.id}>
                <a href={`#${link.id}`}>{link.text}</a>
                {link.children && (
                  <ul>
                    {link.children.map((child: any) => (
                      <li key={child.id}>
                        <a href={`#${child.id}`}>{child.text}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main>
        <Comark plugins={plugins}>{content}</Comark>
      </main>
    </div>
  )
}
```

::

::tip
For deeply nested TOCs, render `link.children` recursively — define a `TocLink` component that calls itself for each child.
::

### With Frontmatter

`depth`, `searchDepth`, and `title` can be set in the document's frontmatter and will override plugin options:

```markdown
---
title: My Guide
depth: 3
searchDepth: 3
---

# My Guide

## Section 1

### Subsection 1.1
```

```typescript
const result = await parse(content, { plugins: [toc()] })
console.log(result.meta.toc.depth) // 3 — from frontmatter
console.log(result.meta.toc.title) // "My Guide" — from frontmatter
```
