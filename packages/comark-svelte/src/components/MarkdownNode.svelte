<!--
@component
Recursive Comark AST node renderer.

Renders a single `Node`: a text string, a native HTML element
(via `<svelte:element>`), or a custom component (via a capitalized variable).

Recurses into children by importing itself. `MarkdownDocument` applies stream
effects (see `comark/effects`) to the tree before rendering.

@example
```svelte
<MarkdownNode node={astNode} components={{ alert: Alert }} />
```
-->
<script module lang="ts">
  import type { ComponentManifest as ComarkComponentManifest } from 'comark'
  import { pascalCase } from 'comark/utils'

  const componentCache = new WeakMap<ComarkComponentManifest, Map<string, any>>()

  /**
   * `<svelte:element>` only knows an element's namespace from its `xmlns`, so each node passes its own down to its
   * children: `svg` and `math` start theirs, and `foreignObject` holds HTML again.
   */
  const NAMESPACE = Symbol('comark:namespace')
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
  const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML'

  function isPromiseLike(value: unknown): value is Promise<unknown> {
    return !!value && typeof (value as { then?: unknown }).then === 'function'
  }

  function unwrapComponent(mod: unknown): any {
    return mod && typeof mod === 'object' && 'default' in mod
      ? (mod as { default?: any }).default
      : mod
  }

  function resolveComponent(tag: string, components: Record<string, any>, componentsManifest?: ComarkComponentManifest): any {
    const pascal = pascalCase(tag)
    const Component
      = components[`Prose${pascal}`]
        || components[pascal]
        || components[tag]

    if (Component) {
      return Component
    }
    if (!componentsManifest) {
      return null;
    }

    let cache = componentCache.get(componentsManifest)
    if (!cache) {
      cache = new Map<string, any>()
      componentCache.set(componentsManifest, cache)
    }

    if (!cache.has(tag)) {
      const resolved = componentsManifest(tag)
      if (resolved) {
        cache.set(
          tag,
          isPromiseLike(resolved)
            ? Promise.resolve(resolved).then(unwrapComponent)
            : unwrapComponent(resolved),
        )
      }
    }

    return cache.get(tag) || null
  }
</script>

