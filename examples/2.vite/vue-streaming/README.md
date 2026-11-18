# Vue streaming and mis-render counter

This example streams Markdown character by character in Vue and counts visible mis-render flashes during incremental rendering.

## Features

- **Editable input**: paste or type any Markdown source into the editor.
- **Character stream**: replay the input with configurable chunk sizes and tick delays.
- **Streaming and caret**: renders with `<Markdown :streaming :caret>` from `@comark/vue` so incomplete syntax auto-closes while tokens arrive.
- **Mis-render tracker**: compares visible text snapshots after each frame and counts characters that briefly appeared in the DOM before disappearing on a later frame.

### What is a mis-render

When a frame renders a literal syntax marker that vanishes once later tokens complete the construct, that flashed character is counted as a mis-render:

```text
frame n:   Hello *
frame n+1: Hello da   (rendered as <strong>da</strong>)
```

In this sequence, the visible `*` disappeared from the rendered text, recording 1 mis-render character.

Setting `streaming: true` enables auto-close rules including `dropTrailingOpeners`, preventing half-typed openers after whitespace from flashing before the next token arrives. Toggle **streaming mode** off in the UI to compare the mis-render count.

## Run locally

From the monorepo root:

```bash
pnpm --filter comark-vue-streaming dev
```

1. Edit the Markdown textarea or keep the default sample.
2. Adjust **Chars / tick** and **Delay**.
3. Click **Stream** and watch the live preview and mis-render log.

## Key API

```vue
<Markdown
  :value="streamed"
  :streaming="isStreaming"
  caret
/>
```

## Documentation

- [Comark documentation](https://comark.dev)
- [Vue streaming](https://comark.dev/rendering/vue#streaming)
- [Auto-close reference](https://comark.dev/reference/auto-close)
