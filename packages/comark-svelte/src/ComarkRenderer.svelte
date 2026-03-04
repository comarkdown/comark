<!--
@component
Renders a Comark AST tree to Svelte components/HTML.

Accepts a parsed `ComarkTree` and renders each top-level node via `ComarkNode`.
Supports custom component mappings and a streaming caret indicator.

@example
```svelte
<script>
  import { ComarkRenderer } from '@comark/svelte'
  import { parse } from 'comark'

  const tree = await parse('# Hello **World**')
</script>

<ComarkRenderer {tree} />
```
-->
<script lang="ts">
  import type { ComarkTree } from 'comark/ast'
  import type { ComponentManifest } from 'comark'
  import ComarkNode from './ComarkNode.svelte'

  let {
    tree,
    components = {},
    componentsManifest,
    streaming = false,
    caret: caretProp = false,
    class: className = '',
  }: {
    tree: ComarkTree
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    streaming?: boolean
    caret?: boolean | { class: string }
    class?: string
  } = $props()

  let caretClass = $derived(
    streaming && caretProp
      ? (typeof caretProp === 'object' && caretProp.class) || ''
      : null,
  )
</script>

<div class="comark-content {className}">
  {#each tree.nodes as node, i (i)}
    <ComarkNode
      {node}
      {components}
      {componentsManifest}
      caretClass={i === tree.nodes.length - 1 ? caretClass : null}
    />
  {/each}
</div>
