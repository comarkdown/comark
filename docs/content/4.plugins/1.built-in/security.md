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
| `*Html` / `*-html` (`labelHtml`, `description-html`, `v-html`, and similar) | Component props rendered as raw HTML (for example, with `v-html`) |
| `attributeName` targeting `href` | SVG `<animate>` / `<set>` can rewrite a link to a script URL |

Prop names are normalized before these checks: case, binding prefixes (`:`, `v-bind:`), Vue's `.prop` / `^attr` prefixes (`.innerHTML`, `^onclick`), and `:` / `-` / `_` separators are ignored.

::note
Framework renderers (Vue, React, Svelte, and Angular) never forward `innerHTML`, `dangerouslySetInnerHTML`, or `textContent` from document attributes, even without this plugin. A prop object or array that holds one of these keys at any depth is dropped whole, since components can pass it on to `h(tag, prop)` or spread it onto an element. Raw HTML has its own explicit path through the default `html` plugin.
::

### Component-like values

Renderers pass bound props to components. In Vue, a plain object with a `template`, `render`, `ssrRender`, `setup`, `extends`, or `mixins` key is treated as a component definition. Objects with `__v_isVNode` act as prebuilt VNodes, and objects with `__isTeleport`, `__isSuspense`, or `__isKeepAlive` match Vue built-in components. Allowing those objects through could execute arbitrary templates during SSR or bypass tag filtering, so Comark always drops:

- Non-string `as` and `is` values, because they name the element or component to render (Vue mounts an array as a component, and React throws on one). String values must be a plain tag or component name, because Vue's server renderer writes anything else (such as `img src=x onerror=...`) into the opening tag, and they cannot name executable tags (`script`, `style`, `iframe`, `object`, `embed`, and similar). The security plugin also strips every binding to `as` and `is` (see [`allowedTags`](#allowedtags)). Because `tag` is often a data prop, only objects are dropped there.
- Any object or array with one of those keys at any depth, such as `:icon='{"extends": {"template": "..."}}'` or `:icon='{"__v_isVNode": true, "type": "script"}'`.
- An `__v_isVNode` attribute on the element itself, bound or not. Vue would otherwise render the element's attributes as a prebuilt VNode.

Data props keep working, for example `:items='[{"label": "a"}]'`. The Vue renderer also only resolves `as` to a component when it is a string. Frontmatter is checked for component options only, so data such as `tag: [vue, nuxt]` stays; a binding to `as` or `is` is always dropped, and one that passes an object to `tag` is too.

::warning
Rendering untrusted Markdown (chat messages, LLM output, or user comments) is only safe with this plugin enabled. Renderers apply a minimum floor to bound props, while `security()` enforces the full policy and removes unsafe nodes and attributes from the document tree. Keep `security()` enabled for untrusted input.
::

### Nested props

Object and array prop values (`:links='[{"to": "/docs", "label": "Docs"}]'` and YAML props) are validated recursively. Every nested key goes through the same checks as a top-level prop, so nested `on*` handlers, `*Html` keys, and unsafe URLs are removed at any depth while safe sibling values stay intact. Array items are checked against the prop name that holds them.

### Protocol blocking

URL props are decoded (URL-encoded and HTML entity variants included) and checked against a hard-coded blocklist. A prop is a URL prop when its name is `href`, `src`, `to`, `action`, `poster`, `cite`, `background`, `ping`, or `longdesc`, or ends in `href`, `src`, `url`, `uri`, or `link` (optionally plural), such as `xlink:href`, `imageUrl`, or `avatar-src`. Other props are never parsed as URLs, so prose such as `title="JavaScript: the good parts"` is kept.

These URLs are **always** blocked, even if `allowedProtocols: ['*']` is set:

