# SvelteKit Markdown with SSR and lazy components

This example renders Markdown on the server in SvelteKit using `@comark/svelte` and `@comark/svelte/async`.

## How it works

- **Lazy SSR route**: `/` renders Markdown with `<MarkdownAsync>` and resolves custom components through a dynamic import map.
- **Stable SSR route**: `/stable` parses Markdown inside `+page.server.ts` and passes the serialized document to `<MarkdownDocument>`.
- **Scoped Markdown components**: components exposed to Markdown live in `src/lib/components/comark/`, separate from application layout components.
- **Component manifest**: compares dynamic imports for async SSR with static imports for synchronous SSR.

## Run locally

From the monorepo root:

```bash
pnpm dev:sveltekit
```

## Documentation

- [Comark documentation](https://comark.dev)
- [Svelte rendering](https://comark.dev/rendering/svelte)
