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
  }: {
    tree: ComarkTree | { nodes: ComarkTree['nodes'] }
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    resolver?: ComponentResolver
    streaming?: boolean
    caret?: boolean | { class: string }
    data?: Record<string, unknown>
    class?: string
  } = $props()

  let caretClass = $derived(
    streaming && caretProp
      ? (typeof caretProp === 'object' && caretProp.class) || ''
      : null,
  )

  let renderData = $derived({
    frontmatter: (tree as ComarkTree).frontmatter || (tree as unknown as { data: Record<string, unknown> }).data || {},
    meta: (tree as ComarkTree).meta || {},
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
  {#each tree.nodes as node, i (i)}
    <ComarkNode
      {node}
      {components}
      {componentsManifest}
      {resolver}
      caretClass={i === tree.nodes.length - 1 ? caretClass : null}
      {renderData}
    />
  {/each}
</div>
