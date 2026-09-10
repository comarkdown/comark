---
title: Binding
description: "Interpolate data with `{{ path || default }}` and conditionally render content with `::if`."
navigation:
  icon: i-lucide-replace
seo:
  title: Binding Plugin
links:
  - label: Data Binding
    icon: i-lucide-link-2
    to: /syntax/components#data-binding
    color: neutral
    variant: soft
  - label: Parse API
    icon: i-lucide-code
    to: /reference/parse
    color: neutral
    variant: soft
---

The `comark/plugins/binding` module lets you interpolate values with `{{ path || default }}` and conditionally render content with `::if`. Values can come from frontmatter, the renderer's `data` prop, the tree's `meta`, or a parent component's `props`.

The `binding()` parser plugin emits a `binding` component node whose `:value` attribute points at a dot-path. The [data binding](/syntax/components#data-binding) layer resolves that path against the ambient render context, so bindings work across HTML, ANSI, Vue, React, Svelte, Angular, and Nuxt, and round-trip back to their source form via `renderMarkdown`.

## Basic usage

### Registering the plugin

```typescript [parse.ts]
import { parseMarkdown } from 'comark'
import binding from 'comark/plugins/binding'

const tree = await parseMarkdown(content, {
  plugins: [binding()],
})
```

### In Markdown

Wrap a dot-path in `{{ … }}` to interpolate a value, and use `||` to declare a default for unresolved paths:

```mdc
---
user:
  name: Ada
  role: admin
---

Welcome, {{ frontmatter.user.name || guest }} ({{ frontmatter.user.role }}).
```

Rendered HTML:

```html
<p>Welcome, Ada (admin).</p>
```

## Render handlers

The plugin ships a renderer-specific `Binding` export for every first-party package so the `<binding>` AST node turns into the resolved value (falling back to the `|| default`) rather than a literal `<binding>` tag.

::code-group

```typescript [HTML]
import binding, { Binding } from '@comark/html/plugins/binding'
import { createHtmlRenderer } from '@comark/html'

const renderHtml = createHtmlRenderer({
  plugins: [binding()],
  components: { Binding },
})

const html = await renderHtml(`
---
user:
  name: Ada
---

Hello {{ frontmatter.user.name }}!
`)
// → <p>Hello Ada!</p>
```

```typescript [ANSI]
import binding, { Binding } from '@comark/ansi/plugins/binding'
import { renderAnsiFromDocument } from '@comark/ansi'
import { parseMarkdown } from 'comark'

const tree = await parseMarkdown('Score: {{ data.score || 0 }}', { plugins: [binding()] })
const out = await renderAnsiFromDocument(tree, {
  components: { Binding },
  data: { score: 42 },
})
// → Score: 42
```

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import binding, { Binding } from '@comark/vue/plugins/binding'

const markdown = `---
user:
  name: Ada
---

Welcome, {{ frontmatter.user.name || guest }}.`
</script>

<template>
  <Suspense>
    <Markdown
      :value="markdown"
      :plugins="[binding()]"
      :components="{ Binding }"
    />
  </Suspense>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import binding, { Binding } from '@comark/react/plugins/binding'

const markdown = `---
user:
  name: Ada
---

Welcome, {{ frontmatter.user.name || guest }}.`

export default function App() {
  return (
    <Markdown
      value={markdown}
      plugins={[binding()]}
      components={{ Binding }}
    />
  )
}
```

```svelte [Svelte]
<script lang="ts">
  import { Markdown } from '@comark/svelte'
  import binding, { Binding } from '@comark/svelte/plugins/binding'

  const markdown = `---
user:
  name: Ada
---

Welcome, {{ frontmatter.user.name || guest }}.`
</script>

<Markdown
  value={markdown}
  plugins={[binding()]}
  components={{ Binding }}
/>
```

::

## Conditional content

Register the renderer-specific `If` export to render a block only when its resolved props pass. The `::if` syntax uses Comark's default component parser and data-binding layer, so it doesn't require the `binding()` parser plugin unless the same document also uses `{{ … }}` interpolation.

```typescript [render.ts]
import { renderHtml } from '@comark/html'
import { If } from '@comark/html/plugins/binding'

const html = await renderHtml(markdown, {
  components: { If },
  data: {
    user: { role: 'member' },
    age: 42,
  },
})
```

Use `condition` for a truthy check:

```mdc
::if{:condition="data.user"}
You are signed in.
::
```

Use `value` by itself for a truthy check, or combine it with one or more comparison props. Every supplied comparison must pass:

```mdc
::if{:value="data.user.role" neq="guest"}
This content is available to members.
::

::if{:value="data.age" :gte="18" :lt="65" as="section"}
This content is wrapped in a section.
::
```

| Prop        | Behavior                                                    |
| ----------- | ----------------------------------------------------------- |
| `condition` | Must be truthy when present                                 |
| `value`     | Checked for truthiness when neither `condition` nor comparison props are present |
| `eq`        | Requires strict equality                                    |
| `neq`       | Requires strict inequality                                  |
| `gt`        | Requires `value` to be greater than the comparison value    |
| `gte`       | Requires `value` to be greater than or equal to the value    |
| `lt`        | Requires `value` to be less than the comparison value       |
| `lte`       | Requires `value` to be less than or equal to the value       |
| `as`        | Wraps visible content in an allowlisted semantic HTML element |

A comparison never passes when `value` or its comparison value resolves to `undefined`. Use `:` on numeric, boolean, or other JSON values so Comark preserves their type. For example, `:eq="false"` compares against the boolean `false`, while `eq="false"` compares against the string `"false"`.

The `as` prop accepts `div`, `span`, `p`, `section`, `article`, `aside`, `header`, `footer`, `main`, or `nav`. ANSI output validates the prop but renders no wrapper.

### Else branches

Use the `#else` slot to show fallback content when the condition or any comparison fails. No blank line is required before `#else`:

```mdc
::if{:value="data.isHappy"}
I am happy.
#else
I am NOT happy.
::
```

Nest another `If` in the else slot to check a second condition:

```mdc
::if{:value="data.isHappy"}
I am happy.
#else
:::if{:value="data.isFine"}
I am fine.
#else
I am NOT fine and NOT happy.
:::
::
```

Each `#else` belongs to its enclosing component. Only the selected branch renders, and `as` wraps whichever branch is selected. Without an else slot, a failed condition produces no output. This works with all renderer-specific `If` exports.

## Markdown round-trip

When you re-serialize the AST with `renderMarkdown`, you can pass the core `Binding` handler to preserve the original `{{ … }}` shorthand:

```typescript [render-markdown.ts]
import { parseMarkdown } from 'comark'
import { renderMarkdown } from 'comark/render'
import binding, { Binding } from 'comark/plugins/binding'

const document = await parseMarkdown('Hi {{ user.name }}!', { plugins: [binding()] })

const source = await renderMarkdown(document, {
  components: { Binding },
})
// → "Hi {{ user.name }}!\n"
```

## Resolution scope

A binding value (`{{ path }}`) is resolved as a dot-path against the same render context used by `:prefix` component bindings:

| Namespace     | Source                                                             |
| ------------- | ------------------------------------------------------------------ |
| `frontmatter` | The document's YAML frontmatter                                    |
| `meta`        | Plugin-populated metadata on the parsed tree                        |
| `data`        | Runtime values passed via the renderer's `data` prop               |
| `props`       | The enclosing component's own props (useful for nested components) |

See [Data Binding](/syntax/components#data-binding) for the full contract and additional examples.

## Default values

Use `|| default` to specify a fallback that's emitted when the dot-path does not resolve:

```mdc
Hello {{ data.user.name || guest }}!
```

- If `data.user.name` resolves, its value is rendered.
- Otherwise the literal text after `||` is rendered (trim and quote as you see fit; YAML rules don't apply here).

## Custom tag name

You can swap the emitted element tag via the plugin's `tag` option. This is handy if you already use `binding` as a custom component name:

```typescript
import binding from 'comark/plugins/binding'

const tree = await parseMarkdown('{{ x }}', {
  plugins: [binding({ tag: 'prop' })],
})

// AST: ['p', {}, ['prop', { ':value': 'x' }]]
```

Pair this with a `components: { prop: Binding }` mapping to preserve the render behavior.

## API reference

### `binding(options?: MdcInlineBindingOptions): ComarkPlugin`

Register the inline-binding parser.

| Option | Type     | Default     | Description                                  |
| ------ | -------- | ----------- | -------------------------------------------- |
| `tag`  | `string` | `"binding"` | Tag name used for the emitted inline element |

### `Binding`

Every first-party package exports a `Binding` handler/component tailored to its rendering target. Each one:

- Prefers the already-resolved `value` prop supplied by the data-binding layer
- Falls back to `defaultValue` when the path does not resolve
- Emits an empty string when neither is available (the ANSI variant shows a dimmed `{{ path }}` placeholder for debuggability)

```typescript
// markdown (source shorthand)
import { Binding } from 'comark/plugins/binding'

// HTML
import { Binding } from '@comark/html/plugins/binding'

// ANSI
import { Binding } from '@comark/ansi/plugins/binding'

// React
import { Binding } from '@comark/react/plugins/binding'

// Svelte
import { Binding } from '@comark/svelte/plugins/binding'

// Vue
import { Binding } from '@comark/vue/plugins/binding'

// Angular
import { Binding } from '@comark/angular/plugins/binding'

// Nuxt (Vue implementation)
import { Binding } from '@comark/nuxt/plugins/binding'
```

### `If`

Every renderer-specific binding entry point exports an `If` adapter. Register it under `components` to enable `::if` blocks:

```typescript
import { If } from '@comark/html/plugins/binding'

const components = { If }
```

Replace `html` with `ansi`, `vue`, `react`, `svelte`, `angular`, or `nuxt` for the corresponding renderer. Hidden Angular branches are structural: their descendants aren't instantiated.

The core entry point also exports the shared `IfProps`, `IfComparisonOperator`, and `IfWrapperTag` types, plus helpers for custom renderer adapters:

- `shouldRenderIf(props)` evaluates resolved condition and comparison props.
- `selectIfBranch(children, matches)` selects default or else AST children. It returns `undefined` when the condition fails and no else slot exists.
- `resolveIfWrapper(value)` validates the optional wrapper tag.

```typescript
import {
  resolveIfWrapper,
  selectIfBranch,
  shouldRenderIf,
  type IfProps,
} from 'comark/plugins/binding'
```

## Use cases

1. **Personalized content**: greet users by name from frontmatter or runtime data:

   ```mdc
   Hello {{ data.user.name || friend }}!
   ```

2. **Documentation templates**: interpolate configuration or versioned values:

   ```mdc
   ---
   version: 2.5.1
   ---

   You are reading the docs for **v{{ frontmatter.version }}**.
   ```

3. **Dynamic tables**: combine with frontmatter-driven rows:

   ```mdc
   ---
   stats:
     users: 1200
     uptime: 99.9%
   ---

   | Metric | Value                       |
   | ------ | --------------------------- |
   | Users  | {{ frontmatter.stats.users }} |
   | Uptime | {{ frontmatter.stats.uptime }} |
   ```

4. **Component props**: reference an enclosing component's resolved attributes:

   ```mdc
   ::card{title="Hello"}
     Title is {{ props.title }}.
   ::
   ```

## See also

- [Data Binding](/syntax/components#data-binding): the underlying `:prefix` resolution contract
- [Component Syntax](/syntax/components): the full Comark component API
- [Creating Plugins](/plugins/custom/plugin-api): build your own plugins
