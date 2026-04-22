---
title: Plugins
description: Extend Comark with powerful plugins for syntax highlighting, emojis, table of contents, math equations, diagrams, and more.
navigation: false
---

Comark's plugin system extends markdown functionality with specialized features. All plugins are part of the core `comark` package.

## Plugins

::card-group{cols="2"}
  ::card{icon="i-lucide-shield-check" title="Security" to="/plugins/built-in/security"}
  Sanitize markdown by removing dangerous HTML elements and attributes
  ::

  ::card{icon="i-lucide-smile" title="Emoji" to="/plugins/built-in/emoji"}
  Convert emoji shortcodes like `:smile:` into emoji characters
  ::

  ::card{icon="i-lucide-code" title="Syntax Highlighting" to="/plugins/built-in/highlight"}
  Beautiful code syntax highlighting using Shiki with multi-theme support
  ::

  ::card{icon="i-lucide-file-text" title="Summary" to="/plugins/built-in/summary"}
  Extract content summaries using `<!-- more -->` delimiter
  ::

  ::card{icon="i-lucide-list" title="Table of Contents" to="/plugins/built-in/toc"}
  Generate hierarchical TOC from headings automatically
  ::

  ::card{icon="i-lucide-bell" title="Alerts" to="/plugins/built-in/alert"}
  Render GitHub-style alert blockquotes with icons and colors
  ::

  ::card{icon="i-lucide-check-square" title="Task List" to="/plugins/built-in/task-list"}
  Render interactive checkboxes from `[ ]` and `[x]` list syntax
  ::

  ::card{icon="i-simple-icons-mermaid" title="Mermaid" to="/plugins/built-in/mermaid"}
  Create diagrams and visualizations using Mermaid syntax in code blocks
  ::

  ::card{icon="i-lucide-calculator" title="Math" to="/plugins/built-in/math"}
  Render LaTeX math formulas using KaTeX with inline and display equations
  ::

  ::card{icon="i-lucide-braces" title="JSON Render" to="/plugins/built-in/json-render"}
  Transform JSON Render specs into UI components using `json-render` or `yaml-render` code blocks
  ::

  ::card{icon="i-lucide-quote" title="Punctuation" to="/plugins/built-in/punctuation"}
  Convert plain-text punctuation into typographically correct Unicode characters
  ::

  ::card{icon="i-lucide-corner-down-left" title="Breaks" to="/plugins/built-in/breaks"}
  Convert soft line breaks directly into `:br` components
  ::
  
  ::card{icon="i-lucide-replace" title="Binding" to="/plugins/built-in/binding"}
  Interpolate frontmatter, runtime data, or parent props with `{{ path || default }}` shorthand
  ::
::

## Guides

::card-group{cols="2"}
  ::card{icon="i-lucide-wrench" title="Plugin API" to="/plugins/custom/plugin-api"}
  Define plugins with the ComarkPlugin interface and lifecycle hooks
  ::

  ::card{icon="i-simple-icons-markdown" title="Markdown-it Plugins" to="/plugins/custom/markdown-it"}
  Use existing markdown-it plugins or create new parser syntax rules
  ::

  ::card{icon="i-lucide-git-branch" title="AST API" to="/plugins/custom/ast-api"}
  Traverse and transform the ComarkTree AST using the visit() utility
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
<script setup lang="ts">
import { Comark } from '@comark/vue'
import emoji from '@comark/vue/plugins/emoji'
</script>

<template>
  <Comark :plugins="[emoji()]">{{ content }}</Comark>
</template>
```

```tsx [React]
import { Comark } from '@comark/react'
import emoji from '@comark/react/plugins/emoji'

<Comark plugins={[emoji()]}>{content}</Comark>
```

```svelte [Svelte]
<script>
  import { Comark } from '@comark/svelte'
  import emoji from '@comark/svelte/plugins/emoji'
  let content = '# Awesome'
</script>

<Comark markdown={content} plugins={[emoji()]} />
```


::
