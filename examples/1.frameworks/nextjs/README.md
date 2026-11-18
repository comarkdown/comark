# Next.js blog with Comark and React Server Components

This example renders a static Markdown blog with the Next.js App Router and React Server Components. Posts live as `.md` files in `content/posts/`, parse on the server with `parseMarkdown()` from `comark`, and render with `MarkdownDocument` from `@comark/react`.

## How it works

- **File-based content**: `.md` files in `content/posts/` store post bodies and YAML frontmatter (`title`, `description`, `pubDate`, and `tags`).
- **Comark parsing**: `lib/posts.ts` reads each file and calls `parseMarkdown()` with `shiki()` to build the `MarkdownDocument` and extract frontmatter in one step, instead of chaining `gray-matter`, `remark`, and `rehype`.
- **Static generation**: `generateStaticParams` pre-renders every blog post at build time with `output: 'export'`.
- **Server Components**: `MarkdownDocument` renders custom components such as `Alert`, slot-aware `FeatureCard`, and `CodeBlock` on the server; only the copy button hydrates on the client.

## Run locally

From the monorepo root:

```bash
pnpm dev:nextjs
```

## Documentation

- [Comark documentation](https://comark.dev)
- [React rendering](https://comark.dev/rendering/react)
