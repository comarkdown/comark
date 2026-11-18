# Comark demo

This page uses [Comark syntax](https://github.com/comarkdown/comark) directly in VitePress Markdown without a wrapper component.

VitePress loads `markdownItComponents` from `comark/plugins/components` and `markdownItAttributes` from `comark/plugins/attributes` in `.vitepress/config.ts`, so `::` block components parse during the standard VitePress build.

## Alerts

::alert{type="info"}
This **info** alert renders through a Vue component registered globally in the VitePress theme.
::

::alert{type="success"}
Comark component blocks work alongside VitePress's built-in Markdown extensions.
::

::alert{type="warning"}
Register custom Vue components globally in `.vitepress/theme/index.ts` so VitePress can resolve them in Markdown pages.
::

::alert{type="danger"}
Use a `danger` alert to call out breaking changes or destructive operations.
::

## How it works

1. Register `markdownItComponents` and `markdownItAttributes` in VitePress's `markdown.config(md)` hook.
2. Register Vue components globally in the VitePress theme.
3. Write `::component{props}` blocks directly in `.md` files.

```ts
// .vitepress/config.ts
import { markdownItComponents } from 'comark/plugins/components'
import { markdownItAttributes } from 'comark/plugins/attributes'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(markdownItComponents)
      md.use(markdownItAttributes)
    },
  },
})
```

## Mixed content

Comark components work alongside VitePress Markdown features on the same page:

- **Bold**, *italic*, and `inline code`
- [Links](https://github.com/comarkdown/comark)
- Tables, fenced code blocks, custom containers, and GitHub alerts

::alert{type="info"}
This alert sits next to standard VitePress lists and headings on the same page.
::
