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

Use `value` by itself for a truthy check:

```mdc
::if{:value="data.user"}
You are signed in.
::
```

Combine `value` with one or more comparison props. Every supplied comparison must pass:

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
| `value`     | Checked for truthiness when no comparison props are present |
| `eq`        | Requires strict equality                                    |
| `neq`       | Requires strict inequality                                  |
| `gt`        | Requires `value` to be greater than the comparison value    |
| `gte`       | Requires `value` to be greater than or equal to the value    |
| `lt`        | Requires `value` to be less than the comparison value       |
| `lte`       | Requires `value` to be less than or equal to the value       |
| `as`        | Wraps visible content in an allowlisted semantic HTML element |

A comparison never passes when `value` or its comparison value resolves to `undefined`. Use `:` on numeric, boolean, or other JSON values so Comark preserves their type. For example, `:eq="false"` compares against the boolean `false`, while `eq="false"` compares against the string `"false"`.

The `as` prop accepts `div`, `span`, `p`, `section`, `article`, `aside`, `header`, `footer`, `main`, or `nav`. ANSI output validates the prop but renders no wrapper.

To require checks on different values, nest `If` blocks:

```mdc
::if{:value="data.isLoggedIn"}
:::if{:value="data.age" :gte="18"}
Adult member content.
:::
::
```

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

