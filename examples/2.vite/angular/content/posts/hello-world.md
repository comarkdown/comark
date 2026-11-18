---
title: Hello world
description: Getting started with Comark, Angular, and Vite.
pubDate: 2025-12-01
tags: [comark, angular]
---

Welcome to this blog built with **Comark**, Angular, and Vite.

Comark adds component and attribute syntax to Markdown and renders nodes directly into Angular standalone components.

::alert{type="info"}
This alert renders through an Angular standalone component registered in the `[components]` input.
::

## Why pair Comark with Angular

- **Standalone components**: uses Angular 21+ standalone components without NgModules.
- **Component syntax**: write `::alert` blocks directly in `.md` files and map them to Angular components.
- **Content projection**: nested Markdown children project into `<ng-content />`.
- **Vite dev server**: uses `@analogjs/vite-plugin-angular` for Vite builds and hot module replacement.

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/angular'

const document = await parseMarkdown(markdown)
// <comark-markdown-document [value]="document" [components]="components" />
```

::alert{type="success"}
Angular manages routing and component inputs while Comark parses Markdown and instantiates mapped components.
::
