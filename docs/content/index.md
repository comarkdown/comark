---
seo:
  title: MDC Syntax - Modern Markdown Component Parser
  description: Fast, streaming-ready markdown parser with Vue component support. Parse MDC content from strings or streams with TypeScript support and Vue 3 integration.
---

::u-page-hero
#title
Parse Markdown with Vue Components

#description
Fast, streaming-ready markdown parser with full MDC (Markdown Component) syntax support.

Built for modern applications with TypeScript, Vue 3 integration, and real-time streaming capabilities.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /installation
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  color: neutral
  icon: simple-icons-github
  size: xl
  to: https://github.com/nuxt-content/mdc-syntax
  variant: outline
  ---
  Star on GitHub
  :::
::

::u-page-section
#title
Everything you need for modern content parsing

#features
  :::u-page-feature
  ---
  icon: i-lucide-zap
  to: /parse-api
  ---
  #title
  [Fast]{.text-primary} markdown-it parser

  #description
  Built on markdown-it for blazing fast parsing with full GFM support, tables, and MDC component syntax. Optimized bundle size at just 47 kB.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-activity
  to: /parse-api#stream-parsing
  ---
  #title
  [Real-time streaming]{.text-primary} support

  #description
  Parse content as it arrives with incremental streaming. Perfect for AI-generated content, large files, or progressive loading. Updates your UI in real-time.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-puzzle
  to: /mdc-renderer
  ---
  #title
  [Vue component]{.text-primary} integration

  #description
  Embed Vue components directly in markdown with MDC syntax. Use slots, props, and custom components seamlessly. Full TypeScript support included.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-shield-check
  to: /auto-close-api
  ---
  #title
  [Auto-close]{.text-primary} incomplete syntax

  #description
  Automatically handles unclosed markdown and component syntax during streaming. No more broken renders while content is still loading.
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-vue
  to: /use-mdc-stream
  ---
  #title
  [Vue 3 composables]{.text-primary} included

  #description
  Reactive streaming with useMDCStream composable. State management, progress tracking, and error handling built-in. Works with Nuxt 4 and Vue 3.
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-typescript
  to: /parse-api#types
  ---
  #title
  [Full TypeScript]{.text-primary} support

  #description
  Complete type definitions for all APIs, AST nodes, and Vue components. Get autocomplete and type safety throughout your project.
  :::
::
