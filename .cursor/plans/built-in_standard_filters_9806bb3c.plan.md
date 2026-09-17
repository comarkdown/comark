---
name: Built-in standard filters
overview: "Implement the full knap standard-filter catalog as comark's built-in binding filters (categorized: Formatting, Text, Dates, Numbers, Collections, HTML cleanup, HTML parsing), make the catalog the automatic default for the `filters` render option everywhere, expose DOM/heavier HTML-parsing filters via a separate opt-in entry, update the docs (crediting knap), extend the Vue example to exercise both built-in and custom filters, and test every filter."
todos:
  - id: restructure
    content: Convert utils/filters.ts into utils/filters/ (engine.ts, types.ts, standard.ts, category files, html.ts); add resolveFilterRegistry; fix import paths in utils/index.ts, plugins/binding.ts, state.ts
    status: completed
  - id: catalog-text-num-date
    content: Implement Text, Numbers, and Dates filter categories natively (ported from knap), value-to-value
    status: completed
  - id: catalog-collections
    content: Implement Collections filters including the mini-DSL ones (map, template, where, sort, nth)
    status: completed
  - id: catalog-formatting
    content: Implement Formatting (Markdown-structure) filters; reuse js-yaml for yaml/yaml_property
    status: completed
  - id: catalog-html
    content: Implement HTML cleanup filters (core, via htmlparser2) and html.ts parsing filters (separate opt-in htmlFilters entry)
    status: completed
  - id: default-registry
    content: "Wire standardFilters as the default registry: createState for string renderers + memoized merge in React/Vue/Svelte/Angular components"
    status: completed
  - id: exports
    content: Add comark/utils/filters/html to package exports; re-export standardFilters from comark/utils, comark/plugins/binding, and framework plugins/binding
    status: completed
  - id: docs
    content: Rework docs binding.md Pipe filters section into categorized reference (crediting knap) and update AGENTS.md exports/structure
    status: completed
  - id: example
    content: Update vue-vite-binding App.vue (+ README and docs example page) to exercise built-in categories plus a custom filter
    status: completed
  - id: tests
    content: Add per-category filter test suites covering every filter; extend resolve-attributes/binding tests for default+override; refresh bundle snapshot; run pnpm verify
    status: completed
isProject: false
---

# Built-in standard filters for `@comark/binding`

