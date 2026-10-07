---
title: Comark use cases
description: 'Guides for common Comark tasks: AI chat streaming, generative UI, docs sites and blogs, CMS content, terminal output, emails, and RSS feeds.'
navigation: false
---

Each guide answers one question with working code. Pick the task that matches your project.

## AI and streaming

::card-group{cols="2"}
  :::card{icon="i-lucide-message-square-text" title="Render streaming Markdown from an LLM" to="/use-cases/ai-chat-streaming"}
  Render model output while it streams, with no raw syntax or layout jumps.
  :::

  :::card{icon="i-simple-icons-nuxt" title="Vue and Nuxt chat with the AI SDK" to="/use-cases/vue-ai-chat"}
  Stream AI SDK messages into Comark's Vue `<Markdown>` component.
  :::

  :::card{icon="i-simple-icons-svelte" title="Svelte chat with the AI SDK" to="/use-cases/svelte-ai-chat"}
  Stream AI SDK messages in Svelte 5 and SvelteKit.
  :::

  :::card{icon="i-simple-icons-angular" title="Angular chat with the AI SDK" to="/use-cases/angular-ai-chat"}
  Stream AI SDK messages in Angular 17 or later.
  :::

  :::card{icon="i-lucide-sparkles" title="Generative UI" to="/use-cases/generative-ui"}
  Let a model render your UI components inside Markdown, with no code execution.
  :::
::

## Content

::card-group{cols="2"}
  :::card{icon="i-lucide-book-open" title="Docs sites and blogs" to="/use-cases/docs-and-blogs"}
  Parse Markdown files with frontmatter, a table of contents, and highlighted code.
  :::

  :::card{icon="i-lucide-database" title="CMS and runtime content" to="/use-cases/cms-runtime-content"}
  Store parsed documents as JSON and render them on any client.
  :::
::

## Other outputs

::card-group{cols="2"}
  :::card{icon="i-lucide-terminal" title="CLIs and coding agents" to="/use-cases/cli-and-agents"}
  Print styled Markdown in the terminal with `@comark/ansi`.
  :::

  :::card{icon="i-lucide-mail" title="Emails and RSS feeds" to="/use-cases/email-and-rss"}
  Render Markdown to HTML strings with `@comark/html`.
  :::
::
