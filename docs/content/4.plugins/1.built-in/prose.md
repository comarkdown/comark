---
title: Prose
description: Lower callouts, tabs, code groups, steps and accordions into plain HTML that works with any renderer, plus optional CSS and a tiny client runtime.
seo:
  title: Prose Plugin
navigation:
  icon: i-lucide-panels-top-left
links:
  - label: Components Syntax
    icon: i-lucide-component
    to: /syntax/components
    color: neutral
    variant: soft
  - label: HTML Renderer
    icon: i-lucide-file-code
    to: /rendering/html
    color: neutral
    variant: soft
---

The `@comark/prose` package makes docs components framework-agnostic. Its `prose` plugin lowers component tags — callouts, tabs, code groups, steps, accordions, GFM alerts — into plain, accessible HTML at parse time. Every renderer benefits: Vue, React, Svelte, Angular, and `@comark/html` string output.

The package has three independent layers:

- **Plugin**: rewrites the tree into semantic markup with `prose-*` classes.
- **CSS**: token-driven component styles, plus an optional typographic baseline.
- **Client runtime**: two dependency-free custom elements for the parts that need JavaScript. Callouts, steps, and tables are pure CSS; accordions use native `<details name>`.

## Installation

::code-group
```bash [pnpm]
pnpm add @comark/prose
```
```bash [npm]
npm install @comark/prose
```
::

## Usage

```typescript
import { parseMarkdown } from 'comark'
import prose from '@comark/prose'

const tree = await parseMarkdown(content, {
  plugins: [prose()],
})
```

Add the stylesheets and register the custom elements once on the client:

```typescript
import '@comark/prose/components.css'
import '@comark/prose/typography.css' // optional element rhythm
import '@comark/prose/client/register'
```

With `@comark/html`, this produces a fully interactive docs page without any framework:

```typescript
import { renderHtml } from '@comark/html'
import prose from '@comark/prose'

const html = await renderHtml(content, { plugins: [prose()] })
```

::note
The plugin only transforms the tree. Rendering, styling, and interactivity stay decoupled, so you can adopt one layer at a time.
::

## What gets lowered

| Markdown | Output | JavaScript |
| --- | --- | --- |
| `::note`, `::tip`, `::warning`, `::caution`, `::callout{color}`, `> [!NOTE]` | `<div class="prose-callout" role="note" data-variant>` | none |
| `::tabs` with `::tab-item{label}` | `<prose-tabs>` with a WAI-ARIA tablist | tab switching, keyboard navigation, group sync |
| `::code-group` | same tabs markup, labelled by filename or language | same |
| `::steps{level}` | `<div class="prose-steps">` with CSS counters on child headings | none |
| `::accordion` with `::accordion-item{label}` | native `<details name>` group | none |
| Code fences | `<figure class="prose-pre">` with filename header and copy button | copy to clipboard |
| Headings `h2`–`h4` | content wrapped in `<a href="#id">` with a hash icon | none |
| Tables | wrapped in a horizontal scroll container | none |

Without the client runtime, tab panels render stacked so all content stays reachable, and copy buttons stay hidden (`prose-copy:not(:defined)`).

## Options

```typescript
prose({
  elements: {
    // Which heading levels get anchor links (default: h2-h4)
    headingAnchors: { h2: true, h3: true, h4: true },
    // Class string, element node, or false (default: inline hash SVG)
    anchorIcon: 'i-lucide-hash',
    // Table scroll container (default: <div class="prose-table">)
    tableWrapper: { tag: 'div', class: 'prose-table' },
  },
  components: {
    callout: true,
    tabs: true,
    codeGroup: true,
    steps: true,
    accordion: true,
    // Copy button label, or false to disable
    copy: { label: 'Copy code' },
  },
})
```

Set `elements: false` or `components: false` to disable a whole pass. Set a single component key to `false` to keep that tag for a framework component instead — for example `components: { tabs: false }` when your Vue app renders `::tabs` with its own component.

### Class map for design systems

Bake utility classes into plain tags at parse time when your design system styles elements with classes instead of a stylesheet:

```typescript
prose({
  classes: {
    p: 'my-5 leading-7',
    h2: 'text-2xl font-bold mt-12',
  },
  // Optional: tailwind-merge-style merging with author classes
  mergeClass: (theme, author) => twMerge(theme, author as string),
})
```

### Per-tag transform

The `transform` option runs before the built-in lowerings. Return a node to replace, `false` to remove, or `undefined` to fall through:

```typescript
prose({
  transform: {
    note: (node) => ['mark', {}, ...node.slice(2)],
    hr: () => false,
  },
})
```

## Styling

`@comark/prose/components.css` styles the lowered markup. It is scoped to `.comark-content` (the wrapper class the renderers emit), uses zero-specificity `:where()` selectors so plain CSS and utilities override it, and stays append-stable for streaming: spacing flows through `margin-block-start` only, with no forward-looking selectors.

Three rhythm tokens drive everything, with color hooks based on `light-dark()`:

```css
:where(.comark-content) {
  --prose-size: 1em; /* base font size */
  --prose-leading: 1.75; /* line height */
  --prose-flow: 1.25em; /* space between blocks */
}
```

- `@comark/prose/typography.css` adds an optional typographic baseline for plain elements. Skip it if you already use a prose stylesheet such as Tailwind Typography or shadcn Typeset — the lowered markup is plain HTML, so container-scoped systems work as-is.
- Individual partials are available under `@comark/prose/styles/*.css` for cherry-picking.
- Add `not-prose` to a subtree to opt it out of the typography baseline.

## Client runtime

The runtime registers two custom elements. It has no dependencies and is safe to import on the server:

```typescript
// Register everything (idempotent):
import '@comark/prose/client/register'

// Or selectively:
import { register } from '@comark/prose/client'
register({ tabs: true, copy: false })
```

- `<prose-tabs>` wires clicks, arrow-key navigation (WAI-APG, automatic activation), and group sync: instances sharing `::tabs{sync="pkg"}` follow each other's selected label, persisted in `localStorage`. Streamed panels are picked up automatically.
- `<prose-copy>` copies the code block text on click, flips `data-copied` for the icon swap, and announces the result in a live region.
