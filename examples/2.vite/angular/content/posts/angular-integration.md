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
2. **Parse with Comark** — Call `parse()` to build the AST and extract frontmatter
3. **Route with Angular Router** — Hash-based routing for a zero-config static SPA
4. **Render with Angular** — Use `ComarkRendererComponent` from `@comark/angular` with explicit component mapping

```ts
// src/app/lib/posts.ts
import { parse } from 'comark'
import highlight from 'comark/plugins/highlight'

const rawFiles = import.meta.glob(
  '../../../content/posts/*.md',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>

export async function getPost(slug: string) {
  const content = Object.entries(rawFiles)
    .find(([path]) => path.endsWith(`${slug}.md`))?.[1]

  const tree = await parse(content!, { plugins: [highlight()] })
  return { slug, tree, ...tree.frontmatter }
}
```

```ts
// src/app/pages/blog-post.component.ts
@Component({
  imports: [ComarkRendererComponent],
  template: `
    @if (post) {
      <comark-renderer [tree]="post.tree" [components]="components" />
    }
  `,
})
export class BlogPostComponent { /* ... */ }
```

::alert{type="info"}
Since this is a client-side SPA, `parse()` runs in the browser. Markdown files are bundled as raw strings at build time via `import.meta.glob`.
::

## Custom components

Pass custom components via the `components` input on `<comark-renderer>`. Each component receives props as `@Input()` values and children via `<ng-content />`:

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
