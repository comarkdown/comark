---
navigation: false
title: Comark
description: 'The Markdown engine for the modern web. One parser, every renderer: Vue, React, Svelte, Angular, HTML and ANSI, with components, plugins and streaming.'
seo:
  title: The Markdown Engine for the Modern Web
  description: 'The Markdown engine for the modern web. One parser, every renderer: Vue, React, Svelte, Angular, HTML and ANSI, with components, plugins and streaming.'
  ogImage: /social-card.jpg

---

::landing-hero
---
title: The Markdown engine for the modern web
description: One parser, every renderer. Component syntax, attributes, plugins, and streaming, with decoupled parsing you can run on the server, the client, or mid-stream.
install: npm install comark
primaryLabel: Get Started
primaryTo: /getting-started/introduction
secondaryLabel: GitHub
secondaryTo: https://github.com/comarkdown/comark
demoMarkdown: |-
    # Hello World
  
    A **high-performance** markdown parser with _streaming_ support.
  
    ## Features
  
    - Parse markdown in real-time
    - Vue, React, Svelte, and Angular components
    - Auto-close incomplete syntax
  
    ::callout{color="info" icon="i-lucide-info"}
    Comark handles **components in markdown** natively.
    ::
  
    > Built for modern web applications.
  
    ```ts [example.ts]
    import { parseMarkdown } from 'comark'
  
    const tree = await parseMarkdown('# Hello **World**')
    ```
---
::

::landing-spacer
::

::landing-pillars
---
headline: Why Comark
title: Markdown as data, not code
description: Component syntax stays in plain text. Parsing happens at build time or runtime, your choice, and works across any renderer. Built on five years of MDC, the parser behind Nuxt Content.
pillars:
  - icon: i-lucide-zap
    title: Runtime parsing
    description: No build step. Parse Markdown with components on the server, in the browser, or in a worker. Content is live the moment it is saved.
    to: /api/parse
  - icon: i-lucide-radio
    title: Streaming built in
    description: Auto-close renders incomplete Markdown correctly at every frame. Pipe AI output straight into your component tree.
    to: /api/auto-close
  - icon: i-lucide-layers
    title: One parser, every renderer
    description: The same source renders to Vue, React, Svelte, Angular, Nuxt, HTML and ANSI. Your content outlasts your framework.
    to: /getting-started/installation
  - icon: i-lucide-file-text
    title: Still just Markdown
    description: CommonMark and GFM by default. Attributes and components are opt-in syntax, not a new language.
    to: /syntax/markdown
  - icon: i-lucide-puzzle
    title: Plugin ecosystem
    description: Compatible with markdown-it plugins. Shiki highlighting, KaTeX math, Mermaid diagrams, table of contents and more.
    to: /plugins
  - icon: i-lucide-braces
    title: Compact AST
    description: Parse to plain arrays that are easy to traverse, cache, serialize, and send over the wire.
    to: /syntax/markdown-ast
---
::

::landing-spacer
::

::landing-features
---
frameworksDescription: Embed custom components in your Markdown and render them
  natively in Vue, React, Svelte and Angular.
frameworksHeadline: Frameworks
frameworksReactLinkLabel: React docs
frameworksReactLinkTo: /rendering/react
frameworksSvelteLinkLabel: Svelte docs
frameworksSvelteLinkTo: /rendering/svelte
frameworksAngularLinkLabel: Angular docs
frameworksAngularLinkTo: /rendering/angular
frameworksTitle: Vue, React, Svelte & Angular
frameworksVueLinkLabel: Vue docs
frameworksVueLinkTo: /rendering/vue
streamingDescription: Parse content as it arrives. Built for AI chat
  interfaces and progressive loading.
streamingHeadline: Streaming
streamingLinkLabel: Learn more
streamingLinkTo: /api/parse#stream-parsing
streamingTitle: Real-time streaming
---
::

::landing-spacer
::

::landing-feature-auto-close
---
description: Incomplete markdown syntax is automatically closed during
  streaming, so content renders correctly at every frame.
headline: Auto-close
linkLabel: Learn more
linkTo: /api/auto-close
title: Auto-close
---
::

::landing-spacer
::

::landing-feature-plugins
---
plugins:
  - id: math
    name: Math
    icon: i-lucide-sigma
    description: LaTeX math formulas with KaTeX. Inline $...$ and display $$...$$ syntax.
    input: |-
      The area of a circle is $A = \pi r^2$.

      Euler's identity:

      $$e^{i\pi} + 1 = 0$$
    package: comark/plugins/math
  - id: highlight
    name: Highlight
    icon: i-lucide-code
    description: Syntax highlighting for code blocks powered by Shiki.
    input: |-
      ```typescript [user.ts]
      interface User {
        name: string
        email: string
      }

      async function getUser(id: number): Promise<User> {
        const res = await fetch(`/api/users/${id}`)
        return res.json()
      }
      ```
    package: comark
  - id: mermaid
    name: Mermaid
    icon: i-lucide-workflow
    description: Render Mermaid diagrams from fenced code blocks.
    input: |-
      ```mermaid
      graph TD
          A[Markdown] --> B[Parser]
          B --> C[Markdown AST]
          C --> D{Renderer}
          D --> E[Vue]
          D --> F[React]
          D --> G[HTML]
      ```
    package: comark/plugins/mermaid
description: Extend Comark with plugins for math formulas, syntax
  highlighting, and more. You can also reuse any markdown-it plugin.
headline: Plugins
linkLabel: Browse all plugins
linkTo: /plugins
title: Extensible plugins
---
::

::landing-spacer
::

::landing-cta
---
description: Install Comark, pick a renderer, and render your first component in minutes.
install: npm install comark
primaryLabel: Get Started
primaryTo: /getting-started/introduction
secondaryLabel: Why Comark
secondaryTo: /kb/why-comark
title: From Markdown to UI
---
::
