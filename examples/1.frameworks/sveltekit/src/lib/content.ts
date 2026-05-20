export const lazyMarkdown = `
# Lazy SvelteKit SSR

This route renders markdown with \`<ComarkAsync>\`. Its custom components are resolved from an explicit dynamic import map.

::alert{type="warning"}
This alert is returned from \`componentsManifest\` as a dynamic import and is awaited during SvelteKit SSR.
::

::lazy-card{title="Lazy import rendered by SSR" accent="cyan"}
This component is loaded only when the \`lazy-card\` tag appears in the rendered markdown.
::
`.trim()

export const stableMarkdown = `
# Stable SvelteKit SSR

This route parses markdown in \`+page.server.ts\` and renders the AST with \`<ComarkRenderer>\`.

::alert{type="success"}
Use this pattern when you want stable, non-experimental SSR.
::

::lazy-card{title="Eager manifest entry" accent="emerald"}
This card is resolved synchronously from an eager manifest, so it can render during SSR without Svelte's experimental async support.
::
`.trim()
