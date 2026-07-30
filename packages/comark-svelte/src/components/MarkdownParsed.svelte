<!--
@component
Renders an already-parsed Comark AST tree to Svelte components/HTML — no
parser in the client bundle.

Accepts a parsed `ComarkTree` and renders each top-level node via `MarkdownNode`.
Supports custom component mappings and a streaming caret indicator.

@example
```svelte
<script>
  import { MarkdownParsed } from '@comark/svelte'
  import { parse } from 'comark'

  const document = await parse('# Hello **World**')
</script>

<MarkdownParsed value={document} />
```
-->
<script lang="ts">
  import { untrack } from 'svelte'
  import type { ComarkTree, ComponentManifest } from 'comark'
  import type { ComponentResolver } from '../types.js'
  import MarkdownNode from './MarkdownNode.svelte'
  import { warnDeprecated } from '../internal/deprecation.js'

  let {
    value,
    tree: treeProp,
    components = {},
    componentsManifest,
    resolver,
    streaming = false,
    caret: caretProp = false,
    data,
    class: className = '',
    comarkKey,
  }: {
    value?: ComarkTree | { nodes: ComarkTree['nodes'] }
    /** @deprecated Use `value` instead */
    tree?: ComarkTree | { nodes: ComarkTree['nodes'] }
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    resolver?: ComponentResolver
    streaming?: boolean
    caret?: boolean | { class: string }
    data?: Record<string, unknown>
    class?: string
    comarkKey?: string
  } = $props()

  // svelte-ignore state_referenced_locally — deprecation check only needs the initial value
  if (treeProp !== undefined && value === undefined) {
    warnDeprecated('tree (prop)', 'value')
  }

  let tree = $derived(value ?? treeProp ?? { nodes: [] })

  // Live document support: if an ambient context exists, subscribe to updates
  // for this key and re-render with the pushed tree. Cleaned up on unmount.
  // The key is the tree's own `meta.key` (set by a plugin) or the `comarkKey` prop.
  let liveTree = $state<ComarkTree | null>(null)
  let key = $derived((tree as ComarkTree).meta?.key || comarkKey)
  $effect(() => {
    if (!key || !globalThis.comarkContext) return
    const seed = untrack(() => tree as ComarkTree)
    const cleanup = globalThis.comarkContext.get(key, seed).listen((next) => (liveTree = next))
    return () => cleanup(true)
  })

  let activeTree = $derived(liveTree ?? tree)

  let caretClass = $derived(
    streaming && caretProp
      ? (typeof caretProp === 'object' && caretProp.class) || ''
      : null,
  )

  let renderData = $derived({
    frontmatter:
      (activeTree as ComarkTree).frontmatter || (activeTree as unknown as { data: Record<string, unknown> }).data || {},
    meta: (activeTree as ComarkTree).meta || {},
    data: data || {},
    props: {},
  })
</script>

<div class="comark-content {className}">
  {#each activeTree.nodes as node, i (i)}
    <MarkdownNode
      {node}
      {components}
      {componentsManifest}
      {resolver}
      caretClass={i === activeTree.nodes.length - 1 ? caretClass : null}
      {renderData}
    />
  {/each}
</div>
