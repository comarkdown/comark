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
    to: /api/parse
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/punctuation` plugin transforms plain-text punctuation into typographically correct Unicode characters — smart quotes, dashes, ellipsis, and common symbols. No peer dependencies required.

## Usage

```typescript
import { parse } from 'comark'
import punctuation from 'comark/plugins/punctuation'

const result = await parse('"Hello" -- world... (c)', {
  plugins: [punctuation()]
})
// nodes: [ [ 'p', {}, '“Hello” – world… ©' ] ]
```

With framework components:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Comark } from '@comark/vue'
import punctuation from '@comark/vue/plugins/punctuation'
</script>

<template>
  <Comark :plugins="[punctuation()]">{{ content }}</Comark>
</template>
```

```tsx [React]
import { Comark } from '@comark/react'
import punctuation from '@comark/react/plugins/punctuation'

<Comark plugins={[punctuation()]}>{content}</Comark>
```

```svelte [Svelte]
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import punctuation from '@comark/svelte/plugins/punctuation'
</script>

<Comark {content} plugins={[punctuation()]} />
```

::

---

## Features

### Smart Quotes

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

### Code Preservation

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

- `options?` - Optional configuration — see [Options](#options)

**Returns:** `ComarkPlugin`

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`quotes`](#code-quotes) | `boolean` | `true` | Convert straight quotes to smart quotes |
| [`dashes`](#code-dashes) | `boolean` | `true` | Convert `--` to en-dash and `---` to em-dash |
| [`ellipsis`](#code-ellipsis) | `boolean` | `true` | Convert `...` to ellipsis character |
| [`symbols`](#code-symbols) | `boolean` | `true` | Convert `(c)`, `(r)`, `(tm)`, `+-` |

### `quotes`

Convert straight quotes (`"..."` and `'...'`) to typographic curly quotes.

```typescript
punctuation({ quotes: false }) // disable smart quotes only
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
