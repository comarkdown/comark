# Streaming

One Markdown source streamed side by side through five columns: the editor, and the same stream rendered by Vue, React, Svelte and Angular.

## Features

- **Editable source**: type or paste Markdown in the first column.
- **Shared stream**: Stream replays the source in chunks. Chunk size, delay, speed and effects are shared by every renderer.
- **Shared plugins**: one `plugins` array (`shiki()`) is passed to all four renderers.
- **Shared effects**: one `effects` array built from the `pace`, `fade`, `typewriter` and `caret` checkboxes (any combination, applied in that order) is passed to all four renderers. Each renderer runs them through its own `createStreamRenderer`.

## Run locally

From the monorepo root:

```bash
pnpm --filter comark-streaming dev
```

## Architecture

- `src/shared/store.ts` owns the source, the streaming loop, the `plugins` list and the `effects` list.
- Each column subscribes to the store and renders `<Markdown :value :streaming :plugins :effects />` (or the framework equivalent).
- `src/editor.ts` is the plain-DOM editor column.

## Documentation

- [Comark documentation](https://comark.dev)
- [Streaming and stream effects](https://comark.dev/rendering/vue#streaming)
