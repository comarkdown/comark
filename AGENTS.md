# Agent instructions

Guidance for AI agents working in the Comark monorepo.

## Project overview

Comark (`comark`) parses CommonMark and GitHub Flavored Markdown (GFM) into a compact, serializable `MarkdownDocument` and renders it to HTML, ANSI, Vue, React, Svelte, Angular, or back to Markdown.

- Synchronous parser factory and async parsing built on `markdown-exit` (a TypeScript rewrite of `markdown-it`)
- Incremental streaming and `autoCloseMarkdown()` for incomplete LLM output
- Block and inline component syntax (`::alert`, `:badge`), inline attributes (`{.class #id}`), and plugins
- Framework-free renderers (`@comark/html`, `@comark/ansi`) and UI renderers (`@comark/vue`, `@comark/react`, `@comark/svelte`, `@comark/angular`)

## Monorepo structure

```
/
├── packages/
│   ├── comark/           # Core parser, document model, Markdown stringifier, plugins
│   ├── comark-html/      # HTML string renderer (@comark/html)
│   ├── comark-ansi/      # ANSI terminal renderer (@comark/ansi)
│   ├── comark-vue/       # Vue 3 renderer, Vite plugin, Nuxt module (@comark/vue)
│   ├── comark-react/     # React renderer (@comark/react)
│   ├── comark-svelte/    # Svelte 5 renderer (@comark/svelte)
│   ├── comark-angular/   # Angular 21+ renderer (@comark/angular)
│   └── comark-nuxt/      # Deprecated @comark/nuxt wrapper around @comark/vue/nuxt
├── examples/
│   ├── 1.frameworks/     # Nuxt, Next.js, Astro, SvelteKit, VitePress
│   ├── 2.vite/           # Vue, Vue streaming, React, Svelte, Angular, HTML, ANSI
│   ├── 3.cli/            # ANSI output, prompts, OpenTelemetry tracing
│   ├── 3.plugins/        # math, mermaid, highlight, rangi, punctuation, twoslash, binding, json-render
│   └── 4.ai/             # Nuxt + AI SDK streaming chat
├── docs/                 # Documentation site (comark-docs layer; skills in docs/skills; llms routes in docs/server/routes)
├── benchmarks/           # CodSpeed Vitest benches (*.bench.ts) and mitata comparisons (*.ts)
├── scripts/              # stub.mjs and sync-plugins.mjs
├── test/                 # Bundle size snapshot (bundle.test.ts) and XSS bypass suite (test/sanitizer)
├── pnpm-workspace.yaml   # Workspace packages and dependency catalog
├── tsconfig.json         # Root TypeScript config (`pnpm typecheck`)
├── vitest.config.ts      # Root Vitest config, scoped to `test/`
├── .oxlintrc.json        # oxlint rules
├── .oxfmtrc.json         # oxfmt formatting rules
└── package.json          # Root scripts
```

## Package: `comark`

Located at `packages/comark/`:

