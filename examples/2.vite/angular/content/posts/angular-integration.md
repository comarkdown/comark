---
title: Integrating Comark with Angular and Vite
description: How this client-side SPA pairs Angular standalone components and Vite with Comark.
pubDate: 2026-01-10
tags: [comark, angular, integration]
---

This example uses Angular 21+ with Vite (through Analog) and `@comark/angular` as the Markdown renderer.

## How it works

Instead of chaining `gray-matter`, `remark`, and `rehype`, `src/app/lib/posts.ts` parses Markdown and frontmatter in a single call:

1. **Load Markdown files**: bundle `.md` files as raw strings at build time using Vite's `import.meta.glob` with `?raw`.
2. **Parse with Comark**: call `parseMarkdown()` with `shiki()` to build the `MarkdownDocument` and read `document.frontmatter`.
3. **Route with Angular Router**: configure hash-based routing (`withHashLocation()`) for static hosting.
4. **Render with Angular**: pass `post.tree` and a `components` map to `<comark-markdown-document>` from `@comark/angular`.

```ts
// src/app/lib/posts.ts
import { parseMarkdown } from 'comark'
import shiki from 'comark/plugins/shiki'

const rawFiles = import.meta.glob(
  '../../../content/posts/*.md',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>

export async function getPost(slug: string) {
  const content = Object.entries(rawFiles)
    .find(([path]) => path.endsWith(`${slug}.md`))?.[1]

  const document = await parseMarkdown(content!, { plugins: [shiki()] })
  return { slug, tree: document, ...document.frontmatter }
}
```

```ts
// src/app/pages/blog-post.component.ts
@Component({
  imports: [MarkdownDocument],
  template: `
    @if (post) {
      <comark-markdown-document [value]="post.tree" [components]="components" />
    }
  `,
})
export class BlogPostComponent { /* post loading omitted */ }
```

::alert{type="info"}
Because this app runs as a client-side SPA, `parseMarkdown()` executes in the browser against raw Markdown strings bundled by `import.meta.glob`.
::

## Custom components

Pass custom Angular components to `[components]` on `<comark-markdown-document>`. Each component receives attributes through `@Input()` properties and nested children through `<ng-content />`:

```ts
@Component({
  selector: 'app-alert',
  standalone: true,
  template: `
    <div class="alert" [class]="'alert-' + type" role="alert">
      <ng-content />
    </div>
  `,
})
export class AlertComponent {
  @Input() type: 'info' | 'warning' | 'error' | 'success' = 'info'
}
```
