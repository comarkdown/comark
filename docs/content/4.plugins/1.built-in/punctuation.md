---
title: Punctuation
description: Plugin for converting plain-text punctuation into typographically correct Unicode characters.
seo:
  title: Punctuation Plugin
navigation:
  icon: i-lucide-quote
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /reference/parse
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/punctuation` plugin transforms plain-text punctuation into typographically correct Unicode characters: smart quotes, dashes, ellipsis, and common symbols. No peer dependencies required.

## Usage

```typescript
import { parseMarkdown } from 'comark'
import punctuation from 'comark/plugins/punctuation'

const result = await parseMarkdown('"Hello" -- world... (c)', {
  plugins: [punctuation()]
})
// nodes: [ [ 'p', {}, '“Hello” – world… ©' ] ]
```

With framework components:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import punctuation from '@comark/vue/plugins/punctuation'
</script>

<template>
  <Markdown :plugins="[punctuation()]">{{ content }}</Markdown>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import punctuation from '@comark/react/plugins/punctuation'

<Markdown plugins={[punctuation()]}>{content}</Markdown>
```

```svelte [Svelte]
<script lang="ts">
  import { Markdown } from '@comark/svelte'
  import punctuation from '@comark/svelte/plugins/punctuation'
</script>

<Markdown {content} plugins={[punctuation()]} />
```

::

---

## Features

### Smart quotes

Straight quotes are converted to curly (typographic) quotes:

| Input | Output |
|---|---|
| `"text"` | "text" |
| `'text'` | 'text' |
| `don't` | don't |

### Dashes

| Input | Output | Name |
|---|---|---|
| `--` | – | En-dash |
| `---` | — | Em-dash |

### Ellipsis

| Input | Output |
|---|---|
| `...` | … |

### Symbols

| Input | Output |
|---|---|
| `(c)` | © |
| `(r)` | ® |
| `(tm)` | ™ |
| `+-` | ± |

### Code preservation

Text inside `code`, `pre`, `math`, `kbd`, `script`, and `style` elements is not transformed:

```mdc
Transform this: "hello" -- world...

Don't transform this: `"hello" -- world...`
```

---

## API

### `punctuation(options?)`

Returns a `ComarkPlugin` that applies typographic transformations to text nodes.

**Parameters:**

- `options?` - Optional configuration, see [Options](#options)

**Returns:** `ComarkPlugin`

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`quotes`](#options-quotes) | `boolean \| string \| [string, string, string, string]` | `true` | Convert straight quotes to smart quotes |
| [`dashes`](#options-dashes) | `boolean` | `true` | Convert `--` to en-dash and `---` to em-dash |
| [`ellipsis`](#options-ellipsis) | `boolean` | `true` | Convert `...` to ellipsis character |
| [`symbols`](#options-symbols) | `boolean` | `true` | Convert `(c)`, `(r)`, `(tm)`, `+-` |
| [`normalize`](#options-normalize) | `boolean` | `true` | Collapse repeated punctuation: `????` → `???`, `,,` → `,` |

### `quotes`

Convert straight quotes (`"..."` and `'...'`) to typographic curly quotes.

```typescript
punctuation({ quotes: false }) // disable smart quotes only
```

For locale-specific quotes, pass a string of four characters or an array of four strings, in the order open double, close double, open single, close single:

```typescript
// Russian quotes
punctuation({ quotes: '«»„“' })

// French quotes with non-breaking spaces
punctuation({ quotes: ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] })
```

**Default:** `true`

### `dashes`

Convert `--` to en-dash (–) and `---` to em-dash (—).

```typescript
punctuation({ dashes: false })
```

**Default:** `true`

### `ellipsis`

Convert `...` to the ellipsis character (…).

```typescript
punctuation({ ellipsis: false })
```

**Default:** `true`

### `symbols`

Convert `(c)` → ©, `(r)` → ®, `(tm)` → ™, `+-` → ±.

```typescript
punctuation({ symbols: false })
```

**Default:** `true`

### `normalize`

Collapse repeated punctuation: `????` → `???`, `!!!!` → `!!!`, `,,` → `,`.

```typescript
punctuation({ normalize: false })
```

**Default:** `true`
