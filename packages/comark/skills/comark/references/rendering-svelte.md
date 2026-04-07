# Svelte Rendering Guide

Complete guide for rendering Comark AST in Svelte 5 applications.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Custom Components](#custom-components)
- [Dynamic Component Resolution](#dynamic-component-resolution)
- [Slots Support](#slots-support)
- [Props Mapping](#props-mapping)
- [Streaming Mode](#streaming-mode)
- [Prose Components](#prose-components)
- [Experimental Async](#experimental-async)
- [Custom Props Handling](#custom-props-handling)
- [CSS Class](#css-class)

---

## Basic Usage

Use the `Comark` component to render markdown:

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'

  const content = `
# Hello World

This is **markdown** content.

::alert{type="info"}
Important message
::
`
</script>

<Comark markdown={content} />
```

---

## Custom Components

Map custom Svelte components to Comark elements:

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import CustomHeading from './CustomHeading.svelte'
  import CustomAlert from './CustomAlert.svelte'
  import CustomCard from './CustomCard.svelte'

  const customComponents = {
    h1: CustomHeading,
    h2: CustomHeading,
    alert: CustomAlert,
    card: CustomCard,
  }
</script>

<Comark markdown={content} components={customComponents} />
```

### Component Resolution Order

Components are resolved by checking these keys in order:
1. `Prose{PascalTag}` — e.g., `ProseH1` for `<h1>` tags
2. `PascalTag` — e.g., `Alert` for `::alert` components
3. `tag` — e.g., `alert` for `::alert` components

### Custom Component Example

Custom components receive AST node attributes as props and children as a Svelte `children` snippet:

```svelte
<!-- CustomHeading.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let { id, children }: { id?: string, children?: Snippet } = $props()
</script>

<h1 {id} class="custom-heading">
  {@render children?.()}
</h1>
```

### Alert Component Example

```svelte
<!-- CustomAlert.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    type = 'info',
    children,
  }: {
    type?: 'info' | 'warning' | 'error' | 'success'
    children?: Snippet
  } = $props()

  const icons = {
    info: '\u2139\uFE0F',
    warning: '\u26A0\uFE0F',
    error: '\u274C',
    success: '\u2705',
  }
</script>

<div class="alert alert-{type}" role="alert">
  <div class="alert-icon">{icons[type]}</div>
  <div class="alert-content">{@render children?.()}</div>
</div>
```

---

## Dynamic Component Resolution

Load components dynamically using `componentsManifest`:

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'

  const componentMap: Record<string, () => Promise<any>> = {
    'alert': () => import('./Alert.svelte'),
    'card': () => import('./Card.svelte'),
    'button': () => import('./Button.svelte'),
  }

  async function loadComponent(name: string) {
    if (componentMap[name]) {
      const mod = await componentMap[name]()
      return mod.default
    }
    throw new Error(`Component ${name} not found`)
  }
</script>

<Comark markdown={content} componentsManifest={loadComponent} />
```

---

## Slots Support

Comark components with named slots work in Svelte using the `children` snippet pattern:

### Markdown with Slots

```markdown
::card
#header
## Card Title

#default
Main content here with **markdown** support

#footer
Footer text
::
```

### Custom Component with Slots

In Svelte 5, children are passed as implicit slot content and received as a `Snippet`:

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    children,
  }: {
    children?: Snippet
  } = $props()
</script>

<div class="card">
  {@render children?.()}
</div>

<style>
  .card {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    padding: 1rem;
  }
</style>
```

Note: Named slots from Comark (`#header`, `#content`, `#footer`) are rendered as `template` elements in the AST. The Svelte renderer passes all children (including named slot templates) as a single `children` snippet. To handle named slots individually, access the `__node` prop and filter children by template name.

---

## Props Mapping

The Svelte renderer maps AST attributes to component props:

### Attribute Mapping

```
// Markdown attribute → Svelte prop
{class="foo"}           → class="foo"    (pass-through)
{className="foo"}       → class="foo"    (mapped)
{style="color: red"}    → style="color: red"  (pass-through as string)
{tabindex="0"}          → tabindex="0"   (pass-through)
{:bool="true"}          → bool={true}    (parsed from string)
{:count="5"}            → count={5}      (parsed as number)
{:data='{"key":"val"}'} → data={{key:"val"}} (parsed as object)
```

Svelte is closer to HTML than React, so most attributes pass through unchanged. The only mapping is `className` → `class`. Colon-prefixed attributes (`:prop="value"`) are parsed as typed values (boolean, number, JSON).

### Boolean Props

```
// Markdown: ::component{:disabled="true"}
// Svelte prop: disabled={true}

// Markdown: ::component{:visible="false"}
// Svelte prop: visible={false}
```

### Number Props

```
// Markdown: ::component{:count="5"}
// Svelte prop: count={5}

// Markdown: ::component{:max="100"}
// Svelte prop: max={100}
```

### Object/Array Props

```
// Markdown: ::component{:config='{"theme":"dark"}'}
// Svelte prop: config={{theme:"dark"}}

// Markdown: ::component{:items='["a","b","c"]'}
// Svelte prop: items={["a","b","c"]}
```

---

## Streaming Mode

Use the `Comark` component with `$state` for streaming content:

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'

  let content = $state('')
  let isStreaming = $state(false)

  async function streamContent() {
    isStreaming = true
    const response = await fetch('/api/content.md')
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      content += decoder.decode(value, { stream: true })
    }

    isStreaming = false
  }
</script>

<Comark markdown={content} streaming={isStreaming} caret />
```

The `caret` prop appends a blinking cursor indicator to the last text node during streaming. Customize with a CSS class:

```svelte
<Comark markdown={content} streaming={isStreaming} caret={{ class: 'my-caret' }} />
```

`autoClose` is enabled by default — incomplete syntax like `**bold text` is automatically closed on every parse.

---

## Prose Components

Override native HTML elements using the `Prose` prefix:

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import ProseH1 from './ProseH1.svelte'
  import ProseA from './ProseA.svelte'
  import ProsePre from './ProsePre.svelte'

  const components = { ProseH1, ProseA, ProsePre }
</script>

<Comark markdown={content} {components} />
```

### Tailwind CSS Prose

```svelte
<article class="prose prose-lg dark:prose-dark max-w-none">
  <Comark markdown={content} />
</article>
```

---

## Experimental Async

The `ComarkAsync` component uses Svelte's experimental `await` in `$derived` for a declarative approach. Requires `experimental.async` in your Svelte config:

```js
// svelte.config.js
const config = {
  compilerOptions: {
    experimental: { async: true },
  },
}
export default config
```

Usage with `<svelte:boundary>`:

```svelte
<script lang="ts">
  import { ComarkAsync } from '@comark/svelte/async'
</script>

<svelte:boundary>
  <ComarkAsync markdown={content} />
  {#snippet pending()}
    <p>Loading...</p>
  {/snippet}
  {#snippet failed(error, reset)}
    <p>Error: {error.message}</p>
    <button onclick={reset}>Retry</button>
  {/snippet}
</svelte:boundary>
```

---

## Custom Props Handling

Access props in custom components:

```svelte
<!-- CustomAlert.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    type = 'info',
    count,
    data,
    children,
  }: {
    type?: string       // From {type="info"}
    count?: number      // From {:count="5"}
    data?: object       // From {:data='{"key":"val"}'}
    children?: Snippet
  } = $props()
</script>

<div
  class="alert alert-{type}"
  data-count={count}
  data-info={JSON.stringify(data)}
  role="alert"
>
  {@render children?.()}
</div>
```

### Working with Complex Props

```svelte
<!-- DataTable.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    columns = [],
    sortable = false,
    striped = false,
    children,
  }: {
    columns?: string[]   // From {:columns='["Name","Age"]'}
    sortable?: boolean   // From {:sortable="true"}
    striped?: boolean    // From {:striped="true"}
    children?: Snippet
  } = $props()
</script>

<table class:table-striped={striped}>
  {#if columns.length > 0}
    <thead>
      <tr>
        {#each columns as col (col)}
          <th>
            {col}
            {#if sortable}<button>↕</button>{/if}
          </th>
        {/each}
      </tr>
    </thead>
  {/if}
  <tbody>{@render children?.()}</tbody>
</table>
```

**Usage in Markdown:**

```markdown
::data-table{:columns='["Name", "Age", "Email"]' :sortable="true" :striped="true"}
Table content here
::
```

---

## CSS Class

Add a custom wrapper class:

```svelte
<Comark markdown={content} class="prose dark:prose-dark" />
```

### With Tailwind CSS

```svelte
<Comark
  markdown={content}
  class="prose prose-slate lg:prose-xl dark:prose-invert max-w-none"
/>
```

---

[← Back to Main Skills Guide](../SKILL.md)
