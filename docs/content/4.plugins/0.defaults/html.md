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

The `comark/plugins/html` plugin parses embedded block and inline HTML tags into AST nodes, so you can mix raw HTML with Comark components and Markdown syntax.

This plugin is **enabled by default** via `registerDefaultPlugins`, so you don't need to install or register it.

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

When you disable default plugins, pass `html()` explicitly:

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

## Options

```typescript
import html from 'comark/plugins/html'

await parseMarkdown(content, {
  plugins: [html({ markdown: false })],
})
```

| Option | Default | Description |
| --- | --- | --- |
| `markdown` | `true` | Expand text inside closed HTML as inline Markdown. `false` keeps that text literal. |

`markdown: false` does not turn blank-line bodies into literal text. A blank line ends a CommonMark HTML block, so the following paragraphs are normal Markdown and nest under the still-open tag either way.

```mdc
<!-- markdown: true (default), ** becomes strong -->
<div>
Hello **World**
</div>

<!-- markdown: false, body stays the literal text "Hello **World**" -->
<div>
Hello **World**
</div>

<!-- In both modes, the blank line already ended the HTML block -->
<div>

Hello **World**

</div>
```

`<style>`, `<pre>`, `<script>`, and `<textarea>` are never re-parsed as Markdown, including when they have attributes. Each body keeps every character between the tags, so newlines, indentation, and inner tags (`a < b`, `<div>**no**</div>`) stay literal text. A block-level comment (`<!--` ... `-->`, even across blank lines) keeps its body verbatim the same way.

All-uppercase tag names are normalized to lowercase (`<DIV>` → `div`). A tag name with any lowercase letter keeps its authored case, so components and SVG elements resolve as written (`<Hello>` → `Hello`, `<linearGradient>` → `linearGradient`).

Spaces beside a tag are content. `<p>Hello <em>x</em> <a>two</a></p>` keeps the space after `Hello` and the space between `</em>` and `<a>`, including when `markdown` is `false`.

## Block and inline

Every HTML node is marked `$: { html: 1, block: 0 | 1 }` so renderers can tell it apart from an element that came from Markdown (`**bold**` → `['strong', {}, 'bold']`, no `$`).

`block` records whether the tag outlived the paragraph that opened it, regardless of whether the HTML tag name is block-level.

| `block` | Meaning |
| --- | --- |
| `0` | Opened and closed inside one paragraph. `<em>x</em>`, and each `<p>...</p>` in a tight run of sibling tags. |
| `1` | Still open after that paragraph, or unwrapped because it was the only thing in it. `<div>` across lines, an unclosed `<ai-thinking>`. |

Void tags (such as `img` and `br`) are always `block: 0`.

## How it works

1. Enables markdown-exit HTML tokenization (`html: true`).
2. With `markdown: true`, narrows the built-in `html_block` rule to `<style>`, `<pre>`, `<script>`, `<textarea>`, and block-level comments, so other closed HTML is tokenized as normal Markdown (`**`, code spans, and nested tags).
3. Splits any remaining raw HTML block into tags and literal text, then pairs open and close tags across paragraphs with one HTML stack.

A matching close tag collects every block parsed while it was open. `</div><div>` emits two sibling elements, not a `div` nested inside the next `div`.

Two cases are not supported yet: splitting a mid-paragraph opener and its closer across a blank line (`before <div>`, blank line, `</div> after`), and indenting a child tag inside a multiline inline element (`<a>` containing an indented `<img>` before `</a>`). Put the close tag on its own line in the same block, or separate body paragraphs with a blank line inside a block container (`<div>`, `<main>`).
