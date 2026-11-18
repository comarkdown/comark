---
title: 'Angular Markdown Example with Vite'
description: 'An Angular and Vite app that renders a Markdown blog, component syntax examples, and a live editor with Comark.'
navigation:
  title: 'Angular'
  icon: i-simple-icons-angular
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/2.vite/angular
defaultValue: src/main.ts
---
::

This example renders a Markdown blog, component syntax examples, and a live editor in Angular with Vite. Pass a Markdown string to `<comark-markdown [value]="content">` to parse and render in one step, or parse ahead of time with `parseMarkdown()` and pass the document to `<comark-markdown-document>`.
