# Astro blog with Comark

This example renders Markdown blog posts with Astro content collections, Zod frontmatter schemas, and React components via `@comark/react`.

## How it works

- **Content collections**: `src/content.config.ts` loads `.md` files from `src/content/posts/` with Astro's `glob()` loader and validates frontmatter (`title`, `description`, `pubDate`, and `tags`) with Zod.
- **Comark parsing**: `src/pages/posts/[...id].astro` passes `post.body` to `parseMarkdown()` with `shiki()` to build a `MarkdownDocument`.
- **Server rendering**: `MarkdownDocument` from `@comark/react` renders the document and custom components such as `Alert` to static HTML at build time, with zero client-side JavaScript.

## Run locally

From the monorepo root:

```bash
pnpm dev:astro
```

## Documentation

- [Comark documentation](https://comark.dev)
- [React rendering](https://comark.dev/rendering/react)
