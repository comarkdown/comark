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
repo: comark
path: examples/1.frameworks/nextjs
defaultValue: content/posts/comark-syntax.md
---
::

::browser{src="https://comark-nextjs.vercel.app/blog/comark-syntax"}
::

This example demonstrates how to use Comark with Next.js App Router and React Server Components. Blog posts are stored as `.md` files with frontmatter, parsed using `parse()` from comark, and rendered using `ComarkRenderer` from `comark/react` with custom components like `Alert`.

## How it works

- **File-based content** — Posts are plain `.md` files in `content/posts/` with YAML frontmatter for metadata (title, description, pubDate, tags).
- **Comark parsing** — `lib/posts.ts` reads markdown files and uses `parse()` to build the AST and extract frontmatter — replacing the usual `gray-matter` + `remark` + `rehype` pipeline.
- **Static generation** — `generateStaticParams` pre-renders all blog posts at build time via `output: 'export'`.
- **React rendering** — `ComarkRenderer` from `comark/react` renders the AST using React Server Components, including custom ones like `Alert`. No client-side JavaScript is shipped for content rendering.