<script lang="ts">
  import type { ElementNode, Node as NodeType, ComponentManifest, NodeRenderData, NodeTransform } from 'comark'
  import type { ComponentResolver } from '../types.js'
  import MarkdownNode from './MarkdownNode.svelte'
  import ComarkComponent from './ComarkComponent.svelte'
  import Resolve from './Resolve.svelte'
  import { applyNodeTransforms, isHtmlVoidElement, resolveAttributes, toNativeAttributes } from 'comark/utils'
  import { getStreamKey } from 'comark/effects'
  import { getContext, setContext } from 'svelte'

  const EMPTY_RENDER_DATA: NodeRenderData = { frontmatter: {}, meta: {}, data: {}, props: {} }

  let {
    node,
    components = {},
    componentsManifest,
    transformNode,
    resolver: Resolver = Resolve,
    renderData = EMPTY_RENDER_DATA,
  }: {
    node: NodeType
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    transformNode?: NodeTransform | readonly NodeTransform[]
    resolver?: ComponentResolver
    renderData?: NodeRenderData
  } = $props()

  interface NamedSlot {
    name: string
    children: NodeType[]
  }

  function getSlotName(node: NodeType): string | null {
    if (typeof node === 'string' || !Array.isArray(node) || node[0] !== 'template') {
      return null
    }

    const props = (node.length >= 2 ? node[1] : {}) ?? {}
    if (typeof props.name === 'string' && props.name) {
      return props.name
    }

    for (const key in props) {
      if (key.startsWith('#') && key.length > 1) {
        return key.slice(1)
      }
    }

    return null
  }


  let { isText, tag, isVoid, children, Component, componentPromise, mappedProps, transformedProps } = $derived.by(() => {
    let isText = false
    let tag: string | null = null
    let isVoid = false
    let children: NodeType[] = []
    let Component: any = null
    let componentPromise: Promise<any> | null = null
    let mappedProps: Record<string, any> = {}
    let transformedProps = false

    if (typeof node === 'string') {
      return { isText: true, tag, isVoid, children, Component, componentPromise, mappedProps, transformedProps }
    }

    if (!Array.isArray(node) || node.length < 1) {
      return { isText, tag, isVoid, children, Component, componentPromise, mappedProps, transformedProps }
    }

    if (node[0] === null) {
      return { isText, tag, isVoid, children, Component, componentPromise, mappedProps, transformedProps }
    }

    const nodeProps: Record<string, any>
      = (node.length >= 2 ? node[1] : {}) ?? {}
    children = node.length > 2 ? (node.slice(2) as NodeType[]) : []

    const ownProps = resolveAttributes(nodeProps, renderData, { parseJson: true })
    const transformed = applyNodeTransforms(transformNode, node as ElementNode, ownProps, renderData)
    tag = transformed ? transformed.tag : (node[0] as string)
    const resolved = transformed ? transformed.props : ownProps
    transformedProps = resolved !== ownProps
    isVoid = isHtmlVoidElement(tag)

    const resolvedComponent = resolveComponent(tag, components, componentsManifest)
    if (resolvedComponent instanceof Promise) {
      componentPromise = resolvedComponent
    }
    else {
      Component = resolvedComponent
    }

    for (const k in resolved) {
      if (k === 'className') {
        mappedProps.class = resolved[k]
      }
      else {
        mappedProps[k] = resolved[k]
      }
    }

    return { isText, tag, isVoid, children, Component, componentPromise, mappedProps, transformedProps }
  })

  // Only shadow the parent's `props` scope when the current element has its
  // own attributes. Bare wrappers (`<p>`, `<ul>`, `<li>`, ...) must keep the
  // parent's scope so bindings like `{{ props.x }}` reach across them. The
  // check uses the raw attributes: resolving can omit all of them.
  let nativeProps = $derived(tag ? toNativeAttributes(tag, node, mappedProps) : mappedProps)

  const parentNamespace = getContext<(() => string | undefined) | undefined>(NAMESPACE)
  let namespace = $derived(
    tag === 'svg' ? SVG_NAMESPACE : tag === 'math' ? MATHML_NAMESPACE : parentNamespace?.(),
  )
  setContext(NAMESPACE, () => (tag === 'foreignObject' ? undefined : namespace))

  let hasOwnAttrs = $derived.by(() => {
    if (transformedProps) return true
    const attrs: Record<string, any> = (Array.isArray(node) && node.length >= 2 ? node[1] : null) ?? {}
    for (const key in attrs) {
      if (key !== '$') return true
    }
    return false
  })

  let childrenRenderData = $derived<NodeRenderData>(
    hasOwnAttrs
      ? { ...renderData, props: mappedProps }
      : renderData,
  )

  let { defaultChildren, namedSlots } = $derived.by(() => {
    const defaultChildren: NodeType[] = []
    const slots: NamedSlot[] = []

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const slotName = getSlotName(child)
      if (slotName) {
        const slotChildren = (child as unknown as NodeType[]).slice(2) as NodeType[]
        if (slotName === 'default') {
          defaultChildren.push(...slotChildren)
        }
        else {
          slots.push({ name: slotName, children: slotChildren })
        }
      }
      else {
        defaultChildren.push(child)
      }
    }

    return { defaultChildren, namedSlots: slots }
  })
</script>

<!--
  Index keys on purpose: keys that change kind at an index (text to element) make Svelte's async
  `each` reconcile throw mid-batch. `{#key}` re-mounts a node when a stream effect gives that index a
  new key, so a new fading span never reuses the element of a finished one.
-->
{#snippet renderChildren()}
  {#each defaultChildren as child, i (i)}
    {#key getStreamKey(child)}
      <MarkdownNode
        node={child}
        {components}
        {componentsManifest}
        {transformNode}
        resolver={Resolver}
        renderData={childrenRenderData}
      />
    {/key}
  {/each}
{/snippet}

{#if isText}
  {node}
{:else if Component && namedSlots.length > 0}
  <ComarkComponent
    {Component}
    props={mappedProps}
    {namedSlots}
    {components}
    {componentsManifest}
    {transformNode}
    resolver={Resolver}
    renderData={childrenRenderData}
  >
    {@render renderChildren()}
  </ComarkComponent>
{:else if Component}
  <Component {...mappedProps}>
    {@render renderChildren()}
  </Component>
{:else if componentPromise && namedSlots.length > 0}
  <ComarkComponent
    {componentPromise}
    props={mappedProps}
    {namedSlots}
    {components}
    {componentsManifest}
    {transformNode}
    resolver={Resolver}
    renderData={childrenRenderData}
  >
    {@render renderChildren()}
  </ComarkComponent>
{:else if componentPromise}
  <Resolver promise={componentPromise} props={mappedProps}>
    {@render renderChildren()}
  </Resolver>
{:else if isVoid}
  <svelte:element this={tag} xmlns={namespace} {...nativeProps} />
{:else if tag}
  <svelte:element this={tag} xmlns={namespace} {...nativeProps}>
    {@render renderChildren()}
  </svelte:element>
{/if}
