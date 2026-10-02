# HTML parsing contract

Behavioral contract for embedded HTML. Fixtures in this directory are the user-facing cases. `test/html-block.test.ts` covers the option matrix and the cases deferred below.

HTML tags become element nodes with `$: { html: 1, block: 0 | 1 }`. A node without `$` is markdown-originated (`<strong>` from `**bold**` is `['strong', {}, 'bold']`).

## Block vs inline

`$.block` records whether the element outlived the paragraph that opened it. It is not an HTML block-tag list (`div` vs `span`).

| `$.block` | When | Example |
| --- | --- | --- |
| `0` | Opened and closed inside one paragraph. | `<p>Hi</p>` on its own line, or `Hello <em>x</em>` |
| `1` | The open tag is still open after that paragraph, or the element is the only child of a paragraph that exists only to hold it. | `<div>\nHi\n</div>`, an unclosed `<ai-thinking>` |

Void tags (`img`, `br`, …) are always `block: 0`.

Consecutive same-paragraph tags stay inline even if indented on following lines:

```md
<p class="warning">This is a warning message.</p>
  <p class="success">Your changes have been saved.</p>
```

Each `<p>` is `block: 0`. A blank line, or a close tag in a later paragraph, is what promotes a frame to `block: 1`.

A finished HTML element that is the only child of a synthetic paragraph is unwrapped out of that paragraph and marked `block: 1`. Several sibling HTML roots in one paragraph become a `fragment` and flatten to document level.

## Markdown vs literal

`html()` takes `markdown` (default `true`).

| Input | `markdown: true` (default) | `markdown: false` |
| --- | --- | --- |
| Closed, no blank line: `<div>\nHello **World**\n</div>` | `Hello` + `strong` | one literal text leaf, `Hello **World**` |
| Closed, blank line: `<div>\n\nHello **World**\n\n</div>` | `Hello` + `strong` | `Hello` + `strong` |
| Unclosed opener: `<ai-thinking>\n**bold**` | `strong` | literal `**bold**` |
| Unclosed opener, blank line: `<ai-thinking>\n\n**bold**` | `strong` | `strong` |

Blank-line bodies parse as markdown in both modes. CommonMark ends the HTML block at the blank line, so the following paragraphs are normal markdown and the still-open tag collects them. `markdown: false` only stops re-parsing text that CommonMark kept inside a closed `html_block`.

`<style>`, `<pre>`, `<script>`, and `<textarea>` always stay raw blocks, including with attributes. None of those bodies is markdown, in either mode. The match is the tag name plus a boundary, so `<prelude>` is not `<pre>` and `<scripture>` is not `<script>`.

All four keep every character between the tags, including the leading newline and indentation. Inner tags stay text until the matching closer, including inside `<pre>` and `<style>`.

```html
<pre>
  const x = 1
  **not**
</pre>
```

is the text `\n  const x = 1\n  **not**\n`, not a trimmed line and not a `strong`.

### Whitespace in a literal body

`markdown: false` keeps horizontal spaces. A space between tags (`</a> <a>`) and a space beside text (`Hello <em>`) are content.

Runs that contain a newline are structural. Leading indent after a newline is stripped, a trailing newline (and the spaces that pad it) is stripped, and a whitespace-only gap between tags is dropped. That is why

```html
<div>
  Hello <em>x</em>
</div>
```

with `markdown: false` is the text `Hello ` plus `<em>`, not `"\n  Hello "` plus `<em>`.

## How a block becomes a tree

1. markdown-exit tokenizes with `html: true`.
2. When `markdown` is true, the built-in `html_block` rule is narrowed to `<style>`, `<pre>`, `<script>`, and `<textarea>`. Every other closed HTML region falls through to the normal block/inline rules, so `**`, `` ` ``, and nested tags tokenize as markdown. This override is the feature. It reads markdown-exit's private block ruler (`__rules__`); a markdown-exit upgrade that renames or stops consulting `html_block` silently disables markdown-in-HTML.
3. Regions that remain `html_block` (those four tags, and every closed HTML block when `markdown` is false) are split into `html_inline` + literal `text` and wrapped in a paragraph so the same walk pairs them. The four raw-tag bodies are not split.
4. The tree walk keeps an HTML stack across blocks, the way hast-util-raw feeds parse5. An open tag pushes a frame. Later paragraphs and blocks fill it. A matching close pops it and auto-closes mismatched frames in between. `</div><div>` emits the closed `div` as a sibling of the new open frame, not as its child.

Two scanners must agree on what a tag is: the splitter for raw `html_block` text (`htmlToTokens` in `src/plugins/html.ts`) and the inline opener/closer parser (`parseHtmlInline` in `src/internal/parse/utils.ts`). A tag one accepts and the other rejects becomes a text leaf or an unclosed frame.

## Deferred

These are specified as skipped tests in `test/html-block.test.ts`. They are not supported yet. Do not "fix" a fixture by weakening it.

| Case | Why it is deferred |
| --- | --- |
| Inline opener, blank line, closer in a later paragraph (`dsd <p>…\n\n…</p>`) | CommonMark keeps the tags in different paragraphs. Pairing them needs a balance pass this walk does not do. |
| Trailing text after a cross-paragraph closer (`before <div>\n\n**bold**\n\n</div> after`) | Same split. `after` should be outside the element. |
| Indented nested raw HTML inside a multiline inline tag (`<a>\n  <img>\n</a>`, including wrapped in `<p>`) | The inner tag is claimed as its own block instead of a child. The sponsors-badge README shape. |

Supported instead: the close tag is on its own line in the same tight block (`<div>\n…\n</div>`), or a blank line separates body paragraphs inside a block container (`<main>\n\n…\n\n</main>`, `<div>\n\n…\n\n</div>`).
