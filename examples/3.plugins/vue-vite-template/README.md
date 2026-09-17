# Vue Template Playground

Dependency-free Jinja-style control blocks and restricted JavaScript expressions with `@comark/vue` and Vite.

## Run

From the repository root, after `pnpm install` and `pnpm build`:

```sh
pnpm dev:template
```

Or run `pnpm dev` from this directory. Build with `pnpm --filter comark-vue-vite-template build`.

## Examples

- `if` / `elif` / `else`, JavaScript logical operators and ternaries.
- Nested and filtered loops, loop metadata and empty-collection branches.
- `Object.entries`, array `filter`/`map`, string methods, comments and literal code.
- Frontmatter and loop-local values bound to component props.

Both the Markdown source and JSON data are editable. Reset restores the selected preset. The preview and resolved document use the same evaluated AST; invalid input displays an error instead of stale output. Source parsing is separate from data evaluation, so data edits do not reparse Markdown.

The component-props preset registers a small `ProjectPanel` Vue component to receive object props. Headings use loop-local variables because their generated `id` attributes establish a new `props` scope. The preview wraps the asynchronous Vue renderer in `Suspense`.

The explicit resolver lets this playground show evaluation errors inline. Normal applications can pass the parsed document and runtime `data` directly to `MarkdownDocument`, or use `Markdown` with `plugins: [template()]`.

```ts
import { parseMarkdown } from 'comark'
import template, { resolveTemplates } from '@comark/vue/plugins/template'

const document = await parseMarkdown(
  "{{ online ? 'Online' : 'Offline' }}",
  { plugins: [template()] },
)
const resolved = resolveTemplates(document, { online: true })
```

Do not combine `template()` and `binding()`. Blocks use Jinja-style delimiters; expressions use JavaScript operators and allowlisted methods, including expression-only arrow callbacks. Arbitrary calls, includes, macros and comprehensions are unsupported. Block controls must enclose complete Markdown blocks. See the [template guide](../../../docs/content/4.plugins/1.built-in/template.md) for syntax, security limits and streaming behavior.