<!--
@component
Renders an already-parsed Markdown document to Svelte components/HTML, keeping
the parser out of the client bundle.

Accepts a parsed `MarkdownDocument` and renders each top-level node via `MarkdownNode`.
Supports custom component mappings and streaming effects (caret, fade-in, custom).

@example
```svelte
<script>
  import { MarkdownDocument } from '@comark/svelte'
  import { parseMarkdown } from 'comark'

  const document = await parseMarkdown('# Hello **World**')
</script>

<MarkdownDocument value={document} />
```
-->
<script lang="ts">
  import { untrack } from 'svelte'
  import type { MarkdownDocument as MarkdownDocumentType, ComponentManifest, NodeTransform } from 'comark'
  import { createStreamRenderer, getStreamKey, resolveStreamEffects } from 'comark/stream'
  import type { CaretOptions, FadeOptions, StreamEffect } from 'comark/stream'
  import type { ComponentResolver, RootAttributes } from '../types.js'
  import MarkdownNode from './MarkdownNode.svelte'

  let {
    value,
    components = {},
    componentsManifest,
    transformNode,
    resolver,
    streaming = false,
    caret = false,
    fade = false,
    effects,
    data,
    class: className = '',
    documentKey,
    ...rest
  }: RootAttributes & {
    value?: MarkdownDocumentType | { nodes: MarkdownDocumentType['nodes'] }
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    transformNode?: NodeTransform | readonly NodeTransform[]
    resolver?: ComponentResolver
    streaming?: boolean
    caret?: boolean | CaretOptions
    fade?: boolean | FadeOptions
    effects?: readonly StreamEffect[]
    data?: Record<string, unknown>
    class?: string
    documentKey?: string
  } = $props()

  let document = $derived(value ?? { nodes: [] })

  // Prefer a plugin-assigned `meta.key` over the `documentKey` prop.
  let liveDocument = $state<MarkdownDocumentType | null>(null)
  let key = $derived((document as MarkdownDocumentType).meta?.key || documentKey)
  $effect(() => {
    if (!key || !globalThis.comarkContext) return
    const seed = untrack(() => document as MarkdownDocumentType)
    const cleanup = globalThis.comarkContext.get(key, seed).listen((next) => (liveDocument = next))
    return () => cleanup(true)
  })

  let activeDocument = $derived(liveDocument ?? document)

  const stream = createStreamRenderer()

  // Paced effects release text on a clock, so keep re-rendering until their backlog is empty.
  let frame = $state(0)
  let nodes = $derived.by(() => {
    void frame
    return stream.render(activeDocument.nodes || [], {
      streaming,
      effects: resolveStreamEffects({ caret, fade, effects }),
    })
  })
  $effect(() => {
    // Read `nodes` before the early return: Svelte only re-runs an effect for signals it actually read.
    nodes
    if (!stream.pending()) return
    const id = requestAnimationFrame(() => frame++)
    return () => cancelAnimationFrame(id)
  })

  let renderData = $derived({
    frontmatter:
      (activeDocument as MarkdownDocumentType).frontmatter ||
      (activeDocument as unknown as { data: Record<string, unknown> }).data ||
      {},
    meta: (activeDocument as MarkdownDocumentType).meta || {},
    data: data || {},
    props: {},
  })
</script>

<div {...rest} class="comark-content {className}">
  {#each nodes as node, i (i)}
    {#key getStreamKey(node)}
      <MarkdownNode
        {node}
        {components}
        {componentsManifest}
        {transformNode}
        {resolver}
        {renderData}
      />
    {/key}
  {/each}
</div>
