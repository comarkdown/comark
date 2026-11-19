# Comark documentation

This directory contains the [comark.dev](https://comark.dev) documentation site, built with the [`comark-docs`](https://github.com/comarkdown/comark-docs) Nuxt layer.

## Local development

From the repository root:

```bash
pnpm docs
```

Or from `docs/`:

```bash
pnpm dev      # Start the dev server at http://localhost:3000
pnpm lint     # Lint Markdown and Comark component usage in content/
pnpm build    # Build the site into .output/
```

## Structure

```
docs/
├── app/                     # Site pages and custom prose components
├── content/                 # Documentation Markdown files
│   ├── index.md             # Landing page
│   ├── 1.getting-started/   # Introduction, installation, and document model
│   ├── 2.syntax/            # Markdown, components, attributes, and frontmatter
│   ├── 3.rendering/         # HTML, Vue, React, Svelte, Angular, and ANSI renderers
│   ├── 4.plugins/           # Default, built-in, and custom plugins
│   ├── 5.reference/         # Render, parse, auto-close, and type reference
│   ├── 7.kb/                # Architecture notes and migration guides
│   ├── 8.examples/          # Runnable framework, Vite, plugin, and AI examples
│   ├── 9.ecosystem.md       # Community packages and production sites
│   ├── 10.use-cases/        # Task-focused guides
│   └── 11.compare/          # Library comparisons
├── public/                  # Static assets
├── server/                  # Server routes (including /llms-*.txt endpoints)
├── skills/                  # Published agent skills (comark, migrate-mdc-to-comark)
├── comark-lint.config.ts    # comark-linter configuration
└── nuxt.config.ts           # Nuxt configuration
```

## Key pages

### Getting started and syntax

- [Documentation home](./content/index.md): landing page and overview
- [Introduction](./content/1.getting-started/0.introduction.md): architecture and capabilities
- [Installation](./content/1.getting-started/1.installation.md): packages, IDE extension, and browser extension
- [Document model](./content/1.getting-started/2.document-model.md): `MarkdownDocument`, node tuples, and utilities
- [Syntax](./content/2.syntax/1.markdown.md): CommonMark, GFM, [components](./content/2.syntax/2.components.md), [attributes](./content/2.syntax/3.attributes.md), and [frontmatter](./content/2.syntax/4.frontmatter.md)

### Reference

- [Render API](./content/5.reference/0.render.md): `renderMarkdown()` and string rendering options
- [Parse API](./content/5.reference/1.parse.md): `parseMarkdown()`, `createMarkdownParser()`, and parser options
- [Auto-close API](./content/5.reference/2.auto-close.md): `autoCloseMarkdown()` for incomplete Markdown streams
- [API reference](./content/5.reference/3.reference.md): `MarkdownDocument`, `Node`, utilities, and `transformNode`

### Renderers

- [HTML rendering](./content/3.rendering/2.html.md): `@comark/html`
- [Vue rendering](./content/3.rendering/3.vue.md): `@comark/vue` and Nuxt module
- [React rendering](./content/3.rendering/5.react.md): `@comark/react` and Server Components
- [Svelte rendering](./content/3.rendering/6.svelte.md): `@comark/svelte` and SvelteKit SSR
- [Angular rendering](./content/3.rendering/7.angular.md): `@comark/angular` (Angular 21+)
- [ANSI rendering](./content/3.rendering/8.ansi.md): `@comark/ansi`

## Agent skill

Install the Comark [Agent Skill](https://agentskills.io) from the published site:

```bash
npx skills add https://comark.dev
```

Skill sources live in [`./skills/`](./skills/). See the [Installation guide](./content/1.getting-started/1.installation.md#agent-skill) for details.

## Writing documentation

- Use sentence case for headings, card titles, and bold labels (for example, `## Parse options`, not `## Parse Options`).
- Specify a language on every fenced code block (`ts`, `tsx`, `vue`, `svelte`, `mdc`, `bash`).
- Use root-relative links inside `content/` (for example, `/reference/parse`) and run `pnpm --filter comark-docs-site lint` to check components, unclosed blocks, and links.
- Use Comark prose components (`::code-group`, `::tabs`, `::callout`, `::note`, `::card-group`) in `content/`, and plain GitHub Flavored Markdown in `README.md` files.

## Built with

- [`comark-docs`](https://github.com/comarkdown/comark-docs): Nuxt documentation layer built on Comark
- [Nuxt 4](https://nuxt.com): application framework
- [Nuxt UI](https://ui.nuxt.com): UI and prose components
- [Tailwind CSS 4](https://tailwindcss.com): styling

## License

Published under the [MIT License](../LICENSE) (MIT).