```
packages/comark/
├── src/
│   ├── index.ts              # Public parser: default plugins + auto-close, delegates to core.ts (comark)
│   ├── core.ts               # Parser pipeline with no default plugins (comark/core)
│   ├── auto-close.ts         # autoCloseMarkdown() (comark/auto-close)
│   ├── context.ts            # Live renderer context: ComarkContext, ComarkDocument, ComarkPatch (comark/context)
│   ├── render/
│   │   ├── index.ts          # AST to Markdown string: renderMarkdown() (comark/render)
│   │   └── html.ts           # HTML-only string engine used by @comark/html (comark/render/html)
│   ├── types.ts              # MarkdownDocument, Node, ElementNode, TextNode, CommentNode, ParserOptions
│   ├── plugins/              # Core plugins (comark/plugins/*)
│   │   ├── alert.ts          # GFM alerts (default via registerDefaultPlugins)
│   │   ├── attributes.ts     # Inline `{props}` attributes (default via registerDefaultPlugins)
│   │   ├── binding.ts        # `{{ path }}` interpolation and conditional `If` helpers
│   │   ├── breaks.ts         # Soft line breaks as `<br>`
│   │   ├── components.ts     # Block/inline components and `[text]` spans (default via registerDefaultPlugins)
│   │   ├── emoji.ts          # `:shortcode:` emoji replacement
│   │   ├── external-links.ts # `rel` and `target` attributes on external links
│   │   ├── footnotes.ts      # GFM footnotes
│   │   ├── frontmatter.ts    # YAML frontmatter extraction (default via registerDefaultPlugins)
│   │   ├── heading-links.ts  # Wraps or appends anchor links on headings
│   │   ├── headings.ts       # Deprecated alias for title-description (remove next major)
│   │   ├── highlight.ts      # Deprecated alias for shiki (remove next major)
│   │   ├── html.ts           # Raw HTML block/inline parsing (default via registerDefaultPlugins)
│   │   ├── json-render.ts    # Expands `json-render` code fences into component nodes
│   │   ├── linkify.ts        # Autolinks via linkify-it 6 (default via registerDefaultPlugins; fuzzyLink opt-in)
│   │   ├── math.ts           # LaTeX math via KaTeX (optional peer: katex)
│   │   ├── mermaid.ts        # Mermaid diagrams (optional peer: beautiful-mermaid)
│   │   ├── pierre-highlights.ts # Fast Wasm syntax highlighting with Shiki-compatible output (optional peer: @pierre/highlights)
│   │   ├── punctuation.ts    # Smart quotes, dashes, and ellipses
│   │   ├── rangi.ts          # Lightweight syntax highlighting (optional peer: rangi)
│   │   ├── rangi/language-comark.ts # Standalone Comark grammar for rangi
│   │   ├── security.ts       # URL, tag, and attribute sanitization
│   │   ├── shiki.ts          # Shiki highlighting with default themes and lazy language loaders (optional peer: shiki)
│   │   ├── shiki/core.ts     # Shiki without default theme or language imports
│   │   ├── shiki/language-comark.ts # Comark TextMate grammar and Shiki language dependencies
│   │   ├── summary.ts        # Extracts summary before `<!-- more -->` into `meta.summary`
│   │   ├── task-list.ts      # GFM task lists (default via registerDefaultPlugins)
│   │   ├── title-description.ts # Extracts h1 and first paragraph into `meta`
│   │   └── toc.ts            # Generates table of contents in `meta.toc`
│   ├── utils/                # Public utilities (comark/utils and comark/utils/trace)
│   │   ├── index.ts          # textContent, visit, visitAsync, escapeHtml, isHtmlVoidElement, indent, applyNodeTransforms
│   │   ├── helpers.ts        # defineComarkPlugin, dedupePlugins
│   │   ├── trace.ts          # noopTracer, withSpan
│   │   └── caret.ts          # Streaming caret helpers
│   └── internal/             # Internal implementation (not exported)
│       ├── bracket-math.ts   # `\( ... \)` and `\[ ... \]` delimiter scanners
│       ├── entities.ts       # HTML attribute entity decoding via character-entities
│       ├── frontmatter.ts    # parseFrontmatter and renderFrontmatter
│       ├── heading-id.ts     # Slug generation shared by parser and stringifier
│       ├── inline-code-lang.ts # Inline code `{lang="..."}` fragment highlighting
│       ├── list-item.ts      # List item content columns, shared by the component fence scan and auto-close
│       ├── sanitize.ts       # Prop, URL, and frontmatter validation
│       ├── shiki.ts          # Shared Shiki runtime
│       ├── yaml.ts           # YAML parsing and serialization helpers
│       ├── parse/
│       │   ├── tree.ts       # Converts markdown-exit tokens into Comark AST nodes
│       │   ├── tree-utils.ts # Fence metadata, attribute merging, and token helpers
│       │   ├── indent.ts     # Dedents outdented block component children
│       │   ├── unwrap.ts     # Top-level `unwrap` implementation
│       │   ├── utils.ts      # `autoUnwrap` and shared parse helpers
│       │   └── syntax/       # Scanners for `{props}`, `[brackets]`, and block params
│       └── stringify/        # AST to Markdown/HTML string engine (`state.ts`, `handlers/`, `transform-node.ts`)
├── SPEC/                     # Behavioral spec fixtures (CommonMark, GFM, HTML, COMARK, auto-close.md)
└── test/                     # Vitest unit and spec tests
```

