---
title: Streaming
description: Stream markdown character-by-character and count visible mis-render flashes in Vue.
navigation:
  icon: i-lucide-radio
  category: Vite
path: /examples/vite/vue-streaming
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/2.vite/vue-streaming
defaultValue: src/App.vue
---
::

## Features

This example demonstrates Comark streaming in Vue and measures **mis-renders**:

- **Editable input** — paste or type any markdown source
- **Character stream** — replay the source with configurable chunk size and delay
- **`streaming` + caret** — uses `<Markdown :streaming :caret>` so incomplete syntax is healed while tokens arrive
- **Mis-render tracker** — after every frame, compares visible text snapshots; characters that were shown and later removed are counted as mis-renders

### What is a mis-render?

If a frame briefly shows a literal marker that disappears once more input arrives, that character was a mis-render:

```text
frame n:   Hello *
frame n+1: Hello da   (as <strong>da</strong>)
```

The visible `*` left the rendered text → **1 mis-render character**.

Comark's `streaming: true` mode enables auto-close helpers (including `dropTrailingOpeners`) so half-typed markers after whitespace are less likely to flash. Toggle **streaming mode** off in the UI to compare.

## Usage

```bash
cd examples/2.vite/vue-streaming
pnpm install   # from monorepo root if needed
pnpm dev
```

1. Edit the markdown textarea (or keep the sample).
2. Adjust **Chars / tick** and **Delay**.
3. Click **Stream**.
4. Watch the live preview and the mis-render counter / log.

## Key API

```vue
<Markdown
  :value="streamed"
  :streaming="isStreaming"
  caret
/>
```
