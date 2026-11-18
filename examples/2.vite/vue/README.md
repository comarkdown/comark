# Vue Markdown example with Vite

This example renders a Markdown blog, component syntax examples, and a live editor in Vue 3 and Vite with `@comark/vue` and Nuxt UI.

## How it works

- **High-level rendering**: wrap `<Markdown>` from `@comark/vue` in `<Suspense>` to parse and render a Markdown string asynchronously.
- **Pre-parsed rendering**: load `.md` files with `import.meta.glob`, parse them with `parseMarkdown()` and `shiki()`, and pass the document to `<MarkdownDocument>`.
- **Custom Vue components**: map components such as `Alert.vue` through `:components`.

## Run locally

From the monorepo root:

```bash
pnpm dev:vue
```

## Documentation

- [Comark documentation](https://comark.dev)
- [Vue rendering](https://comark.dev/rendering/vue)