## Renderer packages

Every renderer package re-exports all core plugins under `@comark/<target>/plugins/*` (generated by `scripts/sync-plugins.mjs` when no framework component wrapper exists). Prefer the renderer's plugin subpath when using a renderer; use `comark/plugins/*` only when calling `parseMarkdown()` directly.

### `@comark/html` (`packages/comark-html/`)

Framework-free HTML string rendering (`createHtmlRenderer`, `renderHtml`, `renderHtmlFromDocument`).

- Renders through `comark/render/html`, which registers only the `html` and `comment` handlers so Markdown serializers are never bundled.
- `@comark/html/render` stays free of `js-yaml`; the root entry and plugins import the parser, which loads YAML for frontmatter.
- Shares `internal/stringify/state.ts` with `comark/render`. HTML attribute escaping lives in `html-attributes.ts`; Markdown/YAML attribute serialization stays in `attributes.ts`.

### `@comark/ansi` (`packages/comark-ansi/`)

Terminal string rendering (`createAnsiRenderer`, `createAnsiPrinter`, `printAnsi`, `renderAnsi`, `renderAnsiFromDocument`). Merges `ParserOptions` and `AnsiRendererOptions` (`width`, `colors`, `writer`) at the top level.

### `@comark/vue` (`packages/comark-vue/`)

Vue 3 renderer (`Markdown`, `MarkdownDocument`, `defineMarkdownComponent`, `defineMarkdownDocumentComponent`), Vite plugin (`@comark/vue/vite`), and Nuxt module (`@comark/vue/nuxt`).

- `<Markdown>` is an async setup component and needs a `<Suspense>` boundary in Vue apps.
- `@comark/vue/vite` transforms `<slot unwrap>` in custom Markdown components and optionally auto-registers `components/prose/*.vue`.
- `modules: ['@comark/vue']` in Nuxt resolves `@comark/vue/nuxt`. It auto-imports `Markdown` and `MarkdownDocument` from `@comark/vue/components/*` (so `<MarkdownDocument>` alone never bundles the parser), `defineMarkdownComponent`, `defineMarkdownDocumentComponent`, and `parseMarkdown` / `createMarkdownParser` (in app and server routes), enables Nuxt UI prose components when `@nuxt/ui` is installed, and registers `@comark/vue/vite` with `prose: false`. It does not register `~/components/prose`. `@nuxt/kit` and `@nuxt/schema` are optional peer dependencies.

### `@comark/react` (`packages/comark-react/`)

React 19+ renderer (`Markdown`, `MarkdownDocument`, `MarkdownClient`, `MarkdownLive`, `defineMarkdownComponent`, `defineMarkdownDocumentComponent`).

- Vitest runs two projects: `server` (Node/SSR) and `client` (`*.browser.test.tsx` in headless Chromium). Run `pnpm exec playwright install chromium` if Chromium is missing.

### `@comark/svelte` (`packages/comark-svelte/`)

Svelte 5 renderer (`Markdown`, `MarkdownDocument`, `MarkdownNode`) plus experimental async SSR entry `@comark/svelte/async` (`MarkdownAsync`, requires `experimental.async` in `svelte.config.js`).

- Built in two `svelte-package` passes (`tsconfig.json` for types, `tsconfig.build.json` for JS) followed by `sync-plugins.mjs`.
- Vitest runs two projects: `server` (`*.test.ts` with `svelte/server` `render()`) and `client` (`*.svelte.test.ts` with `vitest-browser-svelte` in Chromium).

### `@comark/angular` (`packages/comark-angular/`)

Angular 21+ renderer (peer range `>=21 <23`) with standalone components (`Markdown` selector `comark-markdown`, `MarkdownDocument`, `defineMarkdownComponent`, `defineMarkdownDocumentComponent`).