- `javascript:` and `vbscript:` URLs
- `data:` URLs in link props (`href`, `to`, and others)
- `data:` URLs in image props, unless their MIME type is `image/*` (see [`allowDataImages`](#allowdataimages))

A `data:` URL is checked the way browsers read its MIME type, which ignores spaces after `data:`. So `data: text/html,...` is blocked like `data:text/html,...`.

The same check runs on `:href` and `:src` bindings both at parse time (on the JSON-decoded value) and at render time (on the resolved value), so bindings cannot smuggle an unsafe URL through frontmatter or other data sources.

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

Renderers spread frontmatter into components, so the plugin sanitizes frontmatter at any depth with the same rules as props:

- Event handler and markup keys are removed using the same normalized name checks.
- URLs in URL keys (`to`, `link`, `imageSrc`, and others) must pass the protocol floor and URL prefix options.
- An `as` or `is` value naming a blocked, unsafe, or disallowed tag is removed.

Dropped array items are removed without leaving a hole. Set [`frontmatter: false`](#frontmatter-1) to opt out.

To apply the same rules to objects that don't come through the parser, such as a YAML or JSON file you load yourself, call `sanitizeData()` from `comark/utils`. It cleans the data in place and returns the dotted paths it removed:

```typescript
import { sanitizeData } from 'comark/utils'

const removed = sanitizeData(data, { blockedTags: ['script'], allowDataImages: false })
```

---

## API

### `security(options?)`

Returns a `ComarkPlugin` that sanitizes the parsed AST.

**Parameters:**

- `options?`: Optional configuration. See [Options](#options).

**Returns:** `ComarkPlugin`

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| [`blockedTags`](#blockedtags) | `string[]` | `[]` | Tag names to remove from the AST |
| [`allowedTags`](#allowedtags) | `string[]` | `[]` | Allowlist of tag names to keep in the AST |
| [`tagFallback`](#tagfallback) | `function` | `undefined`  | Replacement handler for disallowed tags in the AST |
| [`allowedProtocols`](#allowedprotocols) | `string[]` | `['*']` | Protocols permitted in URL props |
| [`allowedLinkPrefixes`](#allowedlinkprefixes) | `string[]` | `['*']` | URL prefixes permitted in link props (`href`, `to`, and others) |
| [`allowedImagePrefixes`](#allowedimageprefixes) | `string[]` | `['*']` | URL prefixes permitted in image props (`src`, `*src`, `srcset`, `poster`) and `url()` in `style` |
| [`defaultOrigin`](#defaultorigin) | `string` | `undefined` | Rewrite disallowed URLs to this origin instead of stripping |
| [`allowDataImages`](#allowdataimages) | `boolean` | `true` | Allow `data:image/*` URIs in image props |
| [`frontmatter`](#frontmatter-1) | `boolean` | `true` | Sanitize frontmatter as well as the AST |

### `blockedTags`

Tag names to remove from the AST. Matching is case-insensitive, so `SCRIPT`, `Script`, and `script` all match.

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

Allowlist of tag names to keep in the AST. Any tag outside this list is removed (or passed to [`tagFallback`](#tagfallback)). Matching is case-insensitive, so `SPAN`, `Span`, and `span` all match.

```typescript
security({
  allowedTags: ['p', 'span', 'ul', 'li', 'ol', 'strong']
})
```

The `as` and `is` props (which make framework renderers resolve a different component than the element's own tag) are treated as the element's tag. An element whose `as` or `is` names a blocked or disallowed tag is removed, or passed to [`tagFallback`](#tagfallback), like an element with that tag. Its own tag must pass the filters too, since renderers fall back to it when no component matches the `as` value. Props are validated for the named tag, so `as="object"` drops them all.

An `as` or `is` value must be a literal string made only of letters, digits, `_`, and `-`, such as `as="my-card"`. Any other value is stripped, along with every binding that could set one, since a bound value is only known at render time, after every check:

- `:as`, `v-bind:as`, `:is`, and `v-bind:is`, even with a JSON string (`:as='"section"'`)
- Prefixed or differently cased names that the renderers don't read as `as` or `is`, such as `AS` or `.is`
- An object binding (`v-bind`, `v-bind:`, or `:`) whose object has an `as` or `is` key, or comes from render-time data (`v-bind="frontmatter.props"`)

### `tagFallback`

Defines the replacement strategy for tags filtered out because they are absent from `allowedTags` or listed in `blockedTags`.

```typescript
import { textContent } from 'comark/utils'

security({
  allowedTags: ['p', 'span'],
  tagFallback: (element: ElementNode) => {
    // Strip the disallowed tag and keep its plain text
    return textContent(element)
  }
})
```

### `allowedProtocols`

Restricts which URL protocols are permitted in [URL props](#protocol-blocking) (`href`, `src`, `to`, and others). Use `['*']` to allow all protocols not already on the hard-coded blocklist.

```typescript
security({
  allowedProtocols: ['https', 'mailto']
})
```

::warning
The hard-coded floor (`javascript:`, `vbscript:`, and `data:` outside images) cannot be overridden. Even `allowedProtocols: ['javascript']` will not unblock `javascript:` URLs.
::

### `allowedLinkPrefixes`

Restricts which URLs are allowed in link props (every [URL prop](#protocol-blocking) except image props, such as `href`, `xlink:href`, and `to`). Relative URLs (such as `/docs`, `#section`, or `./file`) are always allowed regardless of this setting.

Prefixes match by parsed origin plus a path-segment boundary, not by raw string prefix. `https://myapp.com` allows `https://myapp.com/docs` and rejects lookalike hosts such as `https://myapp.com.evil.com`. Scheme-relative URLs (`//evil.com/page`) resolve to an absolute URL and go through the same checks.

A URL must pass both as the browser reads it and percent-decoded. The browser keeps `%2F` in `https://myapp.com%2F@evil.com/`, treating `myapp.com%2F` as a username and sending the request to `evil.com`, so the URL is stripped. Decoded, `https://myapp.com/docs/..%2F..%2Fadmin` leaves `/docs/`, so it fails a `https://myapp.com/docs` prefix too.

When a URL does not match any prefix and `defaultOrigin` is set, the URL is rewritten instead of stripped.

```typescript
security({
  allowedLinkPrefixes: ['https://myapp.com', 'https://docs.myapp.com']
})
```

### `allowedImagePrefixes`

Same as `allowedLinkPrefixes`, applied to image props only (`src`, props ending in `src` such as `avatarSrc`, `poster`, and `srcset` / `imagesrcset`). The two options are checked independently; restricting one does not affect the other.

The browser may load any candidate in a `srcset`, so every candidate URL is checked, and one disallowed candidate strips the whole attribute. With `defaultOrigin`, disallowed candidates are rewritten in place instead.

Inline styles can fetch images too (for example, `background`, `mask`, `cursor`, and `list-style`), so every `url()`, `image-set()`, and `src()` URL in a `style` prop or bound style object goes through the same checks. CSS escapes and comments are decoded the way browsers read them, catching obfuscated calls such as `u\72l(...)`. A `style` value with any disallowed URL is stripped whole, even with `defaultOrigin`. Unsafe protocols such as `url(javascript:...)` are stripped regardless of prefixes.

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

Lock down tags, protocols, and data images for untrusted user input:

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

Prevent tracking pixels and externally hosted images while keeping everything else permissive:

```typescript
security({
  allowedImagePrefixes: ['https://cdn.myapp.com'],
  allowDataImages: false
})
```

---

## Recommendations

### Block all executable and embedding tags

Blocking only `<script>` leaves other dangerous elements open, because `<iframe>`, `<object>`, `<embed>`, `<link>`, and `<style>` can also execute code or load external resources:

```typescript
// Recommended: block all tags that execute code or load external resources
security({
  blockedTags: ['script', 'iframe', 'object', 'embed', 'link', 'style']
})

// Incomplete: leaves iframe, object, embed, link, and style allowed
security({
  blockedTags: ['script']
})
```

### Sanitize before storage

Sanitizing only at read time means malicious payloads have already been written to your database. Sanitize before storing instead:

```typescript
// Sanitize before storing
async function saveArticle(content: string) {
  const sanitized = await parseMarkdown(content, {
    plugins: [security({ blockedTags: ['script', 'iframe'] })]
  })
  await db.articles.create({ content: sanitized })
}
```

### Pair with a Content Security Policy

Pair AST sanitization with a `Content-Security-Policy` HTTP header as a second layer of defense in the browser:

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
