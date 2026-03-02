---
title: Plugins
description: Extend Comark with powerful plugins for syntax highlighting, emojis, table of contents, math equations, diagrams, and more.
---

Comark's plugin system extends markdown functionality with specialized features. Plugins can add new syntax, transform content, or enhance rendering.

## Core Plugins

Core plugins are built-in and part of the main `comark` package:

::card-group{cols="2"}
  ::card{icon="i-lucide-code" title="Syntax Highlighting" to="/plugins/core/highlight"}
  Beautiful code syntax highlighting using Shiki with multi-theme support
  ::

  ::card{icon="i-lucide-smile" title="Emoji" to="/plugins/core/emoji"}
  Convert emoji shortcodes like `:smile:` into emoji characters
  ::

  ::card{icon="i-lucide-list" title="Table of Contents" to="/plugins/core/toc"}
  Generate hierarchical TOC from headings automatically
  ::

  ::card{icon="i-lucide-file-text" title="Summary" to="/plugins/core/summary"}
  Extract content summaries using `<!-- more -->` delimiter
  ::

  ::card{icon="i-lucide-shield-check" title="Security" to="/plugins/core/security"}
  Sanitize markdown by removing dangerous HTML elements and attributes
  ::
::

## External Plugins

External plugins are separate packages that extend Comark with specialized features:

::card-group{cols="2"}
  ::card{icon="i-lucide-calculator" title="Math" to="/plugins/external/math"}
  Render LaTeX math formulas using KaTeX with inline and display equations
  ::

  ::card{icon="i-simple-icons-mermaid" title="Mermaid" to="/plugins/external/mermaid"}
  Create diagrams and visualizations using Mermaid syntax in code blocks
  ::

  ::card{icon="i-lucide-languages" title="CJK Language" to="/plugins/external/cjk"}
  Optimized text handling for Chinese, Japanese, and Korean languages
  ::
::

## Use Plugins

Pass plugins to `parse()` or the `<Comark>` component:

::code-group

```typescript [Parse API]
import { parse } from 'comark'
import emoji from 'comark/plugins/emoji'
import toc from 'comark/plugins/toc'

const result = await parse(content, {
  plugins: [
    emoji(),
    toc({ depth: 3 })
  ]
})
```

```vue [Vue]
<script setup>
import { Comark } from 'comark/vue'
import emoji from 'comark/plugins/emoji'
</script>

<template>
  <Comark :plugins="[emoji()]">{{ content }}</Comark>
</template>
```

```tsx [React]
import { Comark } from 'comark/react'
import emoji from 'comark/plugins/emoji'

<Comark plugins={[emoji()]}>{content}</Comark>
```

::
