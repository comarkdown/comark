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
    to: /api/parse
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/html` plugin enables embedded HTML block and inline tags in Comark/markdown content. Tags are tokenized and converted into AST nodes that can be mixed with Comark components and markdown syntax.

The plugin is **enabled by default** via `registerDefaultPlugins` (and the `html` parse option). No installation or registration required.

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

Treat HTML tags as plain text while keeping other defaults:

```typescript
const result = await parseMarkdown(content, { html: false })
```

Or disable via the plugin option (overrides the default `html` plugin by name):

```typescript
import html from 'comark/plugins/html'

const result = await parseMarkdown(content, {
  plugins: [html({ enabled: false })],
})
```

Disable all defaults (including HTML):

```typescript
const result = await parseMarkdown(content, { registerDefaultPlugins: false })
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | When `false`, registers no markdown-it rules (no-op plugin) |

## How it works

The plugin:

1. Calls `md.set({ html: true })` so markdown-exit's built-in HTML gates are open
2. Registers Comark's HTML block and inline ruler rules (`comark_html_block`, `comark_html_inline`)
3. Leaves token → AST conversion to the core token processor (`htmlparser2`)

HTML nodes are marked with `$: { html: 1, block: 0 | 1 }` so renderers can distinguish them from markdown-originated elements.
