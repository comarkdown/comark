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
  import { untrack } from 'svelte'
  import {
    subscribeComarkDocument,
    type ComarkDocumentSubscription,
    type ComarkTree,
    type ComponentManifest,
  } from 'comark'
  import type { ComponentResolver } from '../types.js'
  import ComarkNode from './ComarkNode.svelte'

  let {
    tree,
    components = {},
    componentsManifest,
    resolver,
    streaming = false,
    caret: caretProp = false,
    data,
    class: className = '',
    comarkKey,
  }: {
    tree: ComarkTree | { nodes: ComarkTree['nodes'] }
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    resolver?: ComponentResolver
    streaming?: boolean
    caret?: boolean | { class: string }
    data?: Record<string, unknown>
    class?: string
    /**
     * Document key used to subscribe to live updates via `globalThis.comarkContext`.
     * Falls back to the tree's own `meta.key` when set by a plugin.
     * When a context exists but no key is provided, an auto id is allocated so the
     * instance still appears in Vite DevTools.
     */
    comarkKey?: string
  } = $props()

  // Live document support via ambient context (auto-id when DevTools is present).
  let liveTree = $state<ComarkTree | null>(null)
  let subscription: ComarkDocumentSubscription | null = null

  $effect(() => {
    // Track key identity so we resubscribe when comarkKey / meta.key change.
    const keyHint = (tree as ComarkTree).meta?.key || comarkKey
    void keyHint
    const seed = untrack(() => tree as ComarkTree)
    subscription = subscribeComarkDocument(seed, comarkKey, (next) => (liveTree = next))
    return () => {
      subscription?.cleanup(true)
      subscription = null
    }
  })

  // Keep the context document in sync when the parent re-parses.
  // Skip the first run — subscribe already seeded the document.
  let treeSynced = false
  $effect(() => {
    const current = tree
    if (!treeSynced) {
      treeSynced = true
      return
    }
    untrack(() => subscription?.set(current as ComarkTree))
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
    <ComarkNode
      {node}
      {components}
      {componentsManifest}
      {resolver}
      caretClass={i === activeTree.nodes.length - 1 ? caretClass : null}
      {renderData}
    />
  {/each}
</div>