- Built with `ng-packagr` (`ng build`), then `scripts/strip-sourcemaps.mjs` removes emitted source maps and `scripts/sync-plugins.mjs` writes plain plugin re-exports and `./plugins/*` export map entries into `dist/package.json`.
- Plugin entry points use **named exports** because the Angular Package Format strips `export default` (`import { math, Math } from '@comark/angular/plugins/math'`, `import { security } from '@comark/angular/plugins/security'`).
- Publishes from `dist/` via `publishConfig.directory`; `test/bundle.test.ts` packs from `dist/` too.

## Package exports reference

```typescript
// Core parsing and live context
import { parseMarkdown, createMarkdownParser, autoCloseMarkdown, defineComarkPlugin, createComarkContext } from 'comark'
import { parseMarkdown } from 'comark/core' // no default plugins; autoClose takes a function, not a boolean
import { autoCloseMarkdown } from 'comark/auto-close'
import { renderMarkdown } from 'comark/render'
import type { ComarkContext, ComarkDocument, ComarkPatch } from 'comark/context'
import type { MarkdownDocument, Node, ElementNode, TextNode, CommentNode, NodeTransform } from 'comark'
import {
  textContent,
  visit,
  visitAsync,
  escapeHtml,
  isHtmlVoidElement,
  HTML_VOID_ELEMENTS,
  isMarkdownDocument,
  sanitizeData,
  applyNodeTransforms,
  mergeNodeTransforms,
} from 'comark/utils'
import { noopTracer, withSpan } from 'comark/utils/trace'

// Core plugins (also re-exported from @comark/{html,ansi,vue,react,svelte,angular}/plugins/*)
import shiki from 'comark/plugins/shiki'
import shikiCore from 'comark/plugins/shiki/core'
import shikiComarkLanguages from 'comark/plugins/shiki/language-comark'
import rangi, { comarkLanguage, comarkLanguages } from 'comark/plugins/rangi'
import rangiComarkLanguage from 'comark/plugins/rangi/language-comark'
import pierreHighlights from 'comark/plugins/pierre-highlights' // `comark` fences use the plain mdc lexer
import math from 'comark/plugins/math'
import mermaid from 'comark/plugins/mermaid'
import emoji from 'comark/plugins/emoji'
import toc from 'comark/plugins/toc'
import alert from 'comark/plugins/alert'
import breaks from 'comark/plugins/breaks'
import footnotes from 'comark/plugins/footnotes'
import titleDescription from 'comark/plugins/title-description'
import externalLinks from 'comark/plugins/external-links'
import headingLinks from 'comark/plugins/heading-links'
import punctuation from 'comark/plugins/punctuation'
import jsonRender from 'comark/plugins/json-render'
import linkify from 'comark/plugins/linkify'
import security from 'comark/plugins/security'
import summary from 'comark/plugins/summary'
import taskList from 'comark/plugins/task-list'
import frontmatter from 'comark/plugins/frontmatter'
import components, { markdownItComponents } from 'comark/plugins/components'
import attributes, { markdownItAttributes } from 'comark/plugins/attributes'
import html from 'comark/plugins/html'
import binding, { Binding, resolveIfWrapper, selectIfBranch, shouldRenderIf } from 'comark/plugins/binding'

// Renderers and framework plugin wrappers (plugin function + UI component)
import { createHtmlRenderer, renderHtml, renderHtmlFromDocument } from '@comark/html'
import { createAnsiRenderer, createAnsiPrinter, printAnsi, renderAnsi, renderAnsiFromDocument } from '@comark/ansi'
import { Markdown, MarkdownDocument, defineMarkdownComponent } from '@comark/vue' // also @comark/react
import { Markdown, MarkdownDocument } from '@comark/svelte'
import { MarkdownAsync } from '@comark/svelte/async'
import { Markdown, MarkdownDocument, defineMarkdownComponent } from '@comark/angular'
import math, { Math } from '@comark/vue/plugins/math' // same shape in html, react, svelte (`{ math, Math }` in angular)
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
import binding, { Binding, If } from '@comark/vue/plugins/binding'
```