See [Conditional content](#conditional-content) for Markdown examples of truthiness checks, comparisons, wrappers, and nested `#else` branches.

The core entry point also exports the shared `IfProps`, `IfComparisonOperator`, and `IfWrapperTag` types, plus helpers for custom renderer adapters:

- `shouldRenderIf(props)` checks the resolved `value` for truthiness or evaluates the supplied comparisons.
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

## Pipe filters

Apply named value transforms with the `|` pipe operator. Multiple filters chain left-to-right — the output of one becomes the input of the next.

```mdc
{{ user.name | upper }}
{{ bio | truncate:120 | upper }}
{{ user.joined | date:'YYYY-MM-DD' }}
{{ title | upper | truncate:10 || Untitled }}
```

Filters also work in `:prop="..."` attribute bindings on components:

```mdc
::UserCard{:name="user.name | upper"}
::
```

### Built-in filter catalog

The `filters` option defaults to `standardFilters` — a built-in catalog inspired by the [knap standard-filter library](https://knap.md/filters) ([obsidianmd/knap](https://github.com/obsidianmd/knap)), adapted to comark's `(value: unknown, ...args: unknown[]) => unknown` contract. No `filters` prop is required to use built-in filters.

To add or override individual entries, spread `standardFilters`:

```typescript
import { standardFilters } from 'comark/utils'

const filters = {
  ...standardFilters,
  shout: (val) => `${String(val ?? '').toUpperCase()}!!!`,
}
```

Pass no `filters` at all to use only built-ins. Pass a plain `{}` to opt out entirely (all filters then throw on unknown name).

#### Text

- `camel` — convert to camelCase · `{{ tag | camel }}`
- `capitalize` — uppercase first character, lowercase rest · `{{ name | capitalize }}`
- `decode_uri` — decode a percent-encoded URI · `{{ slug | decode_uri }}`
- `encode_uri` — percent-encode a URI component · `{{ query | encode_uri }}`
- `indent` — indent each line (default 2 spaces) · `{{ body | indent:4 }}`
- `kebab` — convert to kebab-case · `{{ title | kebab }}`
- `lower` — convert to lowercase · `{{ role | lower }}`
- `pascal` — convert to PascalCase · `{{ tag | pascal }}`
- `replace` — replace a string or `/regex/flags` · `{{ body | replace:'foo':'bar' }}`
- `safe_name` — replace unsafe file-name characters with `_` · `{{ title | safe_name }}`
- `snake` — convert to snake_case · `{{ label | snake }}`
- `title` — capitalize each word · `{{ name | title }}`
- `trim` — strip leading and trailing whitespace · `{{ input | trim }}`
- `truncate` — cut to N characters (default suffix `…`) · `{{ bio | truncate:120 }}`
- `truncatewords` — cut to N words (default suffix `…`) · `{{ bio | truncatewords:20 }}`
- `uncamel` — split camelCase to spaced lowercase · `{{ prop | uncamel }}`
- `unescape` — unescape `\n`, `\t`, `\"`, etc. · `{{ raw | unescape }}`
- `upper` — convert to uppercase · `{{ code | upper }}`

#### Numbers

- `calc` — arithmetic operation · `{{ price | calc:'*':1.2 }}`
- `number_format` — thousands separators and decimal places · `{{ total | number_format:2 }}`
- `round` — round to N decimal places · `{{ score | round:1 }}`

#### Dates

- `date` — format a date with YYYY MM DD HH mm ss tokens · `{{ created | date:'YYYY-MM-DD' }}`
- `date_modify` — shift a date by an interval · `{{ created | date_modify:'+1 month' }}`
- `duration` — format seconds or an ISO 8601 duration as human text · `{{ elapsed | duration }}`

#### Collections

- `compact` — remove null and empty-string values · `{{ tags | compact | join:', ' }}`
- `first` — first item (or first N items) · `{{ list | first }}`
- `join` — join array with separator · `{{ tags | join:', ' }}`
- `last` — last item (or last N items) · `{{ list | last }}`
- `length` — count characters, items, or keys · `{{ items | length }}`
- `map` — extract a property or render a template · `{{ users | map:'name' }}`
- `merge` — append values to an array · `{{ base | merge:extra }}`
- `nth` — select positions with nth-child syntax · `{{ list | nth:'2n+1' }}`
- `object` — convert object to keys / values / entries · `{{ obj | object:'keys' }}`
- `parse_json` — parse a JSON string · `{{ raw | parse_json }}`
- `reverse` — reverse a string, array, or object · `{{ list | reverse }}`
- `slice` — extract a substring or sub-array · `{{ list | slice:0:10 }}`
- `sort` — sort by value or property · `{{ items | sort:'name' }}`
- `split` — split string into array · `{{ csv | split:',' }}`
- `sum` — sum numeric values or a property · `{{ cart | sum:'price' }}`
- `template` — render each item with `${property}` interpolation · `{{ users | template:'${name} <${email}>' }}`
- `unique` — remove duplicate values · `{{ tags | unique }}`
- `where` — filter items by property value · `{{ items | where:'status':'active' }}`

#### Formatting

These filters produce Markdown or plain strings. Because comark's binding layer resolves values at render time, the returned string is inserted as **text content** and is not re-parsed into AST nodes. Use [components](/syntax/components) when structural output is needed.

- `blockquote` — prefix every line with `> ` · `{{ note | blockquote }}`
- `bold` — wrap in `**` · `{{ label | bold }}`
- `callout` — Obsidian-style callout · `{{ msg | callout:'warning':'Heads up' }}`
- `code` — inline code or fenced block · `{{ snippet | code:'ts' }}`
- `code_block` — fenced code block with language · `{{ body | code_block:'python' }}`
- `comment` — HTML comment · `{{ note | comment }}`
- `embed` — wiki embed `![[…]]` · `{{ path | embed }}`
- `escape_md` — escape Markdown punctuation · `{{ raw | escape_md }}`
- `footnote` — footnote definition(s) · `{{ note | footnote:'1' }}`
- `fragment_link` — link with text-fragment anchor · `{{ text | fragment_link:'https://example.com' }}`
- `h1` … `h6` — heading of that level · `{{ title | h2 }}`
- `hard_break` — convert single newlines to hard breaks · `{{ body | hard_break }}`
- `highlight` — wrap in `==` · `{{ term | highlight }}`
- `hr` — place a horizontal rule before / after / both · `{{ body | hr:'before' }}`
- `image` — image syntax `![alt](url)` · `{{ url | image:'Logo' }}`
- `italic` — wrap in `*` · `{{ label | italic }}`
- `link` — link syntax `[text](url)` · `{{ url | link:'Click here' }}`
- `list` — bullet list · `{{ items | list }}`
- `math` — inline math `$…$` · `{{ expr | math }}`
- `math_block` — block math `$$…$$` · `{{ expr | math_block }}`
- `strike` — wrap in `~~` · `{{ old | strike }}`
- `table` — compact Markdown table · `{{ rows | table }}`
- `table_pretty` — padded Markdown table · `{{ rows | table_pretty }}`
- `wikilink` — wiki link `[[…]]` · `{{ page | wikilink }}`
- `yaml` — serialize as YAML · `{{ config | yaml }}`
- `yaml_property` — full YAML property · `{{ value | yaml_property:'key' }}`

#### HTML cleanup

These filters transform HTML strings without a DOM. They are included in `standardFilters`.

- `remove_attr` — remove named attributes · `{{ html | remove_attr:'style':'class' }}`
- `remove_tags` — remove tags but keep content · `{{ html | remove_tags:'span' }}`
- `replace_tags` — rename tags · `{{ html | replace_tags:'b':'strong' }}`
- `strip_attr` — remove all attributes except an allowlist · `{{ html | strip_attr:'href' }}`
- `strip_md` — remove inline Markdown formatting · `{{ body | strip_md }}`
- `strip_tags` — remove all tags except an allowlist · `{{ html | strip_tags:'a':'strong' }}`

#### HTML parsing (opt-in)

Heavier HTML tree filters are excluded from `standardFilters` and must be imported explicitly:

```typescript
import { htmlFilters } from 'comark/utils/filters/html'
import { standardFilters } from 'comark/utils'

const filters = { ...standardFilters, ...htmlFilters }
```

- `html_to_json` — parse an HTML fragment into a JSON tree · `{{ markup | html_to_json }}`
- `remove_html` — remove specific elements and their contents · `{{ html | remove_html:'script':'style' }}`

### Registering custom filters

Pass a `filters` object to the renderer. Custom entries are merged over `standardFilters`:

```typescript
import binding, { Binding, standardFilters } from '@comark/html/plugins/binding'
import { createHtmlRenderer } from '@comark/html'

const renderHtml = createHtmlRenderer({
  plugins: [binding()],
  components: { Binding },
  filters: {
    ...standardFilters,
    shout: (val) => `${String(val ?? '').toUpperCase()}!!!`,
    excerpt: (val, length) => {
      const s = String(val ?? '')
      const n = typeof length === 'number' ? length : 120
      return s.length > n ? `${s.slice(0, n)}…` : s
    },
  },
})
```

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import binding, { Binding, standardFilters } from '@comark/vue/plugins/binding'

const filters = {
  ...standardFilters,
  shout: (val: unknown) => `${String(val ?? '').toUpperCase()}!!!`,
}
</script>

<template>
  <Suspense>
    <Markdown
      :value="markdown"
      :plugins="[binding()]"
      :components="{ Binding }"
      :filters="filters"
    />
  </Suspense>
</template>
```

### Filter argument syntax

Arguments are colon-delimited literals appended after the filter name:

| Expression | Result |
| --- | --- |
| `\| truncate:120` | numeric arg `120` |
| `\| clamp:0:100` | two numeric args `0` and `100` |
| `\| date:'YYYY-MM-DD HH:mm'` | string arg (colons inside quotes are safe) |
| `\| wrap:true` | boolean arg |

### Composing filters with the default operator

Filters and `||` can be combined. Filters run first, then the default applies if the final result is `null` or `undefined`:

```mdc
{{ user.bio | truncate:200 || No biography provided. }}
```

### Unknown filters

A filter name that is not found in the registry throws an error at render time:

```
Unknown binding filter: "myFilter"
```

This prevents silent data loss. Ensure every filter used in markdown is registered before rendering.

## See also

- [Data Binding](/syntax/components#data-binding): the underlying `:prefix` resolution contract
- [Component Syntax](/syntax/components): the full Comark component API
- [Creating Plugins](/plugins/custom/plugin-api): build your own plugins
