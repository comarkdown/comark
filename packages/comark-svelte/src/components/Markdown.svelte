<!--
@component
High-level Markdown component that accepts a markdown string, parses it, and renders it.

Uses `$state` and `$effect` for async parsing — no experimental features required.
Renders nothing until the first parse completes.

@example
```svelte
<script>
  import { Markdown } from '@comark/svelte'
  import Alert from './Alert.svelte'

  let content = `
# Hello World

::alert{type="info"}
This is an alert component
::
`
</script>

<Markdown value={content} components={{ alert: Alert }} />
```
-->
<script lang="ts">
  import type { MarkdownTree, ComarkPlugin, ComponentManifest } from 'comark'
    import { parse } from 'comark'
  import MarkdownParsed from './MarkdownParsed.svelte'
  import { warnDeprecated } from '../internal/deprecation.js'

  let {
    value,
    markdown,
    options = {},
    plugins = [],
    unwrap = false,
    components = {},
    componentsManifest,
    streaming = false,
    caret = false,
    data,
    class: className = '',
  }: {
    value?: string
    /** @deprecated Use `value` instead */
    markdown?: string
    options?: Record<string, any>
    plugins?: ComarkPlugin[]
    unwrap?: boolean | string | string[]
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    streaming?: boolean
    caret?: boolean | { class: string }
    data?: Record<string, unknown>
    class?: string
  } = $props()

  // svelte-ignore state_referenced_locally — deprecation check only needs the initial value
  if (markdown !== undefined && value === undefined) {
    warnDeprecated('markdown (prop)', 'value')
  }

  let parsed: MarkdownTree | null = $state(null)

  let content = $derived((value ?? markdown ?? '').trim())

  let requestVersion = 0
  let appliedVersion = 0
  $effect(() => {
    const currentVersion = ++requestVersion
    // `parse` directly mutates `plugins` which creates an infinite effect loop
    // so we copy it before passing it in so it gets a regular JS array and we get to still
    // track dependencies from an external perspective
    parse(content, { ...options, ...(unwrap ? { unwrap } : {}), plugins: [...plugins] }).then((result) => {
      if (currentVersion > appliedVersion) {
        appliedVersion = currentVersion
        parsed = result
      }
    })
  })
</script>

{#if parsed}
  <MarkdownParsed
    value={parsed}
    {components}
    {componentsManifest}
    {streaming}
    {caret}
    {data}
    class={className}
  />
{/if}
