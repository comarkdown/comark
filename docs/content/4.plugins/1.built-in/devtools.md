---
title: Vite DevTools
description: Interactive Comark playground panel inside Vite DevTools for real-time markdown editing and AST inspection.
seo:
  title: Vite DevTools Plugin
navigation:
  icon: i-lucide-wrench
links:
  - label: Vite DevTools
    icon: i-lucide-external-link
    to: https://devtools.vite.dev/
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The Vite DevTools plugin registers an interactive Comark panel inside [Vite DevTools](https://devtools.vite.dev/). It provides a markdown editor with Shiki syntax highlighting, live AST inspection, and push-to-app editing.

## Setup

Install the `@vitejs/devtools` peer dependency alongside `comark`:

::code-group

```bash [pnpm]
pnpm add -D @vitejs/devtools
```

```bash [npm]
npm install -D @vitejs/devtools
```

```bash [yarn]
yarn add -D @vitejs/devtools
```

::

Add both plugins to your Vite config:

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { DevTools } from '@vitejs/devtools'
import { comarkDevtools } from 'comark/vite'

export default defineConfig({
  plugins: [
    DevTools(),
    comarkDevtools(),
  ],
})
```

> [!TIP]
> If you use `@comark/vue`, its Vite plugin already includes `comarkDevtools()` automatically — no extra config needed:
> ```ts [vite.config.ts]
> import { defineConfig } from 'vite'
> import vue from '@vitejs/plugin-vue'
> import { DevTools } from '@vitejs/devtools'
> import comark from '@comark/vue/vite'
>
> export default defineConfig({
>   plugins: [vue(), DevTools(), comark()],
> })
> ```

## Features

### Markdown Editor

The panel includes a markdown editor with [Shiki](https://shiki.style/)-powered syntax highlighting using the `mdc` grammar. A transparent `<textarea>` overlays a syntax-highlighted `<pre>` element, providing native editing (cursor, selection, undo/redo) with rich colors.

Highlighting updates are near-instant (16ms debounce) via a dedicated Shiki RPC call, while instance updates are debounced at 300ms to avoid excessive parsing. If Shiki is unavailable, a regex-based fallback highlighter provides basic coloring.

### AST Tab

Displays the full parsed AST as syntax-highlighted JSON. Useful for understanding how Comark transforms your markdown and inspecting node structure.

### Push to App

When a live `<Comark>` instance is connected, edits in the devtools editor are pushed to the running application in real time. The Vite plugin parses the markdown on the server and broadcasts the updated tree to the browser via HMR, where the framework renderer (Vue, React, or Svelte) re-renders the component with the new content.

Parse errors during editing (e.g. malformed frontmatter YAML) are caught gracefully — the previous tree is preserved so the editor never breaks mid-edit.

### Live Instance Connection

When a Comark component (`<Comark>` from `@comark/vue`, `@comark/react`, or `@comark/svelte`) is mounted on the page, the DevTools panel automatically detects it via polling.

A green dot in the instance bar indicates a connected instance. The editor loads the instance's current markdown source so you can inspect and experiment with it.

## How It Works

The devtools integration has three layers:

| Layer | Module | Role |
|---|---|---|
| **Registry** | `comark/devtools` | Browser-side singleton that tracks live Comark instances and communicates with the dev server via HMR |
| **Vite Plugin** | `comark/vite` | Dev server plugin that exposes RPC endpoints for parsing, rendering, and listing instances |
| **Renderer** | `comark/devtools-renderer` | UI panel rendered inside the Vite DevTools iframe |

### Instance Registration

Framework renderers automatically register with the devtools registry in dev mode. Registration is guarded behind `import.meta.hot` so it's tree-shaken in production builds.

```ts
// Simplified registration flow (handled internally by each renderer)
import { registerDevtoolsInstance } from 'comark/devtools'

const handle = await registerDevtoolsInstance({
  hot: import.meta.hot,
  tree: parsedTree,
  markdown: sourceMarkdown,
})

// Update when tree changes
handle.update({ tree: newTree, markdown: newMarkdown })

// Cleanup on unmount
handle.unregister()
```

### RPC Endpoints

The Vite plugin registers three RPC endpoints:

| Endpoint | Type | Description |
|---|---|---|
| `comark:highlight` | query | Syntax-highlight markdown via Shiki with the `mdc` grammar (dual light/dark themes) |
| `comark:list-instances` | query | List all registered Comark instances on the page |
| `comark:update-instance` | mutation | Parse markdown and broadcast the updated tree to the live instance via HMR |

## Theme Support

The panel includes a theme toggle (light/dark/auto) in the top-right corner. Auto mode follows the system preference via `prefers-color-scheme`.
