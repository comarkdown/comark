---
title: Plugins
description: Extend Comark with plugins for syntax highlighting, emoji, table of contents, math, and diagrams, or reuse existing markdown-it plugins.
navigation: false
---

Comark has two compatible extension layers. Comark plugins can transform source text, tokens, the parsed document, or rendered output through typed lifecycle hooks. You can also reuse parser plugins written for markdown-it through markdown-exit, Comark's markdown-it-compatible parser.

All built-in plugins ship in the core `comark` package. You install optional peer dependencies only for the plugins you use.

## Default plugins

These plugins are **enabled by default** whenever you call `parseMarkdown()`, `createMarkdownParser()`, or a framework `<Markdown>` component. You don't need to install or register them.

::card-group{cols="2"}
  ::card{icon="i-lucide-link" title="Linkify" to="/plugins/defaults/linkify"}
  Convert URLs and email addresses into links
  ::

  ::card{icon="i-lucide-file-spreadsheet" title="Frontmatter" to="/plugins/defaults/frontmatter"}
  Parse a leading YAML frontmatter block into `tree.frontmatter`
  ::

  ::card{icon="i-lucide-code-xml" title="HTML" to="/plugins/defaults/html"}
  Parse embedded HTML tags into Comark AST nodes
  ::

  ::card{icon="i-lucide-bell" title="Alerts" to="/plugins/defaults/alert"}
  Transform GitHub-style `> [!NOTE]` blockquotes
  ::

  ::card{icon="i-lucide-check-square" title="Task list" to="/plugins/defaults/task-list"}
  Render GitHub-style `[ ]` and `[x]` checkboxes
  ::

  ::card{icon="i-lucide-component" title="Components" to="/plugins/defaults/components"}
  Parse block and inline components and spans (`::name`, `:name`, `[text]`)
  ::

  ::card{icon="i-lucide-tag" title="Attributes" to="/plugins/defaults/attributes"}
  Parse inline attributes (`{props}` after tokens)
  ::
::

::callout{icon="i-lucide-lightbulb"}
Default plugins run in the order shown above. Plugins you pass through `plugins` run afterward in the order you provide them. If an explicit plugin has the same `name` as a default plugin, it replaces that default and runs in its explicit position. If you provide the same explicit plugin name more than once, only the first instance runs.
::

### Disable default plugins

Turn them all off with `registerDefaultPlugins: false`:

```typescript
import { parseMarkdown } from 'comark'

// Plain Markdown only, with no autolinks, components, attributes, HTML, alerts, or task lists
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

See the [`registerDefaultPlugins` and `plugins` options](/reference/parse#options) on the Parse API.

## Plugins

Register optional plugins through the `plugins` option.

::card-group{cols="2"}
  ::card{icon="i-lucide-replace" title="Binding" to="/plugins/built-in/binding"}
  Interpolate frontmatter, runtime data, or parent props with `{{ path || default }}` and `::if`
  ::

  ::card{icon="i-lucide-corner-down-left" title="Breaks" to="/plugins/built-in/breaks"}
  Convert soft line breaks into `<br>` elements
  ::

  ::card{icon="i-lucide-smile" title="Emoji" to="/plugins/built-in/emoji"}
  Convert emoji shortcodes such as `:smile:` into emoji characters
  ::

  ::card{icon="i-lucide-external-link" title="External links" to="/plugins/built-in/external-links"}
  Add `rel="nofollow"` and an optional `target` to external links
  ::

  ::card{icon="i-lucide-footprints" title="Footnotes" to="/plugins/built-in/footnotes"}
  Add footnote references, numbered definitions, and back-links
  ::

  ::card{icon="i-lucide-hash" title="Heading links" to="/plugins/built-in/heading-links"}
  Link headings to themselves using their `id`
  ::

  ::card{icon="i-lucide-heading" title="Title and description" to="/plugins/built-in/title-description"}
  Extract the page title and description from document content
  ::

  ::card{icon="i-lucide-braces" title="JSON Render" to="/plugins/built-in/json-render"}
  Render JSON Render specs as UI components from `json-render` or `yaml-render` code blocks
  ::

  ::card{icon="i-lucide-calculator" title="Mathematics" to="/plugins/built-in/math"}
  Render inline and display LaTeX math formulas with KaTeX
  ::

  ::card{icon="i-simple-icons-mermaid" title="Mermaid diagrams" to="/plugins/built-in/mermaid"}
  Render diagrams from `mermaid` code blocks
  ::

  ::card{icon="i-lucide-quote" title="Punctuation" to="/plugins/built-in/punctuation"}
  Convert plain-text quotes, dashes, and symbols into typographic Unicode characters
  ::

  ::card{icon="i-lucide-shield-check" title="Security" to="/plugins/built-in/security"}
  Sanitize Markdown by stripping dangerous HTML tags, attributes, and URLs
  ::

  ::card{icon="i-lucide-file-text" title="Summary extraction" to="/plugins/built-in/summary"}
  Extract content excerpts before a `<!-- more -->` comment
  ::

  ::card{icon="i-lucide-code" title="Shiki" to="/plugins/built-in/shiki"}
  Highlight code blocks and inline code with Shiki themes and transformers
  ::

  ::card{icon="i-lucide-zap" title="Rangi" to="/plugins/built-in/rangi"}
  Highlight code with Rangi (~13 kB with all languages, dual themes)
  ::

  ::card{icon="i-lucide-list" title="Table of contents" to="/plugins/built-in/toc"}
  Build a nested table of contents from document headings
  ::

::

## Guides

::card-group{cols="2"}
  ::card{icon="i-lucide-wrench" title="Plugin API" to="/plugins/custom/plugin-api"}
  Define plugins with `defineComarkPlugin` and `pre`/`post` lifecycle hooks
  ::

  ::card{icon="i-lucide-git-branch" title="AST API" to="/plugins/custom/ast-api"}
  Traverse and transform `MarkdownDocument` nodes with `visit()`
  ::

  ::card{icon="i-simple-icons-markdown" title="Markdown-it plugins" to="/plugins/custom/markdown-it"}
  Reuse existing markdown-it plugins or write custom parser syntax rules
  ::
::

## Use plugins

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
