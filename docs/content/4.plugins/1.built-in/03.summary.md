---
title: Summary Extraction
description: Plugin for extracting content summaries using the <!-- more --> delimiter.
seo:
  title: Summary Extraction Plugin
navigation:
  icon: i-lucide-file-text
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /api/parse
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/summary` plugin extracts content before a `<!-- more -->` comment and stores it in `tree.meta.summary`. Useful for blog listings, article previews, RSS feeds, and anywhere you need a short excerpt of the full content.

## Usage

```typescript
import { parse } from 'comark'
import summary from 'comark/plugins/summary'

const content = `# Article Title

This is the introduction that will become the summary.

<!-- more -->

This is the full article content.
`

const result = await parse(content, {
  plugins: [summary()]
})

console.log(result.meta.summary) // ComarkNode[] — nodes before <!-- more -->
console.log(result.nodes)        // full content
```

With framework components:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Comark } from '@comark/vue'
import summary from '@comark/vue/plugins/summary'

const plugins = [summary()]
</script>

<template>
  <!-- renders only the summary portion -->
  <Comark :plugins="plugins" summary>{{ content }}</Comark>
</template>
```

```tsx [React]
import { Comark } from '@comark/react'
import summary from '@comark/react/plugins/summary'

<Comark plugins={[summary()]} summary>
  {content}
</Comark>
```

::

::tip
The `summary` prop on `<Comark>` renders only the extracted summary nodes. Without it, the full content is rendered and `meta.summary` is available separately.
::

---

## API

### `summary(options?)`

Returns a `ComarkPlugin` that extracts content before the delimiter.

**Parameters:**

- `options?` - Optional configuration — see [Options](#options)

**Returns:** `ComarkPlugin`

The extracted nodes are stored at `tree.meta.summary` as `ComarkNode[]`. If no delimiter is found in the content, `meta.summary` is not set.

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`delimiter`](#code-delimiter) | `string` | `'<!-- more -->'` | HTML comment used to split summary from full content |

### `delimiter`

The HTML comment string that marks the end of the summary. The delimiter itself is removed from both the summary and the full content.

```typescript
summary({ delimiter: '<!-- summary -->' })
```

---

## Examples

### Blog Listing

Render summaries in a listing page and link to the full article:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Comark } from '@comark/vue'
import summary from '@comark/vue/plugins/summary'

const plugins = [summary()]
</script>

<template>
  <div class="articles">
    <article v-for="article in articles" :key="article.slug">
      <h2>{{ article.title }}</h2>
      <Comark :plugins="plugins" summary>{{ article.content }}</Comark>
      <a :href="`/articles/${article.slug}`">Read more →</a>
    </article>
  </div>
</template>
```

```tsx [React]
import { Comark } from '@comark/react'
import summary from '@comark/react/plugins/summary'

const plugins = [summary()]

export function ArticleList({ articles }) {
  return (
    <div className="articles">
      {articles.map(article => (
        <article key={article.slug}>
          <h2>{article.title}</h2>
          <Comark plugins={plugins} summary>{article.content}</Comark>
          <a href={`/articles/${article.slug}`}>Read more →</a>
        </article>
      ))}
    </div>
  )
}
```

::
