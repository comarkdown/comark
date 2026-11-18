# Svelte Markdown example with Vite

This example renders a Markdown blog, component syntax examples, and a live editor in Svelte 5 and Vite with `@comark/svelte`.

## How it works

- **High-level rendering**: pass a Markdown string to `<Markdown value={content}>` from `@comark/svelte` to parse and render reactively with Svelte 5 `$state` and `$effect` runes.
- **Pre-parsed rendering**: load `.md` files with `import.meta.glob`, parse them with `parseMarkdown()` and `shiki()`, and pass the document to `<MarkdownDocument>`.
- **Lazy components**: resolve components on demand through `componentsManifest`.

## Run locally

From the monorepo root:

```bash
pnpm dev:svelte
```

## Documentation

- [Comark documentation](https://comark.dev)
- [Svelte rendering](https://comark.dev/rendering/svelte)
