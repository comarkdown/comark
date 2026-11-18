# React Markdown example with Vite

This example renders a Markdown blog, component syntax examples, and a live editor in React and Vite with `@comark/react`.

## How it works

- **High-level rendering**: pass a Markdown string to `<Markdown>` from `@comark/react` to parse and render in one step.
- **Pre-parsed rendering**: load `.md` files with `import.meta.glob`, parse them with `parseMarkdown()` and `shiki()`, and pass the document to `<MarkdownDocument>`.
- **Custom React components**: map components such as `Alert` through the `components` prop.

## Run locally

From the monorepo root:

```bash
pnpm dev:react
```

## Documentation

- [Comark documentation](https://comark.dev)
- [React rendering](https://comark.dev/rendering/react)
