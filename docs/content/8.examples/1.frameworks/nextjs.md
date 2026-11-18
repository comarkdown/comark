---
title: 'Next.js Markdown Blog with React Server Components'
description: Render a Markdown blog with the Next.js App Router, static export, and React Server Components.
navigation:
  title: 'Next.js'
  icon: i-simple-icons:nextdotjs
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/1.frameworks/nextjs
defaultValue: content/posts/comark-syntax.md
---
::

::browser{src="https://comark-nextjs.vercel.app/blog/comark-syntax"}
::

This example renders a static Markdown blog with the Next.js App Router and React Server Components. Posts live in `content/posts/` as `.md` files with YAML frontmatter, parse on the server with `parseMarkdown()`, and render through `MarkdownDocument` from `@comark/react`.

## How it works

- **File-based content**: `.md` files in `content/posts/` store post bodies alongside YAML frontmatter (`title`, `description`, `pubDate`, and `tags`).
- **Comark parsing**: `lib/posts.ts` reads each file and calls `parseMarkdown()` with `shiki()` to extract frontmatter and build the `MarkdownDocument` in one pass, instead of chaining `gray-matter`, `remark`, and `rehype`.
- **Static generation**: `generateStaticParams` pre-renders every post at build time with `output: 'export'`.
- **Server Components**: `MarkdownDocument` renders custom components such as `Alert` and slot-aware `FeatureCard` on the server.
