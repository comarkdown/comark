---
title: Linkify
description: Plugin for converting URL-like text into links.
seo:
  title: Linkify Plugin
navigation:
  icon: i-lucide-link
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /reference/parse
    color: neutral
    variant: soft
---

The `comark/plugins/linkify` plugin converts URLs such as `https://comark.dev` and emails such as `hi@comark.dev` into links, using [linkify-it](https://github.com/markdown-it/linkify-it). Domains without a scheme, such as `www.example.com`, are linked only with [`fuzzyLink`](#options).

The plugin is **enabled by default** via `registerDefaultPlugins`. No installation or registration required.

```typescript
import { parseMarkdown } from 'comark'

await parseMarkdown('Read https://comark.dev')
```

Explicit registration is only needed when default plugins are disabled, or with `comark/core`. List it before markdown-it plugins that call `md.linkify.add()`:

```typescript
import { parseMarkdown } from 'comark'
import linkify from 'comark/plugins/linkify'
import components from 'comark/plugins/components'

const result = await parseMarkdown(content, {
  registerDefaultPlugins: false,
  plugins: [linkify(), components()],
})
```

## Options

`linkify()` accepts linkify-it's recognition options. Pass a configured `linkify()` in `plugins` to replace the default:

```typescript
import { parseMarkdown } from 'comark'
import linkify from 'comark/plugins/linkify'

await parseMarkdown('Visit www.example.com', {
  plugins: [linkify({ fuzzyLink: true })],
})
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `fuzzyLink` | `boolean` | `false` | Link domains without a scheme, such as `www.example.com` or `example.com`. Slower on long text |
| `fuzzyEmail` | `boolean` | `true` | Link emails without `mailto:` |
| `fuzzyIP` | `boolean` | `false` | Allow IP addresses in fuzzy links. Can match version numbers |
| `urlAuth` | `boolean` | `false` | Link URLs that contain credentials, such as `https://user:pass@example.com` |
| `tlds` | `string[]` | linkify-it's list | Top-level domains allowed in fuzzy links. Replaces the default list |
| `maxLength` | `number` | `10000` | Maximum link length |
| `'---'` | `boolean` | `false` | End a link at `---`, treating it as a long dash |

::note
Before linkify-it 6, Comark linked `www.example.com` and `user:pass@` URLs by default. Pass `linkify({ fuzzyLink: true, urlAuth: true })` to keep that behavior.
::

::warning
The `linkify` parser option is **deprecated**. It logs a warning and will be removed in a future major version. Replace `linkify: false` with `registerDefaultPlugins: false`, then register only the default plugins you need.
::
