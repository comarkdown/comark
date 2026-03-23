---
navigation: false
title: Comark
description: A fast, streaming-ready markdown parser with component support for
  Vue and React.
---

::landing-hero
---
demoMarkdown: |-
  # Hello World

  A **high-performance** markdown parser with _streaming_ support.

  ## Features

  - Parse markdown in real-time
  - Vue & React components
  - Auto-close incomplete syntax

  ::callout{color="info" icon="i-lucide-info"}
  Comark handles **components in markdown** natively.
  ::

  > Built for modern web applications.

  ```ts [example.ts]
  import { parse } from 'comark'

  const tree = await parse('# Hello **World**')
  ```
description: A fast, streaming-ready markdown parser with component support for
  Vue and React.
install: npm install comark
primaryLabel: Get Started
primaryTo: /getting-started/introduction
secondaryLabel: GitHub
secondaryTo: https://github.com/comarkdown/comark
title: Comark
---
::

:landing-spacer

::landing-features
---
frameworksDescription: First-class support for both frameworks. Embed custom
  components in your markdown.
frameworksHeadline: Frameworks
frameworksReactLinkLabel: React docs
frameworksReactLinkTo: /rendering/react
frameworksTitle: Vue & React
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

:landing-spacer

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

:landing-spacer

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

:landing-spacer

::landing-cta
---
footerSections:
  - title: Documentation
    links:
      - label: Getting Started
        to: /getting-started/introduction
      - label: Syntax
        to: /syntax/components
      - label: Rendering
        to: /rendering/vue
      - label: API Reference
        to: /api/parse
  - title: Plugins
    links:
      - label: Syntax Highlighting
        to: /plugins/core/highlight
      - label: Math
        to: /plugins/core/math
      - label: Mermaid
        to: /plugins/core/mermaid
  - title: Community
    links:
      - label: GitHub
        to: https://github.com/comarkdown/comark
        external: true
      - label: Issues
        to: https://github.com/comarkdown/comark/issues
        external: true
      - label: Changelog
        to: https://github.com/comarkdown/comark/blob/main/CHANGELOG.md
        external: true
      - label: License
        to: https://github.com/comarkdown/comark/blob/main/LICENSE
        external: true
description: Add rich, interactive components to your markdown today.
footerCopyright: © 2026 Comark. Released under the MIT License.
footerDescription: A fast, streaming-ready markdown parser with component
  support for Vue and React.
githubUrl: https://github.com/comarkdown/comark
install: npm install comark
npmUrl: https://www.npmjs.com/package/comark
primaryLabel: Get Started
primaryTo: /getting-started/introduction
secondaryLabel: GitHub
secondaryTo: https://github.com/comarkdown/comark
title: Start writing
---
::
