---
title: SvelteKit
description: A SvelteKit example showing Comark with lazy components, ComarkAsync, and SSR.
navigation:
  icon: i-simple-icons-svelte
category: Frameworks
path: /examples/frameworks/sveltekit
---

::code-explorer
---
org: comarkdown
repo: comark@c78885ca7504b38afc7ced59aac1a3c6b3cc5425
path: examples/1.frameworks/sveltekit
defaultValue: 'src/routes/+page.svelte'
---
::

::Browser{src="https://comark-sveltekit.vercel.app"}
::

This example demonstrates how to use Comark with SvelteKit and server-side rendering.

## How it works

- **Lazy SSR route** — `/` renders markdown with `<ComarkAsync>` and resolves custom components through an explicit dynamic import map.
- **Stable SSR route** — `/stable` parses markdown in `+page.server.ts` and renders the AST with `<ComarkRenderer>`.
- **Scoped Markdown components** — components rendered from Comark live in `src/lib/components/comark/`, separate from normal app UI components.
- **Component manifest** — the examples show when to return dynamic imports and when to use eager/static entries for synchronous SSR.

Run locally:

```bash
pnpm --filter comark-sveltekit dev
```
