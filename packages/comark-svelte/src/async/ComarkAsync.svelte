<!--
@component
High-level Comark component using experimental Svelte 5 async support.

Uses `$derived` with `await` to parse markdown reactively. Requires the
consumer to enable `experimental: { async: true }` in their Svelte config
and wrap this component in a `<svelte:boundary>` for pending/error states.

@example
```svelte
<script>
  import { ComarkAsync } from '@comark/svelte/async'
  import Alert from './Alert.svelte'

  let content = $state('# Hello World')
</script>

<svelte:boundary>
  <ComarkAsync markdown={content} components={{ alert: Alert }} />
  {#snippet pending()}
    <p>Loading...</p>
  {/snippet}
  {#snippet failed(error, reset)}
    <p>Error: {error.message}</p>
    <button onclick={reset}>Retry</button>
  {/snippet}
</svelte:boundary>
```
-->
<script lang="ts">
  import type { ComarkPlugin, ComponentManifest } from 'comark'
  import { parse } from 'comark'
  import ComarkRenderer from '../ComarkRenderer.svelte'

  let {
    markdown = '',
    options = {},
    plugins = [],
    components = {},
    componentsManifest,
    streaming = false,
    caret = false,
    data,
    class: className = '',
  }: {
    markdown?: string
    options?: Record<string, any>
    plugins?: ComarkPlugin[]
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    streaming?: boolean
    caret?: boolean | { class: string }
    data?: Record<string, unknown>
    class?: string
  } = $props()

  let content = $derived((markdown || '').trim())
  let parsed = $derived(
    // `parse` directly mutates `plugins` which creates an infinite effect loop
    // so we copy it before passing it in so it gets a regular JS array and we get to still
    // track dependencies from an external perspective
    await parse(content, { ...options, plugins: [...plugins] }),
  )
</script>

<ComarkRenderer
  tree={parsed}
  {components}
  {componentsManifest}
  {streaming}
  {caret}
  {data}
  class={className}
/>
