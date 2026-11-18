# Nuxt UI blog with Comark

This example renders Markdown blog posts in Nuxt 4 with `@comark/vue` and Nuxt UI. Adding `@comark/vue` and `@nuxt/ui` to `modules` in `nuxt.config.ts` registers `<Markdown>` and `<MarkdownDocument>` and enables Nuxt UI prose components.

## How it works

- **Auto-imported components**: `@comark/vue/nuxt` registers `<Markdown>` and `<MarkdownDocument>` across the app.
- **Auto-imported helpers**: `defineMarkdownComponent()`, `defineMarkdownDocumentComponent()`, `parseMarkdown()`, and `createMarkdownParser()` are available in app code and Nitro server routes.
- **Nuxt UI prose**: the module detects `@nuxt/ui` and enables its `Prose*` components so headings, lists, links, and code blocks render with Nuxt UI styling.

## Run locally

From the monorepo root:

```bash
pnpm dev:nuxt
```

## Documentation

- [Comark documentation](https://comark.dev)
- [Vue and Nuxt rendering](https://comark.dev/rendering/vue#nuxt)
