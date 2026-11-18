---
title: 'React Markdown Example with Vite'
description: 'A React and Vite app that renders a Markdown blog, component syntax examples, and a live editor with Comark.'
navigation:
  title: 'React'
  icon: i-simple-icons-react
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/2.vite/react
defaultValue: src/App.tsx
---
::

This example renders a Markdown blog, component syntax examples, and a live editor in React with Vite. Pass a Markdown string to `<Markdown>` from `@comark/react` to parse and render in one step, or parse ahead of time with `parseMarkdown()` and pass the document to `<MarkdownDocument>`.
