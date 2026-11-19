---
title: Examples
description: Runnable Comark examples across frameworks, Vite setups, plugins, and AI streaming.
navigation:
  title: Examples
seo:
  title: "Comark examples for Vue, React, Svelte, Angular, and more"
  description: "Runnable Comark examples across frameworks, Vite setups, plugins, and AI streaming, each with browsable source."
---

Each example wires Comark into a framework or build setup, with its full source browsable inline.

## Frameworks

::card-group{cols="2"}
  :::card{icon="i-simple-icons:astro" title="Astro" to="/examples/frameworks/astro"}
  Render a Markdown blog with Astro content collections, Zod schemas, and React components.
  :::
  :::card{icon="i-simple-icons:nextdotjs" title="Next.js" to="/examples/frameworks/nextjs"}
  Render a Markdown blog with the Next.js App Router and React Server Components.
  :::
  :::card{icon="i-simple-icons-nuxt" title="Nuxt" to="/examples/frameworks/nuxt"}
  Render Comark component syntax with Nuxt UI prose components through the `@comark/vue` Nuxt module.
  :::
  :::card{icon="i-simple-icons-svelte" title="SvelteKit" to="/examples/frameworks/sveltekit"}
  Render Markdown on the server in SvelteKit with lazy components and `MarkdownAsync`.
  :::
  :::card{icon="i-simple-icons-vitepress" title="VitePress" to="/examples/frameworks/vitepress"}
  Add Comark component and attribute syntax to VitePress through its markdown-it configuration.
  :::
::

## Vite

::card-group{cols="2"}
  :::card{icon="i-simple-icons-angular" title="Angular" to="/examples/vite/angular"}
  Render a Markdown blog, component syntax examples, and a live editor with Angular and Vite.
  :::
  :::card{icon="i-lucide-file-code" title="HTML preview" to="/examples/vite/html"}
  Edit Comark Markdown in a split pane and preview the rendered HTML inside a sandboxed iframe.
  :::
  :::card{icon="i-simple-icons-react" title="React" to="/examples/vite/react"}
  Render a Markdown blog, component syntax examples, and a live editor with React and Vite.
  :::
  :::card{icon="i-simple-icons-svelte" title="Svelte" to="/examples/vite/svelte"}
  Render a Markdown blog, component syntax examples, and a live editor with Svelte 5 and Vite.
  :::
  :::card{icon="i-simple-icons-vuedotjs" title="Vue" to="/examples/vite/vue"}
  Render a Markdown blog, component syntax examples, and a live editor with Vue and Vite.
  :::
::

## Plugins

::card-group{cols="2"}
  :::card{icon="i-lucide-calculator" title="Math formulas" to="/examples/plugins/react-vite-math"}
  Render inline and display LaTeX math formulas in React and Vite with KaTeX.
  :::
  :::card{icon="i-simple-icons-mermaid" title="Mermaid diagrams" to="/examples/plugins/react-vite-mermaid"}
  Render Mermaid diagrams from fenced code blocks in React and Vite.
  :::
  :::card{icon="i-lucide-replace" title="Binding (frontmatter + data)" to="/examples/plugins/vue-vite-binding"}
  Interpolate frontmatter and reactive data into Markdown with the `binding` plugin in Vue and Vite.
  :::
  :::card{icon="i-lucide-code" title="Syntax highlighting" to="/examples/plugins/vue-vite-highlight"}
  Highlight code blocks in light and dark themes with Shiki in Vue and Vite.
  :::
  :::card{icon="i-lucide-braces" title="JSON Render" to="/examples/plugins/vue-vite-json-render"}
  Render UI component trees from JSON Render and YAML specs in Vue and Vite.
  :::
  :::card{icon="i-lucide-calculator" title="Math formulas" to="/examples/plugins/vue-vite-math"}
  Render inline and display LaTeX math formulas in Vue and Vite with KaTeX.
  :::
  :::card{icon="i-simple-icons-mermaid" title="Mermaid diagrams" to="/examples/plugins/vue-vite-mermaid"}
  Render Mermaid diagrams from fenced code blocks in Vue and Vite.
  :::
  :::card{icon="i-lucide-quote" title="Punctuation" to="/examples/plugins/vue-vite-punctuation"}
  Convert plain-text quotes, dashes, ellipses, and symbols into typographic characters in Vue and Vite.
  :::
::

## AI

::card-group{cols="2"}
  :::card{icon="i-simple-icons-vercel" title="AI SDK" to="/examples/ai/nuxt-ai-sdk"}
  Stream AI chat responses in Nuxt and render each message part live with Comark.
  :::
::
