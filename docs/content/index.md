---
navigation: false
title: Comark
description: 'Parse and render Markdown anywhere with one JavaScript library for HTML, ANSI, Vue, React, Svelte and Angular, plus plugins and streaming.'
seo:
  title: Parse and Render Markdown Anywhere with Comark
  description: 'Parse and render Markdown anywhere with one JavaScript library for HTML, ANSI, Vue, React, Svelte and Angular, plus plugins and streaming.'
  ogImage: /social-card.jpg
---

::u-page-hero
---
orientation: horizontal
---
  ```ts [markdown.ts]
  import { parseMarkdown } from 'comark'
  import { renderHtmlFromDocument } from '@comark/html'

  // Parse once into a compact, serializable document
  const document = await parseMarkdown('# Hello **World**')

  // Render anywhere: HTML, ANSI, Vue, React,
  // Svelte or Angular
  const html = await renderHtmlFromDocument(document)
  ```
#title
Parse and render Markdown anywhere.

#description
A JavaScript library to parse and stream Markdown, with renderers for HTML, terminals, Vue, React, Svelte and Angular, plus components, attributes, and plugins.

#links
  :::u-button
  ---
  to: /getting-started/introduction
  size: lg
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  icon: i-simple-icons-github
  color: neutral
  variant: ghost
  size: lg
  to: https://github.com/comarkdown/comark
  target: _blank
  ---
  View on GitHub
  :::
::

::landing-stack
---
items:
  - icon: i-logos-vue
    label: Vue
    to: /rendering/vue
  - icon: i-logos-react
    label: React
    to: /rendering/react
  - icon: i-logos-svelte-icon
    label: Svelte
    to: /rendering/svelte
  - icon: i-logos-angular-icon
    label: Angular
    to: /rendering/angular
  - icon: i-logos-nuxt-icon
    label: Nuxt
    to: /rendering/nuxt
  - icon: i-vscode-icons-file-type-html
    label: HTML
    to: /rendering/html
  - icon: i-lucide-terminal
    label: ANSI
    to: /rendering/ansi
---
One parser, every renderer
::

::landing-tabs
---
items:
  - icon: i-logos-vue
    title: Vue
    description: Drop the Markdown component in a template. Custom components and plugins are props.
  - icon: i-logos-react
    title: React
    description: The same component API for React and React Server Components.
  - icon: i-logos-svelte-icon
    title: Svelte
    description: Native Svelte 5 rendering with runes, no wrapper framework.
  - icon: i-vscode-icons-file-type-html
    title: HTML
    description: A plain string renderer for SSG, RSS feeds, and emails. No framework required.
---

#headline
Renderers

#title
Same document, native output

#description
Parsing and rendering are decoupled through a compact, serializable [`MarkdownDocument`](/getting-started/document-model). Parse on the server, during a build, or as content streams in, then render it natively in your framework. Your content outlasts your stack.

#code-0
  ```vue [App.vue]
  <script setup lang="ts">
  import { Markdown } from '@comark/vue'

  const content = `# Hello

  Rendered **natively** in Vue.`
  </script>

  <template>
    <Markdown>{{ content }}</Markdown>
  </template>
  ```

#code-1
  ```tsx [App.tsx]
  import { Markdown } from '@comark/react'

  const content = `# Hello

  Rendered **natively** in React.`

  export default function App() {
    return <Markdown>{content}</Markdown>
  }
  ```

#code-2
  ```svelte [App.svelte]
  <script lang="ts">
    import { Markdown } from '@comark/svelte'

    let content = $state(`# Hello

  Rendered **natively** in Svelte.`)
  </script>

  <Markdown value={content} />
  ```

#code-3
  ```ts [render.ts]
  import { renderHtml } from '@comark/html'

  const html = await renderHtml(`# Hello

  Rendered to a **plain HTML** string.`)
  ```
::

::landing-tabs
---
items:
  - icon: i-lucide-radio
    title: Streaming component
    description: Flip the streaming prop while chunks arrive. Every frame renders correctly, with an optional caret.
  - icon: i-lucide-scan-text
    title: Auto-close
    description: A pure function that completes unterminated syntax. Use it with any renderer, or on its own.
---

#headline
Streaming

