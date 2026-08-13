---
title: HTML
description: Built-in plugin that parses embedded HTML tags into Comark AST nodes.
seo:
  title: HTML Plugin
navigation:
  icon: i-lucide-code-xml
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

The `comark/plugins/html` plugin enables embedded HTML block and inline tags in Comark/markdown content. Tags are tokenized and converted into AST nodes that can be mixed with Comark components and markdown syntax.

The plugin is **enabled by default** via `registerDefaultPlugins`. No installation or registration required.

## Usage

```mdc
<div class="note">
  ::alert{type="info"}
  Hello <strong class="text-red-500">world</strong>
  ::
</div>
```

```typescript
import { parseMarkdown } from 'comark'

const result = await parseMarkdown(`
<strong class="bold">Hello</strong> _world_
`)
// → [
//     ['p', {},
//       ['strong', { class: 'bold', $: { html: 1, block: 0 } }, 'Hello'],
//       ' ',
//       ['em', {}, 'world']
//     ]
//   ]
```

### Explicit registration

When default plugins are off, opt in with the plugin directly:

```typescript
import { parseMarkdown } from 'comark'
import html from 'comark/plugins/html'

const result = await parseMarkdown(content, {
  registerDefaultPlugins: false,
  plugins: [html()],
})
```

### Disable HTML parsing

Turn off all defaults (including HTML) so tags are treated as plain text:

```typescript
const result = await parseMarkdown(content, { registerDefaultPlugins: false })
```

::note
`ParserOptions.html` is **deprecated** and logs a warning. Prefer `registerDefaultPlugins: false` (and register `html()` only when you need it). `html: false` still skips the default html plugin for compatibility.
::

## How it works

The plugin:

1. Calls `md.set({ html: true })` so markdown-exit's built-in HTML gates are open
2. Registers Comark's HTML block and inline ruler rules (`comark_html_block`, `comark_html_inline`)
3. Leaves token → AST conversion to the core token processor (`htmlparser2`)

HTML nodes are marked with `$: { html: 1, block: 0 | 1 }` so renderers can distinguish them from markdown-originated elements.
