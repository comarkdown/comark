# Mermaid diagrams in Vue and Vite

This example renders fenced `mermaid` code blocks as SVG diagrams in Vue and Vite using `@comark/vue/plugins/mermaid` and `beautiful-mermaid`.

## Features

- Parses fenced `mermaid` code blocks into `Mermaid` nodes with the `mermaid` plugin.
- Renders flowcharts, sequence diagrams, state diagrams, and class diagrams as SVG through the `Mermaid` Vue component.
- Accepts per-diagram theme, width, and height props in the fence info string.

## Usage

1. Import the `mermaid` plugin and `Mermaid` component:
   ```ts
   import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
   ```

2. Pass the plugin and component to `<Markdown>`:
   ```vue
   <Suspense>
     <Markdown
       :plugins="[mermaid()]"
       :components="{ Mermaid }"
     >
       {{ content }}
     </Markdown>
   </Suspense>
   ```

3. Add a `mermaid` code block to your Markdown:
   ````markdown
   ```mermaid
   graph TD
       A[Start] --> B[End]
   ```
   ````

## Run locally

From the monorepo root:

```bash
pnpm dev:vue:mermaid
```

## Learn more

- [Mermaid plugin documentation](https://comark.dev/plugins/built-in/mermaid)
- [Mermaid documentation](https://mermaid.js.org)
- [Comark documentation](https://comark.dev)
