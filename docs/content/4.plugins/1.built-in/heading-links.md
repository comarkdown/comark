---
title: Heading Links
description: Plugin for linking headings to themselves using their id.
seo:
  title: Heading Links Plugin
navigation:
  icon: i-lucide-hash
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

The `comark/plugins/heading-links` plugin links each heading to itself, using the `id` the parser gives every heading. Readers can click a heading to get a link to that section.

The links are added to the document tree, so every renderer outputs them without a custom heading component. Headings inside components are linked too.

## Usage

```typescript
import { parseMarkdown } from 'comark'
import headingLinks from 'comark/plugins/heading-links'

const result = await parseMarkdown('## Setup', {
  plugins: [headingLinks()]
})
```

```html [Output]
<h2 id="setup"><a href="#setup">Setup</a></h2>
```

---

## API

### `headingLinks(options?)`

Returns a `ComarkPlugin` that adds a link to each matching heading.

**Parameters:**

- `options?` - Optional configuration, see [Options](#options)

**Returns:** `ComarkPlugin`

Headings without an `id` are left unchanged. With the `'wrap'` behavior, headings that already contain a link are also left unchanged, since links cannot be nested.

Added links are marked in the tree with `$.permalink`: `'wrap'` for a link around the heading text, `'separate'` for a link before or after it. Renderers don't output `$`, and the marker has two uses:

- Markdown output leaves the links out, so a tree parsed with this plugin can be saved back to Markdown unchanged.
- `toc` and `title-description` leave a `'separate'` link out of heading text. Code of your own that reads heading text can do the same.

::warning
Don't combine this plugin with heading components that already add a link at render time, such as Nuxt UI's `ProseH2`. The plugin can't see those components, so each heading would end up with two nested links.
::

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`tags`](#tags) | `string[]` | `['h2', 'h3', 'h4']` | Heading tags that get a link |
| [`behavior`](#behavior) | `'wrap' \| 'prepend' \| 'append'` | `'wrap'` | Where the link goes |
| [`content`](#content) | `Node[]` | `['#']` | Link content for `'prepend'` and `'append'` |
| [`props`](#props) | `Record<string, unknown>` | `{}` | Extra props for the link |

### `tags`

Heading tags that get a link.

```typescript
headingLinks({ tags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }) // link every heading level
```

**Default:** `['h2', 'h3', 'h4']`

### `behavior`

Where the link goes:

- `'wrap'`: the link wraps the heading content.
- `'prepend'`: a separate link is inserted before the heading content.
- `'append'`: a separate link is inserted after the heading content.

```typescript
headingLinks({ behavior: 'prepend' })
```

```html [Output]
<h2 id="setup"><a href="#setup">#</a>Setup</h2>
```


**Default:** `'wrap'`

### `content`

Content of the link for `'prepend'` and `'append'`, as Comark nodes. Ignored for `'wrap'`.

```typescript
headingLinks({
  behavior: 'append',
  content: [['span', { class: 'icon-link' }]],
  props: { 'aria-label': 'Link to this section' },
})
```

```html [Output]
<h2 id="setup">Setup<a aria-label="Link to this section" href="#setup"><span class="icon-link"></span></a></h2>
```

**Default:** `['#']`

### `props`

Extra props for the link. `href` is always set from the heading `id`.

```typescript
headingLinks({ behavior: 'prepend', props: { class: 'heading-link' } })
```

**Default:** `{}`

---

## Examples

### Show the link on hover

Add a class to a separate `#` link, then show it only when the heading is hovered or the link has keyboard focus:

```typescript
headingLinks({ behavior: 'prepend', props: { class: 'heading-link' } })
```

```css
.heading-link {
  margin-inline-end: 0.25em;
  opacity: 0;
}

:is(h2, h3, h4):hover .heading-link,
.heading-link:focus-visible {
  opacity: 1;
}
```

### With the table of contents

`toc` and `title-description` leave a separate `prepend` or `append` link out of heading text, so the plugins work in any order:

```typescript
import headingLinks from 'comark/plugins/heading-links'
import toc from 'comark/plugins/toc'

const result = await parseMarkdown(content, {
  plugins: [headingLinks(), toc()]
})
```
