<!--
@component
Renders an already-parsed Markdown document to Svelte components/HTML — no
parser in the client bundle.

Accepts a parsed `MarkdownDocument` and renders each top-level node via `MarkdownNode`.
Supports custom component mappings and a streaming caret indicator.

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
  import type { MarkdownDocument as MarkdownDocumentType, ComponentManifest } from 'comark'
  import type { ComarkModel } from 'comark/model'
  import { createModelStore } from 'comark/model'
  import type { ComponentResolver } from '../types.js'
  import MarkdownNode from './MarkdownNode.svelte'

  let {
    value,
    components = {},
    componentsManifest,
    resolver,
    streaming = false,
    caret: caretProp = false,
    data,
    model: modelProp,
    onModelChange,
    class: className = '',
    documentKey,
  }: {
    value?: MarkdownDocumentType | { nodes: MarkdownDocumentType['nodes'] }
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    resolver?: ComponentResolver
    streaming?: boolean
    caret?: boolean | { class: string }
    data?: Record<string, unknown>
    model?: ComarkModel
    onModelChange?: (path: string, value: unknown, snapshot: Record<string, unknown>) => void
    class?: string
    documentKey?: string
  } = $props()

  let document = $derived(value ?? { nodes: [] })

  // Live document support: if an ambient context exists, subscribe to updates
  // for this key and re-render with the pushed document. Cleaned up on unmount.
  // The key is the document's own `meta.key` (set by a plugin) or the `documentKey` prop.
  let liveDocument = $state<MarkdownDocumentType | null>(null)
  let key = $derived((document as MarkdownDocumentType).meta?.key || documentKey)
  $effect(() => {
    if (!key || !globalThis.comarkContext) return
    const seed = untrack(() => document as MarkdownDocumentType)
    const cleanup = globalThis.comarkContext.get(key, seed).listen((next) => (liveDocument = next))
    return () => cleanup(true)
  })

  let activeDocument = $derived(liveDocument ?? document)

  let caretClass = $derived(
    streaming && caretProp
      ? (typeof caretProp === 'object' && caretProp.class) || ''
      : null,
  )

  // Model boundary: create an uncontrolled store if no model is provided.
  // A $state cell is bumped on every write to trigger Svelte reactivity.
  const fallbackStore = createModelStore({
    data: { data: { ...(untrack(() => data) ?? {}) } },
    onChange: (path, value, snapshot) => onModelChange?.(path, value, snapshot),
  })
  let internalModel = $derived(modelProp ?? fallbackStore)
  let modelVersion = $state(0)
  $effect(() => {
    return internalModel.subscribe('data', () => { modelVersion++ })
  })

  let renderData = $derived.by(() => {
    void modelVersion
    return {
      frontmatter:
        (activeDocument as MarkdownDocumentType).frontmatter ||
        (activeDocument as unknown as { data: Record<string, unknown> }).data ||
        {},
      meta: (activeDocument as MarkdownDocumentType).meta || {},
      data: data || {},
      props: {},
      model: internalModel,
    }
  })
</script>

<div class="comark-content {className}">
  {#each activeDocument.nodes as node, i (i)}
    <MarkdownNode
      {node}
      {components}
      {componentsManifest}
      {resolver}
      caretClass={i === activeDocument.nodes.length - 1 ? caretClass : null}
      {renderData}
      model={internalModel}
    />
  {/each}
</div>
