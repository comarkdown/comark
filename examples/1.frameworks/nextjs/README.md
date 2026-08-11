---
title: Next.js
description: A blog example using Comark with Next.js App Router and React Server Components.
navigation:
  icon:  i-simple-icons:nextdotjs
category: Frameworks
path: /examples/frameworks/nextjs
demo: https://comark-nextjs.vercel.app
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

This example demonstrates how to use Comark with Next.js App Router and React Server Components. Blog posts are stored as `.md` files with frontmatter, parsed using `parseMarkdown()` from `comark`, and rendered using `MarkdownDocument` from `@comark/react` with custom components like `Alert`, `FeatureCard`, and a copyable `CodeBlock`.

## How it works

- **File-based content** — Posts are plain `.md` files in `content/posts/` with YAML frontmatter for metadata (title, description, pubDate, tags).
- **Comark parsing** — `lib/posts.ts` reads markdown files and uses `parseMarkdown()` to build the AST and extract frontmatter — replacing the usual `gray-matter` + `remark` + `rehype` pipeline.
- **Static generation** — `generateStaticParams` pre-renders all blog posts at build time via `output: 'export'`.
- **React rendering** — `MarkdownDocument` from `@comark/react` renders the AST using React Server Components, including custom ones like `Alert`, slot-aware components like `FeatureCard`, and `CodeBlock`. Content rendering stays on the server; only the copy button hydrates on the client.
