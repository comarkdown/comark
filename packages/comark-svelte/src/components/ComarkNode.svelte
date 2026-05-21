<!--
@component
Recursive Comark AST node renderer.

Renders a single `ComarkNode` — either a text string, a native HTML element
(via `<svelte:element>`), or a custom component (via a capitalized variable).

Recurses into children by importing itself. The streaming caret is threaded
through props and only forwarded to the last child at each level, so it
naturally appears inline after the deepest trailing text node.

@example
```svelte
<ComarkNode node={astNode} components={{ alert: Alert }} />
```
-->
<script module lang="ts">
  import type { ComponentManifest as ComarkComponentManifest } from 'comark'
  import { pascalCase } from 'comark/utils'

  const componentCache = new WeakMap<ComarkComponentManifest, Map<string, any>>()

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
  import type { ComarkNode as ComarkNodeType, ComponentManifest, NodeRenderData } from 'comark'
  import type { Snippet } from 'svelte'
  import type { ComponentResolver } from '../types.js'
  import ComarkNode from './ComarkNode.svelte'
  import Resolve from './Resolve.svelte'
  import { resolveAttributes } from 'comark/utils'

  const EMPTY_RENDER_DATA: NodeRenderData = { frontmatter: {}, meta: {}, data: {}, props: {} }

  let {
    node,
    components = {},
    componentsManifest,
    resolver: Resolver = Resolve,
    caretClass = null,
    renderData = EMPTY_RENDER_DATA,
  }: {
    node: ComarkNodeType
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    resolver?: ComponentResolver
    caretClass?: string | null
    renderData?: NodeRenderData
  } = $props()

  const CARET_TEXT = '\u2009'
  const CARET_STYLE
    = 'background-color: currentColor; display: inline-block; margin-left: 0.25rem; margin-right: 0.25rem; animation: pulse 0.75s cubic-bezier(0.4,0,0.6,1) infinite;'

  const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ])

  interface RenderChild {
    node: ComarkNodeType
    caretClass: string | null
  }

  function getSlotName(node: ComarkNodeType): string | null {
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

  function createChildrenSnippet(
    snippetChildren: ComarkNodeType[],
    snippetRenderData: NodeRenderData,
    snippetCaretClass: string | null,
  ): Snippet {
    return ((anchor: unknown) => {
      const renderNode = ComarkNode as unknown as (anchor: unknown, props: Record<string, unknown>) => void
      for (let i = 0; i < snippetChildren.length; i++) {
        renderNode(anchor, {
          node: snippetChildren[i],
          components,
          componentsManifest,
          resolver: Resolver,
          caretClass: i === snippetChildren.length - 1 ? snippetCaretClass : null,
          renderData: snippetRenderData,
        })
      }
    }) as unknown as Snippet
  }

  function toRenderChildren(
    sourceChildren: ComarkNodeType[],
    sourceIndex: number,
    totalChildren: number,
    nodeCaretClass: string | null,
  ): RenderChild[] {
    return sourceChildren.map((child, index) => ({
      node: child,
      caretClass: sourceIndex === totalChildren - 1 && index === sourceChildren.length - 1 ? nodeCaretClass : null,
    }))
  }

  let { isText, tag, isVoid, children, Component, componentPromise, mappedProps } = $derived.by(() => {
    let isText = false
    let tag: string | null = null
    let isVoid = false
    let children: ComarkNodeType[] = []
    let Component: any = null
    let componentPromise: Promise<any> | null = null
    let mappedProps: Record<string, any> = {}

    if (typeof node === 'string') {
      return { isText: true, tag, isVoid, children, Component, componentPromise, mappedProps }
    }

    if (!Array.isArray(node) || node.length < 1) {
      return { isText, tag, isVoid, children, Component, componentPromise, mappedProps }
    }

    // Comment nodes have null as the tag
    if (node[0] === null) {
      return { isText, tag, isVoid, children, Component, componentPromise, mappedProps }
    }

    tag = node[0] as string
    isVoid = VOID_ELEMENTS.has(tag)
    const nodeProps: Record<string, any>
      = (node.length >= 2 ? node[1] : {}) ?? {}
    children = node.length > 2 ? (node.slice(2) as ComarkNodeType[]) : []

    const resolvedComponent = resolveComponent(tag, components, componentsManifest)
    if (resolvedComponent instanceof Promise) {
      componentPromise = resolvedComponent
    }
    else {
      Component = resolvedComponent
    }

    // Resolve `:prefix` bindings, then apply Svelte attribute remapping
    // (`className` → `class`).
    const resolved = resolveAttributes(nodeProps, renderData, { parseJson: true })
    for (const k in resolved) {
      if (k === 'className') {
        mappedProps.class = resolved[k]
      }
      else {
        mappedProps[k] = resolved[k]
      }
    }

    return { isText, tag, isVoid, children, Component, componentPromise, mappedProps }
  })

  // Only shadow the parent's `props` scope when the current element has its
  // own attributes. Bare wrappers (`<p>`, `<ul>`, `<li>`, …) must keep the
  // parent's scope so bindings like `{{ props.x }}` reach across them.
  let childrenRenderData = $derived<NodeRenderData>(
    Object.keys(mappedProps).length > 0
      ? { ...renderData, props: mappedProps }
      : renderData,
  )

  let { defaultChildren, namedSlotProps } = $derived.by(() => {
    const defaultChildren: RenderChild[] = []
    const slotProps: Record<string, Snippet> = {}

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const slotName = getSlotName(child)
      if (slotName) {
        const slotChildren = (child as unknown as ComarkNodeType[]).slice(2) as ComarkNodeType[]
        if (slotName === 'default') {
          defaultChildren.push(...toRenderChildren(slotChildren, i, children.length, caretClass))
        }
        else {
          slotProps[slotName] = createChildrenSnippet(
            slotChildren,
            childrenRenderData,
            i === children.length - 1 ? caretClass : null,
          )
        }
      }
      else {
        defaultChildren.push({ node: child, caretClass: i === children.length - 1 ? caretClass : null })
      }
    }

    return { defaultChildren, namedSlotProps: slotProps }
  })

  let componentProps = $derived(
    Object.keys(namedSlotProps).length > 0
      ? { ...mappedProps, ...namedSlotProps }
      : mappedProps,
  )
</script>

{#snippet renderChildren()}
  {#each defaultChildren as child, i (i)}
    <ComarkNode
      node={child.node}
      {components}
      {componentsManifest}
      resolver={Resolver}
      caretClass={child.caretClass}
      renderData={childrenRenderData}
    />
  {/each}
{/snippet}

{#if isText}
  {node}{#if caretClass !== null}<span
      class={caretClass || undefined}
      style={CARET_STYLE}>{CARET_TEXT}</span
    >{/if}
{:else if Component}
  <Component {...componentProps}>
    {@render renderChildren()}
  </Component>
{:else if componentPromise}
  <Resolver promise={componentPromise} props={componentProps}>
    {@render renderChildren()}
  </Resolver>
{:else if isVoid}
  <svelte:element this={tag} {...mappedProps} />
{:else if tag}
  <svelte:element this={tag} {...mappedProps}>
    {@render renderChildren()}
  </svelte:element>
{/if}
