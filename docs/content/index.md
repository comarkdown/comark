---
navigation: false
title: Parse and Render Markdown Anywhere with Comark
description: 'A JavaScript library to parse and stream Markdown, with renderers for HTML, terminals, Vue, React, Svelte and Angular, plus components, attributes, and plugins.'
seo:
  title: Parse and Render Markdown Anywhere with Comark
  description: 'Parse and render Markdown anywhere with one JavaScript library for HTML, ANSI, Vue, React, Svelte and Angular, plus plugins and streaming.'
  ogImage: /social-card.jpg
---

::u-page-hero
---
orientation: horizontal
---
  :::landing-hero-demo
  ---
  playground: /play/editor?example=all-features
  source: |-
    # Hello World

    A JavaScript library to **parse and render Markdown** anywhere.

    ```ts
    import { parseMarkdown } from 'comark'

    const doc = await parseMarkdown('# Hello **World**')
    ```

    ## Features

    - CommonMark and GFM support
    - HTML, ANSI, and framework renderers
    - Streaming, components, and plugins

    ::callout{icon="i-lucide-info"}
    Built on markdown-exit, a TypeScript rewrite of markdown-it.
    ::
  ---
  :::
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

::landing-features
#headline
Renderers

#title
Parse once, render anywhere

#description
Comark parses Markdown into a compact [`MarkdownDocument`](/getting-started/document-model). Parse on the server, during a build, or as content streams in, then render it natively in your framework. Your content outlasts your stack.

#default
  :::landing-feature-card{icon="i-vscode-icons-file-type-html" to="/rendering/html" color="#e34f26"}
  #title
  HTML

  #description
  A plain string renderer for static site generators, RSS feeds or emails. No framework required.
  :::
  
  :::landing-feature-card{icon="i-lucide-terminal" to="/rendering/ansi" color="var(--ui-text-highlighted)"}
  #title
  Terminals

  #description
  Render Markdown as styled terminal output using ANSI escape codes, perfect for CLIs, scripts, and developer tooling.
  :::

  :::landing-feature-card{icon="i-logos-angular-icon" to="/rendering/angular" color="#dd0031"}
  #title
  Angular

  #description
  Standalone components for Angular 17+, with the same props and streaming support.
  :::
  
  :::landing-feature-card{icon="i-logos-react" to="/rendering/react" color="#61dafb"}
  #title
  React

  #description
  The same component API for React, including React Server Components and Next.js.
  :::
  
  :::landing-feature-card{icon="i-logos-vue" to="/rendering/vue" color="#42b883"}
  #title
  Vue

  #description
  Drop the `Markdown` component in a template. Custom components and plugins are props.
  :::

  :::landing-feature-card{icon="i-logos-svelte-icon" to="/rendering/svelte" color="#ff3e00"}
  #title
  Svelte

  #description
  Native Svelte 5 rendering with runes. No wrapper framework, no `{@html}`.
  :::

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
Auto-close completes unterminated Markdown so incomplete content renders correctly at every frame. Display AI responses as soon as they arrive, without flashes or broken markup.

#code-0
  :::landing-streaming-demo
  :::

#code-1
  :::landing-auto-close-demo
  :::
::

::landing-tabs
---
reverse: true
items:
  - icon: i-lucide-code
    title: Shiki
    description: Syntax highlighting for code blocks, with multi-theme support and on-demand language loading.
  - icon: i-lucide-braces
    title: JSON Render
    description: Declarative UI specs in json-render code blocks, turned into real components.
  - icon: i-simple-icons-mermaid
    title: Mermaid
    description: Flowcharts and diagrams rendered from mermaid code blocks.
---

#headline
Plugins

#title
Use official plugins, or write your own

#description
Official plugins add syntax highlighting, math, diagrams, table of contents, and more. Write your own against the plugin API or [browse all plugins](/plugins).

#code-0
  ```ts [highlight.ts]
  import { parseMarkdown } from 'comark'
  import shiki from 'comark/plugins/shiki'
  import githubDark from '@shikijs/themes/github-dark'
  import githubLight from '@shikijs/themes/github-light'

  const document = await parseMarkdown(content, {
    plugins: [
      shiki({
        themes: { light: githubLight, dark: githubDark }
      })
    ]
  })
  ```

#code-1
  ```tsx [Dashboard.tsx]
  import { Markdown } from '@comark/react'
  import jsonRender from '@comark/react/plugins/json-render'

  export function Dashboard({ content }: { content: string }) {
    return (
      <Markdown plugins={[jsonRender()]}>
        {content}
      </Markdown>
    )
  }
  ```

#code-2
  ```vue [Diagram.vue]
  <script setup lang="ts">
  import { Markdown } from '@comark/vue'
  import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'

  defineProps<{ content: string }>()
  </script>

  <template>
    <Suspense>
      <Markdown
        :components="{ mermaid: Mermaid }"
        :plugins="[mermaid()]"
      >
        {{ content }}
      </Markdown>
    </Suspense>
  </template>
  ```
::

::landing-tabs
---
items:
  - icon: i-lucide-component
    title: Components
    description: Block and inline components with props, slots, and nested Markdown.
  - icon: i-lucide-tag
    title: Attributes
    description: Classes, IDs, and data attributes on any native Markdown element.
  - icon: i-lucide-list
    title: Frontmatter
    description: A leading YAML block parsed into metadata you can bind to component props.
---

#headline
Syntax

#title
[Co]{.font-bold}[mponents in ]{.text-muted} [Mark]{.font-bold}[down]{.text-muted}

#description
Discover our opt-in syntax for components, attributes, and frontmatter, handled by default plugins you can turn off. CommonMark and GFM  are supported by default, so every Markdown file you already have keeps working. 

#code-0
  ```mdc [components.md]
  ::alert{type="info"}
  This is an **important** message.
  ::

  ::card{title="My Card"}
  Card content with full **markdown** support.
  ::

  Click the :button[Submit]{type="primary"} to continue.
  ```

#code-1
  ```mdc [attributes.md]
  **bold text**{.highlight #important}

  [Read the docs](/getting-started/introduction){.button target="_blank"}

  ![Logo](logo.svg){.responsive width="800" height="600"}

  Wrap [any inline text]{.text-primary} in a span.
  ```

#code-2
  ```mdc [article.md]
  ---
  title: My Article
  author: Jane Doe
  tags:
    - markdown
  ---

  # My Article

  Written by :badge{:label="frontmatter.author"}.
  ```
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
