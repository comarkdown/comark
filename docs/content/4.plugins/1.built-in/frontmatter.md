---
title: Frontmatter
description: Built-in plugin that parses a leading YAML frontmatter block into tree.frontmatter.
seo:
  title: Frontmatter Plugin
navigation:
  icon: i-lucide-file-spreadsheet
links:
  - label: Frontmatter Syntax
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

The `comark/plugins/frontmatter` plugin extracts a leading YAML frontmatter block (`---`) into `tree.frontmatter` and removes it from the markdown body before tokenization.

The plugin is **enabled by default** via `registerDefaultPlugins`. No installation or registration required.

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

When default plugins are off, opt in with the plugin directly:

```typescript
import { parseMarkdown } from 'comark'
import frontmatter from 'comark/plugins/frontmatter'

const result = await parseMarkdown(content, {
  registerDefaultPlugins: false,
  plugins: [frontmatter()],
})
```

### Disable frontmatter parsing

Override the default plugin by name — the `---` block is treated as regular markdown (`hr` + content):

```typescript
import frontmatter from 'comark/plugins/frontmatter'

const result = await parseMarkdown(content, {
  plugins: [frontmatter({ enabled: false })],
})
```

Disable all defaults (including frontmatter):

```typescript
const result = await parseMarkdown(content, { registerDefaultPlugins: false })
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | When `false`, the plugin is a no-op (frontmatter left as markdown) |

## How it works

In the `pre` hook (before markdown-exit tokenization), the plugin:

1. Detects a leading `---` … `---` block via `parseFrontmatter`
2. Parses the YAML body into `state.frontmatter`
3. Strips the frontmatter from `state.markdown`
4. Adjusts `state.parsedLines` so later nodes get correct line numbers

The core parser then copies `state.frontmatter` onto `tree.frontmatter`.
