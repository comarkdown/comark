---
navigation: false
title: Comark
description: A fast, streaming-ready markdown parser with component support for Vue, React, and Svelte.
seo:
  title: Components in Markdown
  description: Fast, streaming-ready markdown parser with Vue, React, and Svelte component support. Parse Comark content from strings or streams with TypeScript support.
  ogImage: /social-card.jpg

---

::landing-hero
---
title: Comark
description: A fast, streaming-ready markdown parser with component support for Vue, React, Svelte, HTML and ANSI terminal.
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
    - Vue, React, and Svelte components
    - Auto-close incomplete syntax
  
    ::callout{color="info" icon="i-lucide-info"}
    Comark handles **components in markdown** natively.
    ::
  
    > Built for modern web applications.
  
    ```ts [example.ts]
    import { parse } from 'comark'
  
    const tree = await parse('# Hello **World**')
    ```
---
::

::landing-spacer
::

::landing-features
---
frameworksDescription: First-class support for all major frameworks. Embed
  custom components in your markdown.
frameworksHeadline: Frameworks
frameworksReactLinkLabel: React docs
frameworksReactLinkTo: /rendering/react
frameworksSvelteLinkLabel: Svelte docs
frameworksSvelteLinkTo: /rendering/svelte
frameworksTitle: Vue, React & Svelte
frameworksVueLinkLabel: Vue docs
frameworksVueLinkTo: /rendering/vue
streamingDescription: Parse content as it arrives. Perfect for AI-generated
  content and progressive loading.
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
    package: "@comark/math"
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
  - id: toc
    name: TOC
    icon: i-lucide-list
    description: Auto-generate a table of contents from document headings.
    input: |-
      # Introduction

      Welcome to the docs.

      ## Getting Started

      Install the package.

      ### Configuration

      Set up your config.

      ## API Reference

      Full API docs.
    package: comark
description: Extend Comark with plugins for math formulas, syntax
  highlighting, and more.
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
description: Add rich, interactive components to your markdown today.
install: npm install comark
primaryLabel: Get Started
primaryTo: /getting-started/introduction
secondaryLabel: GitHub
secondaryTo: https://github.com/comarkdown/comark
title: Start writing
---
::
