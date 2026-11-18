# Live Markdown to HTML preview

This example builds a split-pane live Markdown editor in Vite using `@comark/html`, Shiki, KaTeX, and Mermaid. Typing Comark Markdown on the left renders HTML into a sandboxed `<iframe>` preview on the right.

## How it works

- **HTML renderer**: `createHtmlRenderer()` from `@comark/html` configures `shiki()`, `math()`, and `mermaid()` along with the `Math` and `Mermaid` HTML components.
- **Debounced updates**: `input` events debounce for 150 ms before calling `renderHtml(markdown)`.
- **Isolated preview**: `frame.srcdoc` injects KaTeX styles, preview typography styles, and the rendered HTML string into `<iframe sandbox="allow-same-origin">`.

```ts
import { createHtmlRenderer } from '@comark/html'
import shiki from '@comark/html/plugins/shiki'
import math, { Math } from '@comark/html/plugins/math'
import mermaid, { Mermaid } from '@comark/html/plugins/mermaid'

const renderHtml = createHtmlRenderer({
  plugins: [shiki(), math(), mermaid()],
  components: { Math, Mermaid },
})

const html = await renderHtml(markdown)
```

## Run locally

From the monorepo root:

```bash
pnpm dev:html
```

## Documentation

- [Comark documentation](https://comark.dev)
- [HTML rendering](https://comark.dev/rendering/html)
