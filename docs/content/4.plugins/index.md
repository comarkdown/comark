---
title: Plugins
description: Extend Comark with plugins for syntax highlighting, emoji, table of contents, math, and diagrams, or reuse existing markdown-it plugins.
navigation: false
---

Comark has two compatible extension layers. Comark plugins can transform source, tokens, the parsed document, or rendered output through typed lifecycle hooks. You can also reuse parser plugins written for markdown-it through Comark's markdown-exit foundation.

All Comark plugins are part of the core `comark` package, while optional rendering dependencies are installed only when you use them.

## Default plugins

These plugins are **enabled by default** whenever you call `parseMarkdown()` or `createMarkdownParser()` (or a framework `<Markdown>` component). You do not need to install or register them.

::card-group{cols="2"}
  ::card{icon="i-lucide-file-spreadsheet" title="Frontmatter" to="/plugins/defaults/frontmatter"}
  Parse a leading YAML frontmatter block into `tree.frontmatter`
  ::

  ::card{icon="i-lucide-code-xml" title="HTML" to="/plugins/defaults/html"}
  Parse embedded HTML tags into Comark AST nodes
  ::

  ::card{icon="i-lucide-bell" title="Alerts" to="/plugins/defaults/alert"}
  Transform GitHub-style `> [!NOTE]` blockquotes
  ::

  ::card{icon="i-lucide-check-square" title="Task List" to="/plugins/defaults/task-list"}
  Interactive `[ ]` / `[x]` checkboxes
  ::

  ::card{icon="i-lucide-component" title="Components" to="/plugins/defaults/components"}
  Block/inline components and spans (`::name`, `:name`, `[text]`)
  ::

  ::card{icon="i-lucide-tag" title="Attributes" to="/plugins/defaults/attributes"}
  Inline attributes (`{props}` after tokens)
  ::
::

### Disable default plugins

Turn them all off with `registerDefaultPlugins: false`:

```typescript
import { parseMarkdown } from 'comark'

// Plain markdown only — no components, attributes, HTML, alerts, or task lists
const result = await parseMarkdown(content, {
  registerDefaultPlugins: false,
})
```

Opt back into specific defaults via `plugins`:

```typescript
import { parseMarkdown } from 'comark'
import components from 'comark/plugins/components'
import attributes from 'comark/plugins/attributes'

const result = await parseMarkdown(content, {
  registerDefaultPlugins: false,
  plugins: [components(), attributes()],
})
```

See also the [`registerDefaultPlugins` option](/api/parse#options) on the Parse API.

## Plugins

Optional plugins you register via `plugins: [...]`.

::card-group{cols="2"}
  ::card{icon="i-lucide-replace" title="Binding" to="/plugins/built-in/binding"}
  Interpolate frontmatter, runtime data, or parent props with `{{ path || default }}` shorthand
  ::

  ::card{icon="i-lucide-corner-down-left" title="Breaks" to="/plugins/built-in/breaks"}
  Convert soft line breaks directly into `:br` components
  ::

  ::card{icon="i-lucide-smile" title="Emoji" to="/plugins/built-in/emoji"}
  Convert emoji shortcodes like `:smile:` into emoji characters
  ::

  ::card{icon="i-lucide-footprints" title="Footnotes" to="/plugins/built-in/footnotes"}
  Plugin for adding footnote references and definitions to your Comark documents.
  ::

  ::card{icon="i-lucide-heading" title="Headings" to="/plugins/built-in/headings"}
  Plugin for extracting the page title and description from document content.
  ::

  ::card{icon="i-lucide-braces" title="JSON Render" to="/plugins/built-in/json-render"}
  Transform JSON Render specs into UI components using `json-render` or `yaml-render` code blocks
  ::

  ::card{icon="i-lucide-calculator" title="Mathematics" to="/plugins/built-in/math"}
  Render LaTeX math formulas using KaTeX with inline and display equations
  ::

  ::card{icon="i-simple-icons-mermaid" title="Mermaid Diagrams" to="/plugins/built-in/mermaid"}
  Create diagrams and visualizations using Mermaid syntax in code blocks
  ::

  ::card{icon="i-lucide-quote" title="Punctuation" to="/plugins/built-in/punctuation"}
  Convert plain-text punctuation into typographically correct Unicode characters
  ::

  ::card{icon="i-lucide-shield-check" title="Security" to="/plugins/built-in/security"}
  Sanitize markdown by removing dangerous HTML elements and attributes
  ::

  ::card{icon="i-lucide-file-text" title="Summary Extraction" to="/plugins/built-in/summary"}
  Extract content summaries using `<!-- more -->` delimiter
  ::

  ::card{icon="i-lucide-code" title="Shiki" to="/plugins/built-in/shiki"}
  Beautiful code syntax highlighting using Shiki with multi-theme support
  ::

  ::card{icon="i-lucide-zap" title="Rangi" to="/plugins/built-in/rangi"}
  Lightweight highlighting via rangi (~13kB all-in, dual themes)
  ::

  ::card{icon="i-lucide-list" title="Table of Contents" to="/plugins/built-in/toc"}
  Generate hierarchical TOC from headings automatically
  ::

::

## Guides

::card-group{cols="2"}
  ::card{icon="i-lucide-wrench" title="Plugin API" to="/plugins/custom/plugin-api"}
  Define plugins with the ComarkPlugin interface and lifecycle hooks
  ::

  ::card{icon="i-lucide-git-branch" title="AST API" to="/plugins/custom/ast-api"}
  Traverse and transform the MarkdownDocument AST using the visit() utility
  ::

  ::card{icon="i-simple-icons-markdown" title="Markdown-it Plugins" to="/plugins/custom/markdown-it"}
  Use existing markdown-it plugins or create new parser syntax rules
  ::
::

## Use Plugins

Pass plugins to `parseMarkdown()` or the `<Markdown>` component:

::code-group

```typescript [Parse API]
import { parseMarkdown } from 'comark'
import emoji from 'comark/plugins/emoji'
import toc from 'comark/plugins/toc'

const result = await parseMarkdown(content, {
  plugins: [
    emoji(),
    toc({ depth: 3 })
  ]
})
```

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import emoji from '@comark/vue/plugins/emoji'
</script>

<template>
  <Markdown :plugins="[emoji()]">{{ content }}</Markdown>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import emoji from '@comark/react/plugins/emoji'

<Markdown plugins={[emoji()]}>{content}</Markdown>
```

```svelte [Svelte]
<script>
  import { Markdown } from '@comark/svelte'
  import emoji from '@comark/svelte/plugins/emoji'
  let content = '# Awesome'
</script>

<Markdown value={content} plugins={[emoji()]} />
```


::
