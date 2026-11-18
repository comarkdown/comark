---
title: Integrating Comark with Angular
description: How this blog renders Markdown with Comark and Angular standalone components.
pubDate: 2026-01-10
tags: [comark, angular, integration]
---

This example pairs Angular CLI with `parseMarkdown()` and `@comark/angular`.

## How it works

Instead of chaining `gray-matter`, `remark`, and `rehype`, `src/app/lib/posts.ts` parses Markdown and frontmatter in a single call:

1. **Load Markdown files**: fetch `.md` files from `public/posts/` at runtime.
2. **Parse with Comark**: call `parseMarkdown()` with `shiki()` to build the `MarkdownDocument` and read `tree.frontmatter`.
3. **Render in a component**: pass the document to `MarkdownDocument` and register custom components through a config provider.

```ts
import { parseMarkdown } from 'comark'
import { MarkdownDocument, defineMarkdownDocumentComponent } from '@comark/angular'
import shiki from 'comark/plugins/shiki'
import { AlertComponent } from './components/alert.component'

const document = await parseMarkdown(markdown, {
  plugins: [shiki()],
})

// providers: [defineMarkdownDocumentComponent({ components: { alert: AlertComponent } })]
```

::alert{type="info"}
`defineMarkdownDocumentComponent()` returns a `Provider` for `MARKDOWN_DOCUMENT_CONFIG`. The static `MarkdownDocument` component stays in `imports`, which keeps Angular AOT happy (NG1010).
::

## Custom components

Register custom components in `defineMarkdownDocumentComponent()`. Each component receives resolved attributes as inputs and nested Markdown through `<ng-content />`:

```ts
@Component({
  selector: 'app-alert',
  template: `
    <div [class]="'alert alert-' + type" role="alert">
      <ng-content />
    </div>
  `,
})
export class AlertComponent {
  readonly type = input('info')
}
```

Instance-level inputs merge with the provider config and win on conflict. `transformNode` from the config runs before the instance transform.
