---
title: HTML Preview
description: A live markdown editor that renders Comark content to HTML and displays it in a sandboxed iframe preview, with syntax highlighting support.
navigation:
  icon:  i-lucide-file-code
category: Vite
path: /examples/vite/html
---

::code-explorer
---
org: comarkdown
repo: comark@81a416b278b0f304d7e7577c7ac6bbfc78414790
path: examples/2.vite/html
defaultValue: src/main.ts
---
::

This example shows a split-pane live preview: write Comark markdown on the left and see it rendered as styled HTML in a sandboxed `<iframe>` on the right. The `highlight` plugin enables syntax highlighting for code blocks. Custom styles are injected into the iframe via `srcdoc` for proper CSS isolation.
