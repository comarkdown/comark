---
title: 'Comark Components in VitePress'
description: Add Comark component and attribute syntax to VitePress through its markdown-it configuration.
navigation:
  title: 'VitePress'
  icon: i-simple-icons-vitepress
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/1.frameworks/vitepress
defaultValue: demo.md
---
::

This example adds Comark's `::` component syntax directly to VitePress without a wrapper component or custom renderer.

## How it works

- **markdown-it plugins**: `.vitepress/config.ts` registers `markdownItComponents` from `comark/plugins/components` and `markdownItAttributes` from `comark/plugins/attributes` inside `markdown.config(md)`.
- **Global component registration**: Vue components such as `Alert` register globally in the VitePress theme through `enhanceApp`, so `::alert{type="info"}` renders `<Alert>`.
- **VitePress Markdown compatibility**: Comark blocks and attributes work alongside VitePress code blocks, tables, custom containers, and GitHub alerts because both run on markdown-it.
