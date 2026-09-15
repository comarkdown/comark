---
title: Template
description: "Dependency-free Jinja-style blocks with JavaScript expressions across every Comark renderer."
---

# Template

The opt-in template plugin adds Jinja-style control blocks with a restricted JavaScript expression language, without additional dependencies. It parses controls into serializable document nodes. Each renderer resolves those nodes using its current `data`, before invoking components. Interpolated values become text, not executable Markdown or HTML.

Keep the familiar `{% if %}` and `{% for %}` delimiters, but use JavaScript operators, ternaries, and allowlisted dot methods inside expressions. This is neither full Jinja nor unrestricted JavaScript. Existing component syntax and the binding plugin remain unchanged. Do not combine `template()` with `binding()`: both own `{{ ... }}`, so combining them throws an error.

## Usage

For an editable Vue playground, run `pnpm dev:template` from the repository root.
The example in `examples/3.plugins/vue-vite-template` includes conditionals,
nested loops, `filter`/`map`, object methods, frontmatter and component props, with editable JSON data
and a resolved-document view.

```typescript
import { renderHtml } from '@comark/html'
import template from '@comark/html/plugins/template'

const html = await renderHtml(`
{% for user in users.filter(user => user.active) %}
### {{ user.name }}
{% if user.admin %}
Administrator
{% elif user.member %}
Member
{% else %}
Guest
{% endif %}
{% else %}
No active users.
{% endfor %}
`, {
  plugins: [template()],
  data: { users: [{ name: 'Ada', active: true, admin: true }] },
})
```

Use the corresponding import from `@comark/react/plugins/template`, `@comark/vue/plugins/template`, `@comark/svelte/plugins/template`, `@comark/angular/plugins/template`, `@comark/ansi/plugins/template`, or `@comark/nuxt/plugins/template`. No additional render components need registration.

```tsx
import { Markdown } from '@comark/react'
import template from '@comark/react/plugins/template'

<Markdown plugins={[template()]} data={{ online: true }}>
  {"Status: {{ online ? 'Online' : 'Offline' }}"}
</Markdown>
```

Low-level `MarkdownDocument` components also evaluate templates automatically. Parse once with `template()`, serialize the document if needed, then supply runtime `data` to the renderer. Changing that data reevaluates the document without changing the parsed source.

## Conditions

```mdc
{% if user && user.active %}
Active
{% elif user !== undefined %}
Inactive
{% else %}
Unknown
{% endif %}

{{ age >= 18 ? 'Adult' : 'Minor' }}
```

Conditions select the first matching branch. Any number of `elif` branches may precede one optional final `else`. Conditions and loops can nest inside each other. Only the selected branch is evaluated and rendered; parse-time Markdown plugins still see the entire source.

Conditions use JavaScript truthiness: empty arrays and objects are true; empty strings, zero, `NaN`, `false`, `null`, and `undefined` are false. `&&`, `||`, `??`, and `?:` short-circuit. Both ternary branches are required. Use `items.length` to test whether an array is empty.

## Loops

```mdc
{% for user in users.filter(user => user.active) %}
{{ loop.index }}. {{ user.name }}
{% else %}
No active users.
{% endfor %}

{% for key, value in Object.entries(settings) %}
{{ key }}: {{ value }}
{% endfor %}

{% for number in [1, 2, 3] %}{{ number }}{% endfor %}
```

Arrays iterate values, strings iterate characters, and objects iterate own enumerable keys in JavaScript key order. Use `Object.entries(settings)` for key/value pairs, or `Object.keys` / `Object.values` for explicit key/value iteration. Multiple loop names unpack each item with an exact arity check. Missing/null collections are empty; other non-iterable values throw. The loop header remains template syntax (`for item in expression`), not JavaScript `for...in` semantics.

A loop's `else` runs when the collection is empty, including after `.filter(...)`, not when rendered content happens to be empty. Supply numeric sequences as data or array literals; there is no `range()` helper.

Each iteration has its own local variables. Nested loops can shadow outer names without leaking changes. An inner loop has its own `loop`; outer items remain available under their original names unless shadowed. Reserved namespaces (`loop`, `data`, `frontmatter`, `meta`, `props`, `Object`, and `Array`) and literal keywords cannot be loop aliases.

Loop metadata is calculated after filtering:

| Name | Meaning |
| --- | --- |
| `loop.index`, `loop.index0` | One-based and zero-based position |
| `loop.revindex`, `loop.revindex0` | Reverse positions |
| `loop.first`, `loop.last` | Boundary flags |
| `loop.length` | Number of matching items |

## Expressions And Data

Runtime data keys are available directly (`user.name`) and under `data` (`data.user.name`). `frontmatter`, `meta`, and the enclosing component's resolved `props` are explicit namespaces. Loop locals also work in existing Comark bound attributes:

```mdc
{% for user in users %}
::profile{:user="user"}
{{ props.user.name }}
::
{% endfor %}
```

Supported expressions include quoted strings, decimal numbers, `true`, `false`, `null`, `undefined`, array/object literals, parentheses, dot/bracket access, `+`, `-`, `*`, `/`, `%`, `**`, comparisons (`===`, `!==`, `==`, `!=`, `<`, `<=`, `>`, `>=`), `&&`, `||`, `??`, `!`, and `condition ? yes : no`. Operators use JavaScript precedence and numeric behavior. Use `age >= 18 && age < 65`, not chained mathematical comparisons. Parentheses are required when mixing `??` with `&&` or `||`.

