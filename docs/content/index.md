---
navigation: false
title: Comark
description: 'Parse and render Markdown anywhere with one JavaScript library for HTML, ANSI, Vue, React, Svelte and Angular, plus plugins and streaming.'
seo:
  title: Parse and Render Markdown Anywhere with Comark
  description: 'Parse and render Markdown anywhere with one JavaScript library for HTML, ANSI, Vue, React, Svelte and Angular, plus plugins and streaming.'
  ogImage: /social-card.jpg

---

::landing-hero
---
title: Parse and render Markdown anywhere
description: A JavaScript library to parse and stream Markdown, with renderers for HTML, terminals, Vue, React, Svelte and Angular, plus components, attributes, and plugins.
install: npm install comark
primaryLabel: Get Started
primaryTo: /getting-started/introduction
secondaryLabel: GitHub
secondaryTo: https://github.com/comarkdown/comark
demoMarkdown: |-
    # Hello World
  
    A JavaScript library to **parse and render Markdown** anywhere.
  
    ## Features
  
    - CommonMark and GFM support
    - HTML, ANSI, and framework renderers
    - Streaming, components, and plugins
  
    ::callout{color="info" icon="i-lucide-info"}
    One Markdown source, **every renderer**.
    ::
  
    > Built on markdown-exit, a TypeScript rewrite of markdown-it.
  
    ```ts [example.ts]
    import { parseMarkdown } from 'comark'
  
    const document = await parseMarkdown('# Hello **World**')
    ```
---
::

::landing-spacer
::

::landing-pillars
---
headline: Why Comark
title: One Markdown pipeline, every output
description: Parse standard Markdown into serializable data, then render it anywhere. Add streaming, component syntax, attributes, and plugins when you need them.
pillars:
  - icon: i-lucide-zap
    title: Runtime parsing
    description: No build step required. Parse Markdown on the server, in the browser, in a worker, or during a build.
    to: /api/parse
  - icon: i-lucide-radio
    title: Streaming built in
    description: Auto-close renders incomplete Markdown correctly at every frame. Display AI output as soon as it arrives.
    to: /api/auto-close
  - icon: i-lucide-layers
    title: One parser, every renderer
    description: The same source renders to HTML, ANSI, Vue, React, Svelte and Angular. Your content outlasts your framework.
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
    title: Serializable document
    description: Parse to a plain MarkdownDocument that is easy to traverse, cache, serialize, and send over the wire.
    to: /getting-started/document-model
---
::

::landing-spacer
::

::landing-features
---
frameworksDescription: Render the same Markdown document natively in Vue,
  React, Svelte and Angular.
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
          B --> C[MarkdownDocument]
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
description: Install Comark, pick a renderer, and render your first Markdown document in minutes.
install: npm install comark
primaryLabel: Get Started
primaryTo: /getting-started/introduction
secondaryLabel: Why Comark
secondaryTo: /kb/why-comark
title: From Markdown to UI
---
::
