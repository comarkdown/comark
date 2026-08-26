<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# @comark/prose

[![npm version](https://img.shields.io/npm/v/@comark/prose?color=black)](https://npmx.dev/@comark/prose)
[![npm downloads](https://img.shields.io/npm/dm/@comark/prose?color=black)](https://npm.chart.dev/@comark/prose)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev/plugins/prose)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

Framework-agnostic prose components for [Comark](https://comark.dev). The `prose` plugin lowers docs components — callouts, tabs, code groups, steps, accordions, GFM alerts — into plain HTML at parse time, so every renderer benefits: Vue, React, Svelte, Angular, and `@comark/html` string output.

Styling and interactivity are decoupled layers you opt into:

- **Plugin** (`@comark/prose`) — rewrites the tree into semantic, accessible markup.
- **CSS** (`@comark/prose/components.css`) — token-driven styles, `:where()` scoped, streaming-stable. Or bring your own prose stylesheet.
- **Client runtime** (`@comark/prose/client`) — two dependency-free custom elements (`<prose-tabs>`, `<prose-copy>`) for the parts that need JavaScript. Everything else works without it: callouts, steps, and tables are pure CSS, and accordions use native `<details name>`.

## Installation

```bash
npm install @comark/prose
# or
pnpm add @comark/prose
```

## Usage

```ts
import { parseMarkdown } from 'comark'
import prose from '@comark/prose'

const tree = await parseMarkdown(markdown, { plugins: [prose()] })
```

Add the stylesheets and register the custom elements once on the client:

```ts
import '@comark/prose/components.css'
import '@comark/prose/typography.css' // optional element rhythm
import '@comark/prose/client/register'
```

Or with plain HTML and `@comark/html` — a fully interactive docs page with no framework:

```ts
import { renderHtml } from '@comark/html'
import prose from '@comark/prose'

const html = await renderHtml(markdown, { plugins: [prose()] })
```

```html
<link rel="stylesheet" href="@comark/prose/components.css" />
<div class="comark-content"><!-- rendered html --></div>
<script type="module">
  import '@comark/prose/client/register'
</script>
```

## What gets lowered

| Markdown | Output | JavaScript |
| --- | --- | --- |
| `::note`, `::tip`, `::warning`, `::caution`, `::callout{color}`, `> [!NOTE]` | `<div class="prose-callout" role="note" data-variant>` | none |
| `::tabs` + `::tab-item{label}` | `<prose-tabs>` with a WAI-ARIA tablist | tab switching, keyboard nav, group sync |
| `::code-group` | same tabs markup, labelled by filename/language | same |
| `::steps{level}` | `<div class="prose-steps">`, CSS counters on child headings | none |
| `::accordion` + `::accordion-item{label}` | native `<details name>` group | none |
| Code fences | `<figure class="prose-pre">` with filename header and copy button | copy to clipboard |
| Headings (`h2`–`h4`) | content wrapped in `<a href="#id">` with a hash icon | none |
| Tables | wrapped in a horizontal scroll container | none |

Without the client runtime, tab panels render stacked (all content stays reachable) and copy buttons stay hidden.

## Styling options

Three ways to style the output — pick one:

1. **Package CSS**: `@comark/prose/components.css` (components) and `@comark/prose/typography.css` (element rhythm). Both are scoped to `.comark-content`, use zero-specificity `:where()` selectors, and derive spacing from three tokens: `--prose-size`, `--prose-leading`, `--prose-flow`. Individual partials are available under `@comark/prose/styles/*.css`.
2. **Any prose stylesheet**: the lowered markup is plain HTML, so container-scoped systems like [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) or [shadcn Typeset](https://ui.shadcn.com/docs/typeset) work as-is — keep `components.css` for the component chrome and skip `typography.css`.
3. **Utility class map**: bake design-system classes into plain tags at parse time:

```ts
prose({
  classes: {
    p: 'my-5 leading-7',
    h2: 'text-2xl font-bold mt-12',
  },
  // optional: tailwind-merge-style class merging
  mergeClass: (theme, author) => twMerge(theme, author as string),
})
```

## Options

```ts
prose({
  elements: {
    headingAnchors: { h2: true, h3: true, h4: true }, // or boolean
    anchorIcon: 'i-lucide-hash', // class string, element node, or false
    tableWrapper: { tag: 'div', class: 'prose-table' }, // or false
  },
  components: {
    callout: true,
    tabs: true,
    codeGroup: true,
    steps: true,
    accordion: true,
    copy: { label: 'Copy code' }, // or boolean
  },
  // per-tag escape hatch, runs before the built-ins
  transform: {
    hr: () => false, // remove
  },
})
```

Set `elements: false` or `components: false` to disable a whole pass. Set a single component key to `false` to keep that tag for a framework component instead.

## Client runtime

```ts
// Register everything (safe on the server, idempotent):
import '@comark/prose/client/register'

// Or selectively:
import { register } from '@comark/prose/client'
register({ tabs: true, copy: false })
```

`<prose-tabs>` supports cross-instance sync: give tabs a key (`::tabs{sync="pkg"}`) and every instance with the same key follows the selected label, persisted in `localStorage`.

## License

[MIT](https://github.com/comarkdown/comark/blob/main/LICENSE)
