# Comark components in VitePress

This example adds Comark's `::` component syntax and `{...}` inline attributes directly to VitePress through its markdown-it configuration, without a wrapper component or custom renderer.

## How it works

- **markdown-it plugins**: `.vitepress/config.ts` registers `markdownItComponents` from `comark/plugins/components` and `markdownItAttributes` from `comark/plugins/attributes` inside `markdown.config(md)`.
- **Global component registration**: Vue components such as `Alert` register globally in the VitePress theme through `enhanceApp`, so `::alert{type="info"}` renders `<Alert>`.
- **VitePress Markdown compatibility**: Comark blocks and attributes work alongside VitePress code blocks, tables, custom containers, and GitHub alerts because both run on markdown-it.

## Run locally

From the monorepo root:

```bash
pnpm dev:vitepress
```

## Documentation

- [Comark documentation](https://comark.dev)
- [Components plugin](https://comark.dev/plugins/defaults/components)
- [Attributes plugin](https://comark.dev/plugins/defaults/attributes)
