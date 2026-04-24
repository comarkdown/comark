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
  import { onDestroy } from 'svelte'
  import ComarkNode from './ComarkNode.svelte'

  let {
    tree,
    components = {},
    componentsManifest,
    streaming = false,
    caret: caretProp = false,
    data,
    class: className = '',
  }: {
    tree: ComarkTree
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    streaming?: boolean
    caret?: boolean | { class: string }
    data?: Record<string, unknown>
    class?: string
  } = $props()

  // Devtools instance registration
  let devtools: import('comark/devtools').RegisteredInstance | null = null
  let devtoolsCancelled = false

  if (import.meta.env?.DEV) {
    import('comark/devtools').then(({ registerDevtoolsInstanceFromTree }) =>
      registerDevtoolsInstanceFromTree({
        hot: import.meta.hot,
        tree,
      }).then((inst) => {
        if (devtoolsCancelled) {
          inst?.unregister()
        }
        else {
          devtools = inst
        }
      }),
    )

    $effect(() => {
      // Re-run when tree changes — track `tree` reactively
      const currentTree = tree
      if (devtools) {
        import('comark/render').then(({ renderMarkdown }) =>
          renderMarkdown(currentTree).then(md =>
            devtools?.update({ tree: currentTree, markdown: md }),
          ),
        )
      }
    })

    onDestroy(() => {
      devtoolsCancelled = true
      devtools?.unregister()
    })
  }

  let caretClass = $derived(
    streaming && caretProp
      ? (typeof caretProp === 'object' && caretProp.class) || ''
      : null,
  )

  let renderData = $derived({
    frontmatter: tree.frontmatter,
    meta: tree.meta,
    data: data || {},
    props: {},
  })
</script>

<div class="comark-content {className}">
  {#each tree.nodes as node, i (i)}
    <ComarkNode
      {node}
      {components}
      {componentsManifest}
      caretClass={i === tree.nodes.length - 1 ? caretClass : null}
      {renderData}
    />
  {/each}
</div>
