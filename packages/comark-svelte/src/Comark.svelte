<!--
@component
High-level Comark component that accepts a markdown string, parses it, and renders it.

Uses `$state` and `$effect` for async parsing — no experimental features required.
Renders nothing until the first parse completes.

@example
```svelte
<script>
  import { Comark } from '@comark/svelte'
  import Alert from './Alert.svelte'

  let content = `
# Hello World

::alert{type="info"}
This is an alert component
::
`
</script>

<Comark markdown={content} components={{ alert: Alert }} />
```
-->
<script lang="ts">
  import type { ComarkTree } from 'comark/ast'
  import type { ComarkPlugin, ComponentManifest } from 'comark'
  import { parse } from 'comark'
  import ComarkRenderer from './ComarkRenderer.svelte'

  let {
    markdown = '',
    options = {},
    plugins = [],
    components = {},
    componentsManifest,
    streaming = false,
    caret = false,
    class: className = '',
  }: {
    markdown?: string
    options?: Record<string, any>
    plugins?: ComarkPlugin[]
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    streaming?: boolean
    caret?: boolean | { class: string }
    class?: string
  } = $props()

  let parsed: ComarkTree | null = $state(null)

  let content = $derived((markdown || '').trim())

  $effect(() => {
    parse(content, { ...options, plugins }).then((result) => {
      parsed = result
    })
  })
</script>

{#if parsed}
  <ComarkRenderer tree={parsed} {components} {componentsManifest} {streaming} {caret} class={className} />
{/if}
