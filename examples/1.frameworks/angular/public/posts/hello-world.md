---
title: Hello world
description: Getting started with Comark and Angular.
pubDate: 2025-12-01
tags: [comark, angular]
---

Welcome to this blog built with **Comark** and Angular.

Comark adds component and attribute syntax to Markdown and renders through Angular components. The Markdown files load with `fetch`, parse with `parseMarkdown()`, and render with `MarkdownDocument` from `@comark/angular`.

::alert{type="info"}
This alert renders through a custom Angular component. Parser code stays out of the template.
::

## Why pair Comark with Angular

- **Standalone components**: `MarkdownDocument` drops into any standalone component's `imports`.
- **Config providers**: `defineMarkdownDocumentComponent()` registers plugins and component mappings through Angular DI.
- **Component syntax**: write `::alert` and `::feature-card` blocks directly in `.md` files.

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument, defineMarkdownDocumentComponent } from '@comark/angular'

const document = await parseMarkdown(markdown)
// providers: [defineMarkdownDocumentComponent({ components: { Alert } })]
```

::alert{type="success"}
Angular handles routing and the build while Comark parses frontmatter, highlights code, and renders custom components.
::
