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
  import type { ComarkTree, ComponentManifest } from 'comark'
  import type { ComponentResolver } from '../types.js'
  import type { RegisteredInstance } from 'comark/devtools'
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
    comarkKey?: string
  } = $props()

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

  // Devtools: register this instance if devtools is available
  let devtoolsHandle: RegisteredInstance | null = $state(null)
  const hot = (import.meta as Record<string, any>).hot

  if (hot) {
    $effect(() => {
      let cancelled = false

      import('comark/devtools').then(({ registerDevtoolsInstanceFromTree }) => {
        if (cancelled) return
        registerDevtoolsInstanceFromTree({
          hot,
          tree,
          // When devtools updates the markdown, use the provided tree
          onUpdate: (newMarkdown: string, newTree?: ComarkTree | null) => {
            if (newTree) {
              tree = newTree
            }
          },
        }).then((handle) => {
          if (cancelled) {
            handle?.unregister()
            return
          }
          devtoolsHandle = handle
        })
      })

      return () => {
        cancelled = true
        devtoolsHandle?.unregister()
      }
    })

    // Update devtools instance when tree changes
    $effect(() => {
      if (devtoolsHandle) {
        import('comark/render').then(({ renderMarkdown }) => {
          renderMarkdown(tree).then((md) => devtoolsHandle?.update({ tree, markdown: md }))
        })
      }
    })
  }
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
