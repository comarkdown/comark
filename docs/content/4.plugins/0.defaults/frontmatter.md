---
title: Frontmatter
description: Built-in plugin that parses a leading YAML frontmatter block into tree.frontmatter.
seo:
  title: Frontmatter Plugin
navigation:
  icon: i-lucide-file-spreadsheet
links:
  - label: Frontmatter syntax
    icon: i-lucide-file-text
    to: /syntax/frontmatter
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/frontmatter` plugin extracts a leading YAML frontmatter block (`---`) into `tree.frontmatter` and removes it from the Markdown body before tokenization.

This plugin is **enabled by default** via `registerDefaultPlugins`, so you don't need to install or register it.

## Usage

```mdc
---
title: Hello World
description: A sample document
---

# Hello World
```

```typescript
import { parseMarkdown } from 'comark'

const result = await parseMarkdown(`---
title: Hello World
---

# Hello World
`)

console.log(result.frontmatter)
// → { title: 'Hello World' }

console.log(result.nodes)
// → [ ['h1', { id: 'hello-world' }, 'Hello World'] ]
```

### Explicit registration

When you disable default plugins, pass `frontmatter()` explicitly:

```typescript
import { parseMarkdown } from 'comark'
import frontmatter from 'comark/plugins/frontmatter'

const result = await parseMarkdown(content, {
  registerDefaultPlugins: false,
  plugins: [frontmatter()],
})
```

### Disable frontmatter parsing

Turn off all defaults (including frontmatter) so the `---` block is treated as regular Markdown:

```typescript
const result = await parseMarkdown(content, { registerDefaultPlugins: false })
// result.frontmatter → {}
```

## How it works

In the `pre` hook (before markdown-exit tokenization), the plugin:

1. Detects a leading `---` ... `---` block via `parseFrontmatter`.
2. Parses the YAML body into `state.frontmatter`.
3. Strips the frontmatter from `state.markdown`.
4. Adjusts `state.parsedLines` so later nodes get accurate line numbers.

The core parser then copies `state.frontmatter` onto `tree.frontmatter`.