#title
Built for AI output

#description
Auto-close completes unterminated Markdown (bold, code fences, components) so incomplete content renders correctly at every frame. Display AI responses as soon as they arrive, without flashes or broken markup.

#code-0
  ```vue [AiChat.vue]
  <script setup lang="ts">
  import { Markdown } from '@comark/vue'

  const content = ref('')
  const isStreaming = ref(true)

  for await (const chunk of aiResponse) {
    content.value += chunk
  }
  isStreaming.value = false
  </script>

  <template>
    <Markdown :streaming="isStreaming" caret>
      {{ content }}
    </Markdown>
  </template>
  ```

#code-1
  ```ts [auto-close.ts]
  import { autoCloseMarkdown } from 'comark'

  autoCloseMarkdown('**bold text')
  // => '**bold text**'

  autoCloseMarkdown('::alert{type="info"}\nStreaming')
  // => '::alert{type="info"}\nStreaming\n::'
  ```
::

::landing-features
#headline
Why Comark

#title
One Markdown pipeline, every output

#default
  :::landing-feature-card{icon="i-lucide-zap" to="/api/parse"}
  #title
  Runtime parsing

  #description
  No build step required. Parse Markdown on the server, in the browser, in a worker, or during a build.
  :::

  :::landing-feature-card{icon="i-lucide-radio" to="/api/auto-close"}
  #title
  Streaming built in

  #description
  Auto-close renders incomplete Markdown correctly at every frame. Display AI output as soon as it arrives.
  :::

  :::landing-feature-card{icon="i-lucide-layers" to="/getting-started/installation"}
  #title
  One parser, every renderer

  #description
  The same source renders to HTML, ANSI, Vue, React, Svelte and Angular. Your content outlasts your framework.
  :::

  :::landing-feature-card{icon="i-lucide-file-text" to="/syntax/markdown"}
  #title
  Still just Markdown

  #description
  CommonMark and GFM by default. Attributes and components are opt-in syntax, not a new language.
  :::

  :::landing-feature-card{icon="i-lucide-puzzle" to="/plugins"}
  #title
  Plugin ecosystem

  #description
  Compatible with markdown-it plugins. Shiki highlighting, KaTeX math, Mermaid diagrams, table of contents and more.
  :::

  :::landing-feature-card{icon="i-lucide-braces" to="/getting-started/document-model"}
  #title
  Serializable document

  #description
  Parse to a plain MarkdownDocument that is easy to traverse, cache, serialize, and send over the wire.
  :::
::

::landing-faq
---
items:
  - label: How is Comark different from MDX?
    content: MDX compiles Markdown to JSX at build time, tying content to a bundler and to React. Comark parses Markdown into serializable data at build time or runtime, then renders it to multiple targets.
  - label: Does Comark require a specific framework?
    content: No. The core parser is framework-free. Renderers exist for Vue, React, Svelte, and Angular, plus string output as HTML and ANSI.
  - label: Can I use markdown-it plugins with Comark?
    content: Yes. Comark is built on markdown-exit, a TypeScript rewrite of markdown-it that preserves its plugin API. Existing markdown-it plugins work alongside Comark plugins.
  - label: How does Comark handle streaming AI output?
    content: The auto-close parser completes unterminated syntax (bold, code fences, components) so every incomplete frame renders correctly. Framework renderers expose this as a streaming prop.
  - label: Do I have to use components?
    content: No. Comark is a superset of CommonMark and GFM, so plain Markdown parses unchanged. Components and attributes are opt-in syntax.
  - label: Is it free?
    content: Yes. MIT-licensed open source, maintained by Vercel. Your only costs are your own hosting.
---

#headline
FAQ

#title
Common questions
::

::landing-cta
#title
From Markdown to UI.

#description
Install Comark, pick a renderer, and render your first Markdown document in minutes. Read [why Comark](/kb/why-comark) exists, or start with the [document model](/getting-started/document-model).

#links
  :::u-button
  ---
  to: /getting-started/introduction
  trailing-icon: i-lucide-arrow-right
  size: lg
  ---
  Get started
  :::

  :::u-button
  ---
  to: /kb/why-comark
  color: neutral
  variant: outline
  size: lg
  ---
  Why Comark
  :::
::
