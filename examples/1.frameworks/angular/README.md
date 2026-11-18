# Angular blog with Comark

This example renders a Markdown blog with Angular CLI and Comark. Posts live as `.md` files in `public/posts/`, parse with `parseMarkdown()` from `comark`, and render with `MarkdownDocument` from `@comark/angular`.

## How it works

- **File-based content**: `.md` files in `public/posts/` store post bodies and YAML frontmatter (`title`, `description`, `pubDate`, and `tags`). Angular CLI copies them to the site root, so the posts load with `fetch`.
- **Comark parsing**: `src/app/lib/posts.ts` calls `parseMarkdown()` with `shiki()` to build the `MarkdownDocument` and read frontmatter in one step, instead of chaining `gray-matter`, `remark`, and `rehype`.
- **Config providers**: `defineMarkdownDocumentComponent()` returns a provider for `MARKDOWN_DOCUMENT_CONFIG`. The static `MarkdownDocument` component stays in `imports`, so Angular AOT compiles it without NG1010.
- **Custom components**: `Alert`, the slot-aware `FeatureCard`, and `CodeBlock` map from Markdown tags to Angular components. The copy button is the only interactive part.

## Run locally

From the monorepo root:

```bash
pnpm dev:angular-blog
```

## Documentation

- [Comark documentation](https://comark.dev)
- [Angular rendering](https://comark.dev/rendering/angular)