## Coding conventions

- **Performance**: Prefer single-pass character-code scanning (`O(n)`) over regexes or nested loops in parser, auto-close, and stringifier hot paths. Minimize intermediate object and array allocations.
- **TypeScript**: Add explicit parameter and return types on exported functions, export option/prop interfaces alongside functions, use `Record<string, any>` for component prop maps, and prefer `interface` for object shapes.
- **Formatting and linting**: Configured in `.oxlintrc.json` and `.oxfmtrc.json` (no semicolons, single quotes, 120 columns, ES5 trailing commas). There is no ESLint or Prettier config.
- **Comments**: Only write comments that state invariants, constraints, security/DoS bounds, or spec subtleties the code cannot express on its own. Avoid ASCII section banners, narrated line-by-line comments, and em dashes in prose or comments.

## Document model and core invariants

### Document model (`packages/comark/src/types.ts`)

```typescript
type TextNode = string
type ElementNodeAttributes = { [key: string]: unknown; $?: { line?: number; html?: 0 | 1; block?: 0 | 1 } }
type ElementNode = [string, ElementNodeAttributes, ...Node[]]
type CommentNode = [null, ElementNodeAttributes, string]
type Node = ElementNode | TextNode | CommentNode
interface MarkdownDocument {
  nodes: Node[]
  frontmatter: Record<string, any>
  meta: Record<string, any>
}
```

### `autoCloseMarkdown(markdown, options?)`

Heals incomplete CommonMark and GFM per `packages/comark/SPEC/auto-close.md` (`test/auto-close-spec.test.ts`), plus Comark components, tables, and frontmatter.

- Bare `autoCloseMarkdown()` leaves `math` off by default so `$50` stays prose; `parseMarkdown` / `createMarkdownParser` enable math closing when the `math` plugin is registered.
- `dropTrailingOpeners` defaults to `false`, and turns on when `parseMarkdown` runs with `streaming: true`.
- Incomplete links default to `linkMode: 'protocol'` (`comark:incomplete-link`).

### Indentation inside components

Block component children may be indented under `::` or outdented; both round-trip through `parseMarkdown` and `renderMarkdown`:

- **Parse (`src/internal/parse/indent.ts`)**: Dedent children rather than raising the floor. Each child line shifts left by `min(markerIndent, lineIndent)` and tokenizes against a zero floor. Lines inside a fenced code block all take the opening fence's shift so fence and body move together. If a tab would have to be split across columns, the shift aborts and keeps the marker floor.
- **Stringify (`indent()` in `src/utils/index.ts`)**: Nested components indent their rendered block by 2 spaces per level across every line, including fenced code bodies, reaching a fixed point on re-parse.
- **Closing fences (`comark_block` in `src/plugins/components.ts`)**: The scan for the closing `::` skips code fences. A closing fence may sit at most 3 columns right of its container: the innermost component or list item open at the opening fence, or the opening fence itself when that is further left. Deeper fence lines are code content, so a `::` after one does not close the component. A line 4+ columns right of its container is indented code and opens no fence, list item, or nested component. `- - item` opens two list items, and a thematic break such as `- - -` opens none. A fence inside a list item ends when the list item does, even without a closer. Tabs count to the next multiple of 4 columns. The `#slot` scan reads fences by the same rules. `autoCloseMarkdown` follows them too; it and `comark_block` use `pushListItems()` (`src/internal/list-item.ts`).
- Spec fixtures: `SPEC/COMARK/component-nested-*-outdented.md`, `SPEC/COMARK/component-nested-codeblock-indented.md`, `SPEC/COMARK/codeblock-indented-content.md`, and for closing fences `SPEC/COMARK/component-*codeblock-indented-fence.md`, `SPEC/COMARK/component-codeblock-closing-fence-indent.md`, `SPEC/COMARK/component-codeblock-indented-opener.md`, `SPEC/COMARK/component-indented-code-fence.md`, `SPEC/COMARK/component-codeblock-invalid-nested-name.md`, `SPEC/COMARK/component-list-marker-indent.md`, `SPEC/COMARK/component-slot-indented-fence.md`.

