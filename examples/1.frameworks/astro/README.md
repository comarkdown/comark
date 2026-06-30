---
title: Astro
description: A blog example using Comark with Astro content collections and React components.
navigation:
  icon: i-simple-icons:astro
category: Frameworks
path: /examples/frameworks/astro
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/1.frameworks/astro
defaultValue: src/content/posts/comark-syntax.md
---
::

This example demonstrates how to use Comark with Astro content collections and React components. Blog posts are stored as `.md` files with Zod-validated frontmatter, loaded via the `glob()` loader, and rendered using `ComarkRenderer` from `comark/react` with custom components like `Alert`.

## How it works

- **Content collections** — Posts are defined with `glob()` loader and a Zod schema for type-safe frontmatter (title, description, pubDate, tags).
- **Comark parsing** — In the blog post page, `parse()` converts the raw Markdown body into a Comark AST.
- **React rendering** — `ComarkRenderer` from `comark/react` renders the AST using React components, including custom ones like `Alert`. Thanks to Astro's React integration, these are server-rendered with zero client-side JavaScript.