Port the knap standard-filter catalog ([knap.md/filters](https://knap.md/filters), [obsidianmd/knap](https://github.com/obsidianmd/knap)) into comark as native, value-to-value `BindingFilter`s, adapted to comark's contract `(value: unknown, ...args) => unknown` (comark passes the resolved, typed value; knap is string-first). The parse/apply engine and `filters` threading already exist from the prior chained-pipe-filters work; this adds the catalog, makes it the default registry, and documents/tests it.

## 1. Restructure the filter module into a catalog

Convert the single file [packages/comark/src/utils/filters.ts](packages/comark/src/utils/filters.ts) into a directory so the catalog stays organized:

```
packages/comark/src/utils/filters/
  index.ts         # public surface: re-export engine, types, standardFilters
  engine.ts        # parseBindingExpression, applyBindingFilters (moved verbatim) + resolveFilterRegistry()
  types.ts         # BindingFilter, BindingFilters, FilterSpec, ParsedBinding
  standard.ts      # standardFilters = { ...formatting, ...text, ...dates, ...numbers, ...collections, ...htmlCleanup }
  formatting.ts    # Markdown-structure filters
  text.ts          # case/spacing/encoding filters
  dates.ts         # date, date_modify, duration
  numbers.ts       # calc, number_format, round
  collections.ts   # array/object filters
  html-cleanup.ts  # string HTML cleanup via htmlparser2 (no DOM)
  html.ts          # htmlFilters: html_to_json, remove_html — separate opt-in entry, NOT in standardFilters
```

Update the three import sites that reference `./filters.ts` / `../utils/filters.ts` / `../../utils/filters.ts`:
- [packages/comark/src/utils/index.ts](packages/comark/src/utils/index.ts) — re-export `standardFilters` (and keep existing type/util re-exports) from `./filters/index.ts`.
- [packages/comark/src/plugins/binding.ts](packages/comark/src/plugins/binding.ts) — re-export `standardFilters` alongside the existing filter re-exports.
- [packages/comark/src/internal/stringify/state.ts](packages/comark/src/internal/stringify/state.ts) — import path only.

Add `resolveFilterRegistry` to `engine.ts` (memoization-friendly; avoids per-node catalog spread, honoring the perf rules):

```ts
export const resolveFilterRegistry = (userFilters?: BindingFilters): BindingFilters =>
  !userFilters || Object.keys(userFilters).length === 0
    ? standardFilters
    : { ...standardFilters, ...userFilters }
```

## 2. The filter catalog (native, ported from knap)

comark passes the real resolved value (string/number/array/object), so each filter operates on typed values and coerces as needed (e.g. `upper: (v) => String(v ?? '').toUpperCase()`). Filter registry keys use knap's snake_case names. Args arrive already parsed as literals by the existing `parseFilterSegment` (quoted → string, else JSON, else bare string).

- Formatting (`formatting.ts`): `blockquote`, `bold`, `callout`, `code`, `code_block`, `comment`, `embed`, `escape_md`, `footnote`, `fragment_link`, `h1`–`h6`, `hard_break`, `highlight`, `hr`, `image`, `italic`, `link`, `list`, `math`, `math_block`, `strike`, `table`, `table_pretty`, `wikilink`, `yaml`, `yaml_property` (`yaml`/`yaml_property` reuse the existing `js-yaml` dependency).
- Text (`text.ts`): `camel`, `capitalize`, `decode_uri`, `encode_uri`, `indent`, `kebab`, `lower`, `pascal`, `replace`, `safe_name`, `snake`, `title`, `trim`, `truncate`, `truncatewords`, `uncamel`, `unescape`, `upper` (reuse `pascalCase`/case helpers already in `utils/index.ts` where possible).
- Dates (`dates.ts`): `date` (token formatter `YYYY MM DD HH mm ss` …), `date_modify` (interval add/subtract), `duration` (seconds or ISO-8601). Implemented dependency-free.
- Numbers (`numbers.ts`): `calc` (op + operand), `number_format` (thousands + decimals), `round`.
- Collections (`collections.ts`): `compact`, `first`, `join`, `last`, `length`, `map`, `merge`, `nth`, `object`, `parse_json`, `reverse`, `slice`, `sort`, `split`, `sum`, `template`, `unique`, `where`.
- HTML cleanup (`html-cleanup.ts`, DOM-free via `htmlparser2`): `remove_attr`, `remove_tags`, `replace_tags`, `strip_attr`, `strip_md`, `strip_tags`.
- HTML parsing (`html.ts`, separate opt-in `htmlFilters`, excluded from `standardFilters`): `html_to_json`, `remove_html` (also via `htmlparser2`, so testable in node; kept separate for parity with `knap/html` and because they are heavier tree filters).

Higher-effort filters that carry a mini-DSL — `map` (property path or `${expr}`), `template` (`${property}`), `where`/`sort` (by property), `nth` (`2n+1` pattern), `calc`, and the three date filters — follow knap's documented behavior and are ported with knap's own test cases as the oracle.

Semantic note baked into code + docs: Formatting filters produce Markdown/text strings. In comark's render-time binding the returned string is inserted as text content and is NOT re-parsed into AST nodes (unlike knap, which runs at parse time). Structural generation stays the job of components, matching the original issue's scope note.

## 3. Make the catalog the default registry (auto-default everywhere)

- String renderers — in `createState` ([state.ts](packages/comark/src/internal/stringify/state.ts) line ~119): set `filters: resolveFilterRegistry(ctx.filters as BindingFilters | undefined)` on `context`. This covers `renderMarkdown`, `@comark/html`, and `@comark/ansi` (all build via `createState`). `resolveAttributes` stays registry-agnostic and simply receives the merged registry through `state.context.filters` (already wired).
- Framework renderers — merge once per render from the `filters` prop (currently defaulting to `{}`/`undefined`) via `resolveFilterRegistry`, memoized, then thread down as today:
  - React [MarkdownDocument.tsx](packages/comark-react/src/components/MarkdownDocument.tsx) / [Markdown.tsx](packages/comark-react/src/components/Markdown.tsx) — inside the existing `useMemo`.
  - Vue [MarkdownDocument.ts](packages/comark-vue/src/components/MarkdownDocument.ts) / [Markdown.ts](packages/comark-vue/src/components/Markdown.ts) — a `computed`.
  - Svelte [MarkdownNode.svelte](packages/comark-svelte/src/components/MarkdownNode.svelte) / [MarkdownDocument.svelte](packages/comark-svelte/src/components/MarkdownDocument.svelte) / [Markdown.svelte](packages/comark-svelte/src/components/Markdown.svelte) — a `$derived`.
  - Angular [markdown-node.component.ts](packages/comark-angular/src/components/markdown-node.component.ts) and the parent components — resolve in a getter / `ngOnChanges`.

User-supplied filters always win over built-ins (spread order), matching knap's `{ ...standardFilters, custom }` pattern.

## 4. Packaging / exports

- [packages/comark/package.json](packages/comark/package.json) `exports`: add `"./utils/filters/html": "./dist/utils/filters/html.js"` (no `./utils/*` wildcard exists today).
- Public surface: `standardFilters` from `comark/utils` and `comark/plugins/binding`; `htmlFilters` from `comark/utils/filters/html`. Re-export `standardFilters` from each framework `plugins/binding` for ergonomics (mirrors how `Binding`/`If` are re-exported).

## 5. Docs (credit knap)

Rework the "Pipe filters" section of [docs/content/4.plugins/1.built-in/binding.md](docs/content/4.plugins/1.built-in/binding.md) (copy adapted from [knap.md/filters](https://knap.md/filters)):
- Lead note: the built-in catalog is based on the knap standard-filter library, linking knap.md/filters and obsidianmd/knap.
- Default behavior: `filters` defaults to `standardFilters`; spread it to add/override (`{ ...standardFilters, custom }`), unknown filters throw.
- One reference subsection per category (Formatting, Text, Dates, Numbers, Collections, HTML cleanup, HTML parsing) as bullet lists (no markdown tables) — name, one-line behavior, example expression.
- HTML parsing note: opt-in import from `comark/utils/filters/html`, excluded from the default registry.
- Caveat subsection: Formatting filters return strings rendered as text at render time; use components for structural output.
- Custom filter registration example (sync + arg-taking).
Update [AGENTS.md](AGENTS.md) Package Exports Reference and the `utils/` structure block to list `standardFilters`, `htmlFilters`, and the new `comark/utils/filters/html` entry.

## 6. Example: built-in + custom (Vue)

Update [examples/3.plugins/vue-vite-binding/src/App.vue](examples/3.plugins/vue-vite-binding/src/App.vue):
- Drop the local `upper`/`lower`/`truncate` (now built-in) and pass only a genuinely custom filter (e.g. `shout`) via `:filters` to show custom-over-default merging.
- Extend the demo data (e.g. `tags: string[]`, a numeric stat, a date) and the markdown to exercise several categories: Text (`title`, `upper`, `truncate`), Numbers (`number_format`), Collections (`join`, `length`), Dates (`date`), plus the custom `shout` and an attribute binding (`::card{:title="user.name | title"}`).
- Keep the README/docs example pages ([examples/3.plugins/vue-vite-binding/README.md](examples/3.plugins/vue-vite-binding/README.md), [docs/content/8.examples/3.plugins/vue-vite-binding.md](docs/content/8.examples/3.plugins/vue-vite-binding.md)) in sync.

## 7. Tests (cover every filter)

- Per-category unit suites under `packages/comark/test/filters/standard/`: `text.test.ts`, `numbers.test.ts`, `dates.test.ts`, `collections.test.ts`, `formatting.test.ts`, `html-cleanup.test.ts`, and `html.test.ts` (opt-in DOM-free HTML tree filters). Each filter gets happy-path + edge cases (null/empty, wrong-type coercion), using knap's documented outputs as the oracle.
- Extend [packages/comark/test/resolve-attributes.test.ts](packages/comark/test/resolve-attributes.test.ts) and [packages/comark/test/plugins/binding.test.ts](packages/comark/test/plugins/binding.test.ts) to assert built-ins resolve with NO explicit registry (default applied) and that a custom filter overrides a built-in of the same name.
- Add a default-registry test for a string renderer (`renderMarkdown`/`@comark/html`) and at least one framework renderer proving `{{ x | upper }}` works without passing `filters`.
- Refresh the top-level bundle snapshot ([test/bundle.test.ts](test/bundle.test.ts)) after the catalog lands: `pnpm prepack && pnpm vitest run bundle -u`.
- Run `pnpm verify` (lint + test + typecheck) at the end.

## Decisions baked in
- Native reimplementation, no new runtime dependency (reuse `htmlparser2` and `js-yaml`).
- `standardFilters` is the automatic default registry everywhere; user filters override by name.
- DOM/heavier HTML-parsing filters (`html_to_json`, `remove_html`) ship from a separate `comark/utils/filters/html` entry and are excluded from the default registry.
- Formatting filters emit strings (text at render time); structural output remains a component concern.
