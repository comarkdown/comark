---
title: 'SvelteKit Markdown with SSR and Lazy Components'
description: Render Markdown on the server in SvelteKit with lazy components, MarkdownAsync, and MarkdownDocument.
navigation:
  title: 'SvelteKit'
  icon: i-simple-icons-svelte
---

::code-explorer
---
org: comarkdown
repo: comark@c78885ca7504b38afc7ced59aac1a3c6b3cc5425
path: examples/1.frameworks/sveltekit
defaultValue: 'src/routes/+page.svelte'
---
::

::browser{src="https://comark-sveltekit.vercel.app"}
::

This example renders Markdown in SvelteKit using two server-side rendering setups: experimental async components and synchronous `load()` parsing.

## How it works

- **Lazy SSR route**: `/` renders Markdown with `<MarkdownAsync>` from `@comark/svelte/async` and loads custom components on demand through a dynamic import map.
- **Stable SSR route**: `/stable` parses Markdown inside `+page.server.ts` and passes the serialized document to `<MarkdownDocument>`.
- **Scoped Markdown components**: components exposed to Markdown live in `src/lib/components/comark/`, separate from application layout components.
- **Component manifest**: compares dynamic imports for async SSR with static imports for synchronous SSR.

Run locally from the monorepo root:

```bash
pnpm --filter comark-sveltekit dev
```