Prefer strict equality. Loose equality supports primitive coercion and object identity, but never coerces objects to primitives. Arithmetic, concatenation, and ordered comparisons likewise reject object coercion. Negative bracket indexes are ordinary property lookups; use `.at(-1)` for the last element.

Property reads only access own data properties. Unlike JavaScript, missing paths are null-tolerant: `missing.user.name` returns `undefined`. Optional chaining is not part of this subset. `Object` and `Array` are reserved built-in namespaces for the static calls below; runtime data never supplies their implementations.

| Receiver | Allowlisted Methods |
| --- | --- |
| Array | `filter`, `map`, `some`, `every`, `find`, `includes`, `join`, `slice`, `at` |
| String | `trim`, `toUpperCase`, `toLowerCase`, `includes`, `startsWith`, `endsWith`, `slice`, `at` |
| `Object` | `keys`, `values`, `entries`, `hasOwn` |
| `Array` | `isArray` |

Arrays and strings expose `.length`. Methods can be chained:

```mdc
{{ users.filter(user => user.active).map(user => user.name.toUpperCase()).join(', ') }}
{{ users.some(user => user.admin) ? 'Has admins' : 'No admins' }}
{{ Object.keys(settings).join(', ') }}
{{ user.name || 'Guest' }}
{{ count ?? 0 }}
```

Callback methods accept expression-only arrows with one to three named parameters: `item => item.active`, `(item, index) => index + ': ' + item.name`, or `(item, index, array) => index === array.length - 1`. Callbacks can capture loop locals and nest; their parameters do not leak into enclosing scopes. To return an object, parenthesize it: `items.map(item => ({name: item.name}))`. Callback blocks, destructuring, external functions, and mutation are not supported.

`||` supplies a fallback for any false-like value; `??` only replaces `null` or `undefined`, preserving zero, false and empty strings. Undefined/null interpolation produces empty text; booleans produce `true` and `false`. Format collections explicitly with methods such as `map(...).join(...)`; direct collection interpolation and nested collection coercion by `join` are rejected.

## Markdown Boundaries

Put block directives on their own lines around complete Markdown blocks. Inline directives are supported within a paragraph, list item, or table cell, provided the opener, branches, and closer share the same Markdown container. A control may contain nested Markdown elements, but may not open in one element and close in another.

Repeating a parsed list block repeats the list, not individual rows of a surrounding list or table. Component fences must balance independently inside branches. Template-looking text inside inline code and fenced or indented code blocks remains literal.

Heading IDs and plugin metadata are computed before template expansion. Repeated blocks can therefore repeat generated IDs; supply unique bound IDs where needed. Parse-time TOCs are not recalculated from runtime branch selections.

`{# comments #}` are removed. Inline `{{- ... -}}`, `{%- ... -%}`, and `{#- ... -#}` trim adjacent text whitespace. Block whitespace follows Markdown block normalization, not Jinja's raw string-output whitespace behavior. `renderMarkdown()` preserves executable control syntax with normalized formatting; comments are not retained.

During streaming, incomplete delimiters or control blocks retain the last valid parsed document (or an empty document initially). A closing `endif` or `endfor` is required before a new block becomes visible. Final, non-streaming parsing rejects malformed or unclosed controls.

## Safety And Limits

There is no `eval`, `Function`, or arbitrary function/method invocation. The plugin interprets its own expression tree and dispatches only the allowlisted methods above; it never calls methods supplied by runtime data. Data must contain plain objects, arrays, strings, finite numbers, booleans, null or undefined. Functions, accessors, class instances, prototype traversal, and cyclic data are rejected. Pass ordinary data snapshots, not objects with executable behavior or untrusted proxies.

Renderers escape interpolated text normally; ANSI also removes terminal control characters after evaluation. Bound URL attributes continue through Comark's existing URL validation.

The defaults are 100,000 evaluation steps (including copying data, callback evaluation, method traversal, and visiting output nodes), 10,000 inspected template-loop items, and 1,000,000 output text characters per render. Intermediate strings and arrays also use the `maxOutputLength` ceiling. Limits are shared by nested loops and callbacks; callback iterations consume evaluation steps, not the separate template-loop item allowance. For custom limits, resolve explicitly before rendering:

```typescript
import { resolveTemplates } from 'comark/plugins/template'

const resolved = resolveTemplates(document, data, {
  maxSteps: 50000,
  maxIterations: 1000,
  maxOutputLength: 100000,
})
```

The resolver returns a new document and leaves its input untouched. Documents without template metadata pass through unchanged.

Unsupported features include macros, includes, inheritance, assignments, arbitrary calls, mutating methods, template literals, optional chaining, comprehensions, recursive loop calls, `break`/`continue`, and the `raw` directive. Jinja expression syntax (`and`, `or`, `not`, `is defined`, pipe filters, `.items()`, `range()`, and `value if condition else fallback`) is not supported. Use JavaScript operators and the methods above instead. Unsupported syntax throws rather than executing arbitrary code.