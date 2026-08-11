---
title: Integrating Comark with Angular + Vite
description: How the Comark + Angular + Vite integration works under the hood.
pubDate: 2026-01-10
tags: [comark, angular, integration]
---

This example uses Angular 17+ with Vite (via Analog) and Comark as the Markdown renderer.

## How it works

Instead of the typical `gray-matter` + `remark` + `rehype` pipeline, we use Comark's framework-agnostic API:

1. **Load markdown files** — Use Vite's `import.meta.glob` with `?raw` to eagerly load `.md` files
2. **Parse with Comark** — Call `parseMarkdown()` to build the AST and extract frontmatter
3. **Route with Angular Router** — Hash-based routing for a zero-config static SPA
4. **Render with Angular** — Use `MarkdownDocument` from `@comark/angular` with explicit component mapping

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
export class BlogPostComponent { /* ... */ }
```

::alert{type="info"}
Since this is a client-side SPA, `parseMarkdown()` runs in the browser. Markdown files are bundled as raw strings at build time via `import.meta.glob`.
::

## Custom components

Pass custom components via the `components` input on `<comark-markdown-document>`. Each component receives props as `@Input()` values and children via `<ng-content />`:

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

This makes it easy to extend your Markdown with reusable, styled Angular components.
