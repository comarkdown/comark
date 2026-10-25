---
title: 'Sanitize Markdown and Prevent XSS'
description: Sanitize the parsed AST by removing dangerous elements, blocking malicious protocols, and restricting link destinations.
navigation:
  title: Security
  icon: i-lucide-shield-check
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

The `comark/plugins/security` plugin sanitizes the parsed AST, removing dangerous HTML elements, blocking malicious protocols, and restricting allowed link destinations.

## Usage

```typescript
import { parseMarkdown } from 'comark'
import security from 'comark/plugins/security'

const result = await parseMarkdown(content, {
  plugins: [security()]
})
```

With framework components:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import security from '@comark/vue/plugins/security'

const plugins = [
  security({
    blockedTags: ['script', 'iframe'],
    allowedProtocols: ['https', 'mailto']
  })
]
</script>

<template>
  <Markdown :plugins="plugins">{{ content }}</Markdown>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import security from '@comark/react/plugins/security'

<Markdown plugins={[security({ blockedTags: ['script', 'iframe'] })]}>
  {content}
</Markdown>
```

::

---

## Features

Several sanitizations are applied automatically and cannot be disabled:

### Event handlers

All `on*` attributes are stripped regardless of case: `onclick`, `onerror`, `onload`, `onmouseover`, and any other `on*` attribute.

::code-group

```html [Input]
<div onclick="alert('XSS')">Click me</div>
<img src="x" onerror="alert('XSS')">
```

```html [Output]
<div>Click me</div>
<img src="x">
```

::

### Dangerous attributes

Attributes that can be abused regardless of value are always stripped:

| Attribute | Risk |
|---|---|
| `srcdoc` | Can contain arbitrary HTML |
| `formaction` | Can redirect form submissions |
| `innerHTML` | Injects raw HTML through framework renderers |
| `dangerouslySetInnerHTML` | Injects raw HTML through framework renderers |
| `textContent` | Overwrites an element's children |
| `*Html` / `*-html` (`labelHtml`, `description-html`, `v-html`, …) | Component props rendered as raw HTML (for example with `v-html`) |
| `attributeName` targeting `href` | SVG `<animate>` / `<set>` can rewrite a link to a script URL |

Prop names are normalized before these checks: case, binding prefixes (`:`, `v-bind:`), Vue's `.prop` / `^attr` prefixes (`.innerHTML`, `^onclick`), and `:` / `-` / `_` separators are ignored.

::note
Framework renderers (Vue, React, Svelte, Angular) never forward `innerHTML`, `dangerouslySetInnerHTML`, or `textContent` from document attributes, even without this plugin. Raw HTML has its own explicit path through the default `html` plugin.
::

### Nested props

Object and array prop values (`:links='[{"to": "/docs", "label": "Docs"}]'`, YAML props) are validated recursively: every nested key goes through the same checks as a top-level prop, so nested `on*` handlers, `*Html` keys, and unsafe URLs are removed at any depth while the rest of the value is kept. Array items are checked against the prop name that holds them.

### Protocol blocking

URL props are decoded (URL-encoded and HTML entity variants included) and checked against a hard-coded block list. A prop is a URL prop when its name is `href`, `src`, `to`, `action`, `poster`, `cite`, `background` or `ping`, or ends in `href`, `src`, `url`, `uri` or `link` (optionally plural), such as `xlink:href`, `imageUrl`, or `avatar-src`. Other props are never parsed as URLs, so prose such as `title="JavaScript: the good parts"` is kept.

These URLs are **always** blocked, even if `allowedProtocols: ['*']` is set:

- `javascript:` and `vbscript:` URLs
- `data:` URLs in link props (`href`, `to`, …)
- `data:` URLs in image props, unless their MIME type is `image/*` (see [`allowDataImages`](#options-allowdataimages))

A `data:` URL is checked the way browsers read its MIME type, which ignores spaces after `data:`. So `data: text/html,…` is blocked like `data:text/html,…`.

The same check applies to `:href` and `:src` bindings twice: on the JSON-decoded value at parse time, and again on the resolved value at render time, so bindings cannot smuggle an unsafe URL through frontmatter or other data sources.

::code-group

```html [Input]
<a href="javascript:alert('XSS')">Click</a>
<img src="data:text/html,<script>alert('XSS')</script>">
```

```html [Output]
<a>Click</a>
<img>
```

::

### Frontmatter

Renderers spread frontmatter into components, so it is sanitized with the same rules as props, at any depth:

- event handler and markup keys are removed, with the same name checks
- URLs in URL keys (`to`, `link`, `imageSrc`, …) are held to the protocol floor and the URL options
- an `as` or `is` value naming a blocked, unsafe or not-allowed tag is removed

Dropped array items are removed without leaving a hole. Set [`frontmatter: false`](#options-frontmatter) to opt out.

To apply the same rules to objects that don't come through the parser, such as a YAML or JSON file you load yourself, use `sanitizeData()` from `comark/utils`. It cleans the data in place and returns the dotted paths it removed:

```typescript
import { sanitizeData } from 'comark/utils'

const removed = sanitizeData(data, { blockedTags: ['script'], allowDataImages: false })
```

---

## API

### `security(options?)`

Returns a `ComarkPlugin` that sanitizes the parsed AST.

**Parameters:**

- `options?` - Optional configuration, see [Options](#options)

**Returns:** `ComarkPlugin`

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`blockedTags`](#options-blockedtags) | `string[]` | `[]` | Tag names to remove entirely from the AST |
| [`allowedTags`](#options-allowedtags) | `string[]` | `[]` | Tag names to allow exclusively in the AST |
| [`tagFallback`](#options-tagfallback) | `function` | `undefined`  | Defines how to handle unallowed tags in the AST |
| [`allowedProtocols`](#options-allowedprotocols) | `string[]` | `['*']` | Protocols permitted in URL props |
| [`allowedLinkPrefixes`](#options-allowedlinkprefixes) | `string[]` | `['*']` | URL prefixes permitted in link props (`href`, `to`, …) |
| [`allowedImagePrefixes`](#options-allowedimageprefixes) | `string[]` | `['*']` | URL prefixes permitted in image props (`src`, `*src`, `poster`) |
| [`defaultOrigin`](#options-defaultorigin) | `string` | `undefined` | Rewrite disallowed URLs to this origin instead of stripping |
| [`allowDataImages`](#options-allowdataimages) | `boolean` | `true` | Allow `data:image/*` URIs in image props |
| [`frontmatter`](#options-frontmatter) | `boolean` | `true` | Sanitize frontmatter as well as the AST |

### `blockedTags`

Tag names to completely remove from the AST. Matching is case-insensitive, so `SCRIPT`, `Script`, and `script` are all caught.

```typescript
security({
  blockedTags: ['script', 'iframe', 'object', 'embed', 'link', 'style']
})
```

| Tag | Risk |
|---|---|
| `script` | JavaScript execution |
| `iframe` | Loads external content |
| `object` | Embeds plugins or Flash |
| `embed` | Similar to `object` |
| `link` | Loads external stylesheets |
| `style` | CSS with `javascript:` expressions |
| `base` | Changes base URL for relative links |
| `meta` | HTTP refresh / redirect |

### `allowedTags`

Tag names to exclusively keep in the AST. Matching is case-insensitive, so, so `SPAN`, `Span`, and `span` are all caught.

```typescript
security({
  allowedTags: ['p', 'span', 'ul', 'li', 'ol', 'strong']
})
```

The `as` and `is` props (which make framework renderers resolve a different component than the element's own tag) are held to the same filters: a value naming a blocked or not-allowed tag, or `object`, is stripped, and the element falls back to its own tag.

Their bindings are checked too. A JSON binding (`:as='"section"'`) is checked decoded, as renderers decode it. A dot-path binding (`:as="frontmatter.tag"`) only resolves at render time, after every check, so it is always stripped.

### `tagFallback`

Defines the replacement strategy for tags that are filtered out because they are not present in the `allowedTags` (whitelist) or present in the `blockedTags` (blacklist).

```typescript
import { textContent } from 'comark/utils'

security({
  allowedTags: ['p', 'span'],
  tagFallback: (element: ElementNode) => {
    // Remove all tags and return the text content
    return textContent(element)
  }
})

```

### `allowedProtocols`

Restricts which URL protocols are permitted in [URL props](#protocol-blocking) (`href`, `src`, `to`, …). Use `['*']` to allow all protocols not already on the hard-coded block list.

```typescript
security({
  allowedProtocols: ['https', 'mailto']
})
```

::warning
The hard-coded floor (`javascript:`, `vbscript:`, and `data:` outside images) cannot be overridden. Even `allowedProtocols: ['javascript']` will not unblock `javascript:` URLs.
::

### `allowedLinkPrefixes`

Restricts which URLs are allowed in link props: every [URL prop](#protocol-blocking) except image props, such as `href`, `xlink:href`, and `to`. Relative URLs (starting with `/`, `#`, etc.) are always allowed regardless of this setting.

Prefixes compare by parsed origin plus a path-segment boundary, not by raw string matching: `https://myapp.com` allows `https://myapp.com/docs` but never a lookalike host such as `https://myapp.com.evil.com`. Scheme-relative URLs (`//evil.com/page`) resolve to an absolute URL and go through the same checks.

When a URL does not match any prefix and `defaultOrigin` is set, the URL is rewritten instead of stripped.

```typescript
security({
  allowedLinkPrefixes: ['https://myapp.com', 'https://docs.myapp.com']
})
```

### `allowedImagePrefixes`

Same as `allowedLinkPrefixes` but applies to image props only: `src`, props ending in `src` (`avatarSrc`), and `poster`. The two options are checked independently; restricting one does not affect the other.

```typescript
security({
  allowedImagePrefixes: ['https://cdn.myapp.com']
})
```

### `defaultOrigin`

When a URL fails the `allowedLinkPrefixes` or `allowedImagePrefixes` check, it is rewritten to use this origin instead of being stripped. The path, query, and fragment of the original URL are preserved.

```typescript
security({
  allowedLinkPrefixes: ['https://myapp.com'],
  defaultOrigin: 'https://myapp.com'
})
// https://evil.com/path → https://myapp.com/path
```

### `allowDataImages`

Controls whether `data:image/*` URIs are allowed in image props (`src`, `*src`, `poster`). Set to `false` to block base64-encoded images, which can be used as tracking pixels or embedded payloads.

```typescript
security({
  allowDataImages: false
})
```

::tip
`data:` URLs in link props, and non-image `data:` URLs anywhere, are always blocked by the hard-coded floor regardless of this setting.
::

### `frontmatter`

Controls whether frontmatter is sanitized along with the AST (see [Frontmatter](#frontmatter)). Set to `false` when your frontmatter is trusted and never spread into components.

```typescript
security({
  frontmatter: false
})
```

---

## Examples

### User-generated content

The most common use case: lock down everything that could execute code or phone home:

```typescript
import { parseMarkdown } from 'comark'
import security from 'comark/plugins/security'

const result = await parseMarkdown(userInput, {
  plugins: [
    security({
      blockedTags: ['script', 'iframe', 'object', 'embed', 'link', 'style'],
      allowedProtocols: ['https', 'mailto'],
      allowDataImages: false
    })
  ]
})
```

### Restrict links to your domain

Keep all links and images within your own infrastructure, rewriting external URLs instead of stripping them:

```typescript
security({
  allowedLinkPrefixes: ['https://myapp.com', 'https://docs.myapp.com'],
  allowedImagePrefixes: ['https://cdn.myapp.com'],
  defaultOrigin: 'https://myapp.com'
})
```

### Block external images

Prevent tracking pixels and externally-hosted images while keeping everything else permissive:

```typescript
security({
  allowedImagePrefixes: ['https://cdn.myapp.com'],
  allowDataImages: false
})
```

---

## Recommendations

### Block tags, not just attributes

Blocking only `<script>` may not be enough: `<iframe>`, `<object>`, `<embed>`, `<link>`, and `<style>` can also execute or load external content:

```typescript
// ✅ More thorough
security({
  blockedTags: ['script', 'iframe', 'object', 'embed', 'link', 'style']
})

// ⚠️ Incomplete
security({
  blockedTags: ['script']
})
```

### Sanitize before storage

Sanitizing at parse time on read means malicious content already made it into the database. Sanitize before writing instead:

```typescript
// ✅ Sanitize before storing
async function saveArticle(content: string) {
  const sanitized = await parseMarkdown(content, {
    plugins: [security({ blockedTags: ['script', 'iframe'] })]
  })
  await db.articles.create({ content: sanitized })
}
```

### Pair with a Content Security Policy

The plugin sanitizes the AST, but a CSP header adds a second line of defense in the browser:

```typescript
// Express.js
res.setHeader(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'none';"
)
```

::tip
The plugin runs during the `post` phase and traverses the AST once (O(n) in the number of nodes), with no impact on render time.
::
