import { renderHtml } from '@comark/html'
import prose from '@comark/prose'
import '@comark/prose/components.css'
import '@comark/prose/typography.css'
import '@comark/prose/client/register'
import './style.css'

const SAMPLE = `# Comark Prose

A complete docs page rendered to **plain HTML** with \`@comark/html\` — no framework.
Tabs, code groups and copy buttons come from two tiny custom elements; everything else
is pure HTML and CSS.

## Callouts

::note
Callouts are plain \`<div role="note">\` elements. Zero JavaScript.
::

::warning{title="Careful"}
They support variants, titles and GFM alert syntax too.
::

> [!TIP]
> This one was written as a GFM alert (\`> [!TIP]\`).

## Tabs

:::tabs{sync="pkg"}
  ::tab-item{label="pnpm"}
  Install with \`pnpm add @comark/prose\`.
  ::
  ::tab-item{label="npm"}
  Install with \`npm install @comark/prose\`.
  ::
:::

## Code group

Both groups share the \`sync="pkg"\` key with the tabs above — switch one and the others follow.

::code-group{sync="pkg"}
~~~bash [pnpm]
pnpm add @comark/prose
~~~
~~~bash [npm]
npm install @comark/prose
~~~
::

## Code block with copy button

~~~ts [render.ts]
import { renderHtml } from '@comark/html'
import prose from '@comark/prose'

const html = await renderHtml(markdown, { plugins: [prose()] })
~~~

## Steps

::steps{level="3"}

### Install the package

Add \`@comark/prose\` to your project.

### Register the plugin

Pass \`prose()\` to \`parseMarkdown\` or \`renderHtml\`.

### Ship it

Style with the package CSS or bring your own.

::

## Accordion

:::accordion
  ::accordion-item{label="Does this need a framework?"}
  No. This whole page is an HTML string plus one script tag.
  ::
  ::accordion-item{label="What about accessibility?"}
  Tabs follow the WAI-ARIA tabs pattern, accordions are native \`<details>\`,
  and copy results are announced in a live region.
  ::
:::

## Table

| Layer | Import | Needed for |
| --- | --- | --- |
| Plugin | \`@comark/prose\` | lowering components to HTML |
| CSS | \`@comark/prose/components.css\` | styling |
| Client | \`@comark/prose/client/register\` | tabs + copy interactivity |
`

const app = document.querySelector('#app')!
app.innerHTML = await renderHtml(SAMPLE, { plugins: [prose()] })
