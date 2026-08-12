<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# @comark/opentui

OpenTUI renderer for Comark. Renders Markdown as a terminal UI layout tree.

Unlike [`@comark/ansi`](../comark-ansi), which returns a styled string, this
builds real [OpenTUI](https://github.com/sst/opentui) renderables — so markdown
takes part in flexbox layout, wraps to the terminal width, and gets tree-sitter
syntax highlighting on fenced code.

## Install

```bash
npm install @comark/opentui @opentui/core @opentui/react
```

## Usage

```tsx
/** @jsxImportSource @opentui/react */
import { Markdown } from '@comark/opentui'

export function Answer({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  return (
    <Markdown
      streaming={isStreaming}
      caret={isStreaming}
    >
      {text}
    </Markdown>
  )
}
```

Already have a parsed document — from a worker, a build step, another process —
render it directly and keep the parser out of the render path:

```tsx
import { MarkdownDocument } from '@comark/opentui'

<MarkdownDocument value={document} />
```

### Streaming

`streaming` re-parses as the source grows and closes dangling constructs, so a
half-arrived `**bold` renders bold instead of showing its asterisks until the
closer lands. The previous frame is held while a new parse is in flight, so the
output never blanks between deltas. `caret` appends a cursor to the last text
node.

### Theming

```tsx
<Markdown theme={{ codeFg: '#a5d6ff', bullet: '▸', syntaxStyle: mySyntaxStyle }}>
  {text}
</Markdown>
```

Every field is optional and merges over `defaultTheme`. Pass `syntaxStyle` to
make fenced code follow the host application's theme; without it a neutral one
is created on first paint.

### Components

`::components` and tag overrides go through `components`, same as the other
renderers:

```tsx
import { Markdown, Prose, withNode } from '@comark/opentui'

const Alert = withNode(({ children, __node }) => (
  <box border borderStyle="rounded" borderColor="#f0883e" paddingLeft={1}>
    <Prose node={__node}>{children}</Prose>
  </box>
))

<Markdown components={{ alert: Alert }}>{text}</Markdown>
```

**Wrap children in `Prose`, not a bare `box`.** A component body arrives in two
shapes and `children` alone does not say which: the parser's `autoUnwrap` strips
the paragraph off a single-paragraph body, handing over loose strings, while a
multi-paragraph body hands over `p` elements. Loose strings inside a `box` make
OpenTUI throw `Text must be created inside of a text node`. `Prose` sorts the
children into text hosts and blocks. Use `<text>{children}</text>` instead only
if the component is inline-only by construction.

`withNode` is what opts a component into receiving the raw Comark node on
`__node` (it sets `propTypes = { __node: null }`, which is the flag Comark's
walker looks for). The built-in `pre` uses it to reach the fence body, and
`table` to measure its columns.

## Gallery

Every construct on one scrollable page, with theme cycling and a streaming
replay:

```bash
pnpm dev:opentui
```

Needs Node >= 26.1. Source in
[`examples/3.cli/opentui-gallery`](../../examples/3.cli/opentui-gallery), where
`pnpm smoke` renders it headlessly and checks nothing went missing.

## Notes

**Inline versus block.** OpenTUI throws if a string or span lands outside a text
node, and markdown mixes the two inside one container — a tight list item holds
bare text, a loose one holds paragraphs. Containers group runs of inline
children into a single `text` and let block children through, so both shapes
work.

**Unknown tags.** Comark's html plugin is on by default, so a `<div>` in the
source becomes a `div` node. Any tag outside the built-in map resolves to a
passthrough container instead of throwing, which matters when the markdown comes
from a language model.

**GitHub alerts.** `> [!NOTE]` and friends parse to a blockquote carrying
`as: "note"`, and Comark resolves components from `as` — so `note`, `tip`,
`important`, `warning` and `caution` are registered under those names, not under
`blockquote`. Colours come from `theme.alert`; override a kind through
`components` to change the layout.

**Named slots.** `#title` arrives as `slotTitle`, `#footer` as `slotFooter`, and
`#default` as `children`. `Prose` follows the default template automatically, so
`<Prose node={__node}>` is right whether or not the component uses slots.

**Math.** Rendered as its TeX source — a terminal cannot typeset it. Mapping it
is not optional: math nodes carry no block/inline meta, so the generic fallback
would put a box inside a paragraph.

**Fenced code** has two highlighting paths:

- With the Shiki plugin registered, the token colours already in the AST are
  used. Where Shiki emits both light and dark variants, the dark one wins.

  Its language set is fixed at startup — vue, tsx, svelte, typescript,
  javascript, bash, json, yaml, astro — and there is **no load-on-demand**, so a
  fence in any other language renders flat until you pass its grammar:

  ```ts
  import shiki from 'comark/plugins/shiki'
  import python from 'shiki/dist/langs/python.mjs'

  <Markdown plugins={[shiki({ languages: [python] })]}>{text}</Markdown>
  ```

- Otherwise OpenTUI's `CodeRenderable` highlights with tree-sitter, styled by
  `theme.syntaxStyle`. That path is incremental and follows the terminal's theme,
  but it only produces colour for languages whose grammar the host registered
  through `addDefaultParsers` — OpenTUI ships none — so **plain fences render
  unhighlighted unless you install grammars**. Registering `shiki()` is the
  simplest way to get highlighting.

A `language [filename]` info string renders as a dimmed header above the block.

**Native tags.** `strong`, `em`, `b`, `i`, `u`, `a`, `br` and `span` are left to
OpenTUI's own text-node renderables, including OSC 8 hyperlinks for `a`.
`code` and `input` are mapped explicitly, because OpenTUI hosts of those names
are a block-level highlighted panel and an interactive text field.

Opening those hyperlinks is the terminal's job, and a terminal stops opening
them for an app that has captured the mouse — OpenTUI's default. iTerm2 and VS
Code open them anyway; Ghostty and other terminals following xterm give the
click to the app, so the link only opens on shift-click. A host that wants a
plain click to work should pass `useMouse: false` to `createCliRenderer` and
enable alternate scroll mode (`\x1b[?1007h`), which keeps the wheel scrolling by
sending cursor keys instead. `examples/3.cli/opentui-gallery` does this.

## Runtime

Rendering needs native FFI, which OpenTUI reaches through `bun:ffi` or — from
Node 26.1 — `node:ffi` behind `--experimental-ffi`:

```bash
node --experimental-ffi --import tsx app.tsx
```

Parsing and the component map have no such requirement, so a host that only
builds documents runs anywhere.

## Testing

The suite is split along that line:

```bash
pnpm test        # tag coverage, layout logic — any supported Node
pnpm test:paint  # rendered frames — needs Node >= 26.1
```

`test:paint` reports and exits cleanly on an older Node rather than failing, so
it is safe to wire into a pipeline that has not moved yet.