### Embedded HTML

Contract: `packages/comark/SPEC/HTML/README.md`.

- HTML nodes carry `$: { html: 1, block: 0 | 1 }`, where `block` means the tag outlived the paragraph that opened it, not that the HTML tag name is block-level.
- `html({ markdown: false })` keeps closed-block text literal; a blank line still nests parsed Markdown under the open tag.
- `<style>`, `<pre>`, `<script>`, `<textarea>`, and block-level `<!-- -->` comments are always verbatim.
- All-uppercase tag names are lowercased (`<DIV>` -> `div`); any tag name with a lowercase letter preserves its case (`<Hello>`, `<linearGradient>`).
- `visit` and `visitAsync` stop at `TREE_WALK_MAX_DEPTH` (`50`).
- Deferred edge cases in `test/html-block.test.ts` are skipped tests; do not delete or weaken them.

### Render-time node transforms

Every renderer accepts `transformNode` (a function or array of functions returning `{ tag?, props? }`).

- Each renderer calls `applyNodeTransforms()` (`src/internal/stringify/transform-node.ts`, exported from `comark/utils`) right after `resolveAttributes()` with `parseJson: true` and before component lookup, so a returned `tag` resolves through `components` and `componentsManifest`.
- `one()` in `src/internal/stringify/state.ts` copies the node only when a transform changes `tag` or `props`.
- Returned `tag` and `props` are trusted developer output and are not re-sanitized. Children see returned `props` as `renderData.props`.

## Parser and plugin rules

1. Token-to-AST conversion lives in `packages/comark/src/internal/parse/tree.ts`. Run spec fixtures with `cd packages/comark && pnpm vitest run test/index.test.ts` (or `SPEC=SPEC/COMARK/foo.md pnpm vitest run test/index.test.ts`), and check `test/streaming.test.ts` after parser edits.
   A fixture has `## Input`, `## AST`, `## HTML` and `## Markdown` sections, plus an optional `## Markdown HTML` for `renderMarkdown(doc, { format: 'markdown/html' })`. Every fixture runs the `markdown/html` check; when the section is missing, it falls back to `## Markdown`. Add the section only when the output differs (components, spans, slots, `:br`).
2. Always import from `markdown-exit/core`, never `markdown-exit`. Only `src/plugins/linkify.ts` imports `linkify-it`, keeping `comark/core` free of `linkify-it` and avoiding `markdown-exit`'s global fuzzy-link rule.
3. Decode HTML entities in attributes with `decodeHTMLAttribute` from `src/internal/entities.ts`, never `entities`, so bundles reuse the single `character-entities` table shipped by `markdown-exit`.
4. After adding or renaming a plugin in `packages/comark/src/plugins/`, add framework wrappers if it has a UI component, then run `pnpm sync-plugins` (also run by `pnpm build` and `pnpm stub`).

## Scripts

