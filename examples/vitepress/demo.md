# Comark Demo

This page uses [Comark syntax](https://github.com/comarkdown/comark) directly in VitePress Markdown — no wrapper component needed.

The `markdown-it-mdc` plugin is added to VitePress's markdown-it config, enabling the `::` component syntax natively.

## Alerts

::alert{type="info"}
This is an **info** alert rendered using a Vue component registered in the VitePress theme.
::

::alert{type="success"}
Comark's component syntax works natively alongside VitePress's own Markdown features.
::

::alert{type="warning"}
Make sure to register your components globally in the VitePress theme.
::

::alert{type="danger"}
This is a danger alert — useful for critical warnings.
::

## How it works

1. Add `markdown-it-mdc` to VitePress's markdown-it config
2. Register Vue components globally in the theme
3. Write `::component{props}` syntax directly in your `.md` files

```ts
// .vitepress/config.ts
import pluginMdc from 'markdown-it-mdc'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(pluginMdc)
    },
  },
})
```

## Mixed content

You can mix Comark components with standard VitePress Markdown features:

- **Bold**, *italic*, and `inline code`
- [Links](https://github.com/comarkdown/comark) work as expected
- Tables, code blocks, and all VitePress extensions are unaffected

::alert{type="info"}
This alert sits right next to standard Markdown — everything coexists naturally.
::
