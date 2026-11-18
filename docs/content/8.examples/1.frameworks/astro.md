---
title: 'Astro Markdown Blog with Comark'
description: Render a Markdown blog with Astro content collections, Zod frontmatter validation, and React components.
navigation:
  title: 'Astro'
  icon: i-simple-icons:astro
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/1.frameworks/astro
defaultValue: src/content/posts/comark-syntax.md
---
::

This example renders Markdown blog posts with Astro content collections and React components. Posts live as `.md` files with Zod-validated frontmatter, load through Astro's `glob()` loader, and render with `MarkdownDocument` from `@comark/react` and custom components such as `Alert`.

## How it works

- **Content collections**: `src/content.config.ts` defines the `posts` collection with `glob()` and a Zod schema for `title`, `description`, `pubDate`, and `tags`.
- **Comark parsing**: `src/pages/posts/[...id].astro` passes `post.body` to `parseMarkdown()` with the `shiki()` plugin to produce a `MarkdownDocument`.
- **Server rendering**: `MarkdownDocument` from `@comark/react` renders the document with React components on the server at build time, without shipping client-side JavaScript.
