---
title: External Links
description: Plugin for adding rel and target attributes to external links.
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
  - label: Document model
    icon: i-lucide-braces
    to: /getting-started/document-model
    color: neutral
    variant: soft
---

The `comark/plugins/external-links` plugin adds `rel="nofollow"` to external links, which tells search engines not to pass ranking to the sites you link to.

It can also add a `target`, such as `_blank`, to open them in a new tab. Both are added to the document tree, so the HTML, Vue, React, Svelte, and Angular renderers output them without a custom link component.

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

Returns a `ComarkPlugin` that adds a `rel`, and optionally a `target`, to external links.

**Parameters:**

- `options?`: optional configuration; see [Options](#options)

**Returns:** `ComarkPlugin`

A link is external when its `href` starts with `http://`, `https://`, or `//`. This covers Markdown links, autolinks, bare URLs, and HTML `<a>` tags. A `rel` or `target` the link already has, written or bound (`:rel`, `:target`), is kept, such as in `[Nuxt](https://nuxt.com){rel="sponsored"}`.

Added values are recorded in the tree as `$.autoRel` and `$.autoTarget`. Renderers don't output `$`, and Markdown output leaves out a `rel` or `target` that still has its added value. A tree parsed with this plugin can be saved back to Markdown unchanged, while the values the author wrote are kept.

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`rel`](#rel) | `string` | `'nofollow'` | `rel` added to external links |
| [`target`](#target) | `string` | - | `target` added to external links |

### `rel`

`rel` added to external links that don't set one.

```typescript
externalLinks({ rel: 'nofollow noopener' })
```

```html [Output]
<p><a href="https://nuxt.com" rel="nofollow noopener">Nuxt</a></p>
```

**Default:** `'nofollow'`, or `'nofollow noopener noreferrer'` on links that open a new tab

### `target`

`target` added to external links that don't set one. Not set by default, so links open in the same tab.

```typescript
externalLinks({ target: '_blank' })
```

```html [Output]
<p><a href="https://nuxt.com" rel="nofollow noopener noreferrer" target="_blank">Nuxt</a></p>
```

On a link that opens a new tab, from this option or a `target` the author wrote, the default `rel` adds `noopener` and `noreferrer`. The opened page can't reach your page through `window.opener` and doesn't receive it as the referrer. If you set [`rel`](#rel) yourself, include them.

**Default:** none
