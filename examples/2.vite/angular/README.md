# Angular Markdown example with Vite

This example renders a Markdown blog, component syntax examples, and a live editor in Angular 21+ with Vite and `@comark/angular`.

## How it works

- **High-level rendering**: pass a Markdown string to `<comark-markdown [value]="content">` to parse and render in one step.
- **Pre-parsed rendering**: load `.md` files with `import.meta.glob`, parse them with `parseMarkdown()` and `shiki()`, and pass the document to `<comark-markdown-document>`.
- **Custom standalone components**: map Angular standalone components such as `AlertComponent` through `[components]`.

## Run locally

From the monorepo root:

```bash
pnpm dev:angular
```

## Documentation

- [Comark documentation](https://comark.dev)
- [Angular rendering](https://comark.dev/rendering/angular)
