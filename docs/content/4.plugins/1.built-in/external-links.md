---
title: External Links
description: Plugin for adding a rel attribute to external links.
seo:
  title: External Links Plugin
navigation:
  icon: i-lucide-external-link
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /reference/parse
    color: neutral
    variant: soft
  - label: Document Model
    icon: i-lucide-braces
    to: /getting-started/document-model
    color: neutral
    variant: soft
---

The `comark/plugins/external-links` plugin adds `rel="nofollow"` to external links, which tells search engines not to pass ranking to the sites you link to.

The `rel` is added to the document tree, so the HTML, Vue, React, Svelte, and Angular renderers output it without a custom link component.

## Usage

```typescript
import { parseMarkdown } from 'comark'
import externalLinks from 'comark/plugins/external-links'

const result = await parseMarkdown('[Nuxt](https://nuxt.com)', {
  plugins: [externalLinks()]
})
```

```html [Output]
<p><a href="https://nuxt.com" rel="nofollow">Nuxt</a></p>
```

---

## API

### `externalLinks(options?)`

Returns a `ComarkPlugin` that adds a `rel` to external links.

**Parameters:**

- `options?` - Optional configuration, see [Options](#options)

**Returns:** `ComarkPlugin`

A link is external when its `href` starts with `http://` or `https://`. This covers Markdown links, autolinks, bare URLs, and HTML `<a>` tags. Links that already have a `rel` or a bound `:rel`, such as `[Nuxt](https://nuxt.com){rel="sponsored"}`, are left unchanged.

The added value is recorded in the tree as `$.autoRel`. Renderers don't output `$`, and Markdown output leaves out a `rel` that still has this value. A tree parsed with this plugin can be saved back to Markdown unchanged, while a `rel` the author wrote is kept.

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`rel`](#rel) | `string` | `'nofollow'` | `rel` added to external links |

### `rel`

`rel` added to external links that don't set one.

```typescript
externalLinks({ rel: 'nofollow noopener' })
```

```html [Output]
<p><a href="https://nuxt.com" rel="nofollow noopener">Nuxt</a></p>
```

**Default:** `'nofollow'`
