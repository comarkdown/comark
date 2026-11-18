---
title: Hello world
description: Getting started with Comark, React, and Vite.
pubDate: 2025-12-01
tags: [comark, react]
---

Welcome to this blog built with **Comark**, React, and Vite.

Comark adds component and attribute syntax to Markdown and renders nodes to React elements without `dangerouslySetInnerHTML`.

::Alert{type="info"}
This alert renders through a React component mapped in the `components` prop.
::

## Why pair Comark with React

- **React element output**: Comark creates React elements directly, so custom components receive typed props and `children`.
- **Component syntax**: write `::Alert` blocks inside `.md` files and render them alongside standard Markdown.
- **Vite dev server**: bundles raw `.md` files with `import.meta.glob` and updates on save with HMR.

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/react'

const tree = await parseMarkdown(markdown)
// <MarkdownDocument value={tree} components={{ Alert }} />
```

::Alert{type="success"}
React manages state and component composition while Comark parses Markdown and maps tags to components.
::
