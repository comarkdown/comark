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

## Options

```typescript
import html from 'comark/plugins/html'

await parseMarkdown(content, {
  plugins: [html({ markdown: false })],
})
```

| Option | Default | Description |
| --- | --- | --- |
| `markdown` | `true` | Expand text inside closed HTML as inline markdown. `false` keeps that text literal. |

`markdown: false` does not turn blank-line bodies into literal text. A blank line ends a CommonMark HTML block, so the following paragraphs are normal markdown and nest under the still-open tag either way.

```mdc
<!-- markdown: true (default) — ** becomes strong -->
<div>
Hello **World**
</div>

<!-- markdown: false — body stays the text "Hello **World**" -->
<div>
Hello **World**
</div>

<!-- both modes — the blank line already ended the HTML block -->
<div>

Hello **World**

</div>
```

`<style>`, `<pre>`, `<script>`, and `<textarea>` are never re-parsed as markdown, including when they have attributes. Each body keeps every character between the tags — newlines, indentation, and inner tags (`a < b`, `<div>**no**</div>`) stay text.

Spaces beside a tag are content. `<p>Hello <em>x</em> <a>two</a></p>` keeps the space after `Hello` and the space between `</em>` and `<a>`, including when `markdown` is `false`.

## Block and inline

Every HTML node is marked `$: { html: 1, block: 0 | 1 }` so renderers can tell it apart from an element that came from markdown (`**bold**` → `['strong', {}, 'bold']`, no `$`).

`block` is not "`div` is a block tag." It records whether the tag outlived the paragraph that opened it.

| `block` | Meaning |
| --- | --- |
| `0` | Opened and closed inside one paragraph. `<em>x</em>`, and each `<p>…</p>` in a tight run of sibling tags. |
| `1` | Still open after that paragraph, or unwrapped because it was the only thing in it. `<div>` across lines, an unclosed `<ai-thinking>`. |

Void tags (`img`, `br`, …) are always `block: 0`.

## How it works

1. Enables markdown-exit HTML tokenization (`html: true`).
2. With `markdown: true`, narrows the built-in `html_block` rule to `<style>`, `<pre>`, `<script>`, and `<textarea>`, so other closed HTML is tokenized as normal markdown (`**`, code spans, nested tags).
3. Splits any remaining raw HTML block into tags and literal text, then pairs open/close tags across paragraphs with one HTML stack.

A matching close tag collects every block parsed while it was open. `</div><div>` emits two sibling elements, not a `div` nested inside the next `div`.

Not supported yet: an opener and its closer split by a blank line when the opener sat mid-paragraph (`before <div>` … blank line … `</div> after`), and an indented child tag inside a multiline inline element (`<a>` → indented `<img>` → `</a>`). Put the close tag on its own line in the same block, or separate body paragraphs with a blank line inside a block container (`<div>`, `<main>`).