```bash
pnpm stub           # Point every package's dist/ at src/ for local dev (runs on postinstall)
pnpm build          # Build all packages and sync plugin re-exports (`pnpm stub` restores dev stubs after)
pnpm prepack        # Full build + sync-plugins before packing or bundle checks
pnpm test           # Run all package test suites
pnpm test:spec      # Run SPEC fixtures only
pnpm test:sanitizer # Run vercel-labs/markdown-sanitizers fixtures against `security`
pnpm bench          # Run CodSpeed Vitest benches (`benchmarks/*.bench.ts`)
pnpm lint           # oxlint + oxfmt --check + comark-lint on docs/content
pnpm lint:fix       # oxlint --fix + oxfmt
pnpm typecheck      # Root `tsc --noEmit`
pnpm verify         # lint + test + typecheck
pnpm docs           # Start the documentation site (`docs/`)
pnpm dev:<name>     # Start an example app (vue, react, svelte, angular, html, ansi, nuxt, nextjs, astro, ...)
```

## CI, benchmarks, and releases

- **Workflows (`.github/workflows/`)**:
  - `ci.yml`: lint -> prepack -> test -> sanitizer suite -> pkg.pr.new preview -> bundle size snapshot
  - `codspeed.yml`: runs `pnpm bench` under CPU simulation
  - `bundle-snapshot.yml`: posts bundle-size diffs on PRs and updates `test/bundle.test.ts` on maintainer trigger (`/update-bundle-snapshot`, comment checkbox, or manual dispatch) via verified GitHub API commits
  - `commit-signature.yml`: requires verified commit signatures on PRs
  - `docs-preview-comment.yml`: posts preview URLs when `docs/content/**` changes
  - `release.yml`: lockstep releases across `packages/*` via `danielroe/uppt` and staged OIDC `npm stage publish`
- **Benchmarks (`benchmarks/*.bench.ts`)**: Run through `benchmarks/vitest.config.ts` with `@codspeed/vitest-plugin` (a no-op outside CodSpeed). Benches use the Vitest 5 API: one `test('group', async ({ bench }) => ...)` per group calling `bench.compare(bench('name', fn), ...)`; CodSpeed ids are `<file>::<test name>::<bench name>`, and `pnpm bench -t <pattern>` matches the group name (e.g. `pnpm bench -t 'parse html'`). Shared inputs live in `benchmarks/fixtures.ts`. Never rename an existing bench or edit a shared fixture (it resets CodSpeed history); add a new one instead. Warm parsers at module scope. Give each streaming bench a dedicated parser and reset it with `{ streaming: false }` inside the bench body so the incremental cache does not short-circuit.
- **Bundle size snapshot (`test/bundle.test.ts`)**: Measures unpacked published size via `npm pack --dry-run`. Check after a real build with `pnpm prepack && pnpm vitest run test/bundle.test.ts`, update with `-u` when size changes are expected, then restore dev stubs with `pnpm stub`. In `bundle-snapshot.yml`, PR code runs only in the tokenless `build` job; the write-scoped `update` job verifies the artifact against the head SHA, and fork PRs get the patch posted as a comment instead. `GITHUB_TOKEN` commits do not reliably re-trigger `ci`, so re-run it manually to refresh a stale red check. Requires repo workflow permissions set to *Read and write*.
- **Commits and releases**: Use Conventional Commits (`feat:`, `fix:`, `perf:`, `docs:`, `chore:`, `feat!:`). Merging the `release/vX.Y.Z` PR created by `uppt` tags, creates the GitHub Release, packs packages (`workspace:*` rewritten to exact versions), and stages tarballs on npm (`pack` installs with `--ignore-scripts`; approve staged versions on npmjs.com). Prereleases: `gh workflow run release.yml -f prerelease=beta`. Release notes live in GitHub Releases; there are no `CHANGELOG.md` files. Agent skills are served from `comark.dev` (`docs/skills/`), not packed into npm tarballs.

## Documentation maintenance

Update documentation alongside code changes:

- `AGENTS.md`: package structure, public exports, or repo workflow changes
- `docs/content/`:
  - `1.getting-started/`: installation, introduction, document model
  - `2.syntax/`: Markdown, component, attribute, and frontmatter syntax
  - `3.rendering/`: HTML, Vue, React, Svelte, Angular, and ANSI renderers
  - `4.plugins/`: default, built-in, and custom plugins
  - `5.reference/`: parse, render, auto-close, and API cheat sheet
  - `7.kb/`: rationale, MDC/MDX migration guides, Twoslash, custom code blocks
  - `8.examples/` and `9.ecosystem.md`: runnable examples and community packages
  - `10.use-cases/`: streaming chat, intelligent/generative UI, CMS, CLI, email/RSS
  - `11.compare/`: sourced library comparisons (every external claim must be backed by docs or source)
- `docs/skills/`: agent skills served from `comark.dev`

Run `pnpm --filter comark-docs-site lint` (`comark-lint`) to verify Comark components, links, and heading anchors across `docs/content/`.
