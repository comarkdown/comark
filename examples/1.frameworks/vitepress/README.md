---
title: VitePress
description: Using Comark component syntax natively in VitePress via @comark/markdown-it.
navigation.icon: i-simple-icons-vitepress
category: Frameworks
path: /examples/frameworks/vitepress
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/1.frameworks/vitepress
defaultValue: demo.md
---
::

This example shows how to use Comark's `::` component syntax natively in VitePress — no wrapper component or custom renderer needed.

## How it works

- **`@comark/markdown-it` plugin** — Added to VitePress's markdown-it config via `markdown.config(md)`, this enables the `::component{props}` syntax at the markdown-it level.
- **Global component registration** — Vue components like `Alert` are registered globally in the VitePress theme via `enhanceApp`, so `::alert{type="info"}` resolves to the `<Alert>` component.
- **Native coexistence** — Comark syntax works alongside all VitePress Markdown features (code blocks, tables, custom containers, GitHub alerts, etc.) since both use markdown-it.
