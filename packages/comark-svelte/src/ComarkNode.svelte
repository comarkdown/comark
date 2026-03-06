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
<script lang="ts">
  import type { ComarkNode as ComarkNodeType } from 'comark/ast'
  import type { ComponentManifest } from 'comark'
  import ComarkNode from './ComarkNode.svelte'
  import { pascalCase } from 'scule'

  let {
    node,
    components = {},
    componentsManifest,
    caretClass = null,
  }: {
    node: ComarkNodeType
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    caretClass?: string | null
  } = $props()

  const CARET_TEXT = '\u2009'
  const CARET_STYLE
    = 'background-color: currentColor; display: inline-block; margin-left: 0.25rem; margin-right: 0.25rem; animation: pulse 0.75s cubic-bezier(0.4,0,0.6,1) infinite;'

  function parsePropValue(value: string): any {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value === 'null') return null
    try {
      return JSON.parse(value)
    }
    catch {
      return value
    }
  }

  const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ])

  let { isText, tag, isVoid, children, Component, mappedProps } = $derived.by(() => {
    let isText = false
    let tag: string | null = null
    let isVoid = false
    let children: ComarkNodeType[] = []
    let Component: any = null
    let mappedProps: Record<string, any> = {}

    if (typeof node === 'string') {
      isText = true
      return { isText, tag, isVoid, children, Component, mappedProps }
    }

    if (!Array.isArray(node) || node.length < 1) {
      return { isText, tag, isVoid, children, Component, mappedProps }
    }

    // Comment nodes have null as the tag
    if (node[0] === null) {
      return { isText, tag, isVoid, children, Component, mappedProps }
    }

    tag = node[0] as string
    isVoid = VOID_ELEMENTS.has(tag)
    const nodeProps: Record<string, any>
      = (node.length >= 2 ? node[1] : {}) ?? {}
    children = node.length > 2 ? (node.slice(2) as ComarkNodeType[]) : []

    // Resolve custom component: check Prose{PascalTag}, PascalTag, then raw tag
    const pascal = pascalCase(tag)
    Component
      = components[`Prose${pascal}`]
        || components[pascal]
        || components[tag]
        || null

    // Map props: className → class, :prefix → parsed value, rest pass through
    for (const k in nodeProps) {
      if (k === 'className') {
        mappedProps.class = nodeProps[k]
      }
      else if (k.charCodeAt(0) === 58 /* ':' */) {
        mappedProps[k.substring(1)] = parsePropValue(nodeProps[k])
      }
      else {
        mappedProps[k] = nodeProps[k]
      }
    }

    return { isText, tag, isVoid, children, Component, mappedProps }
  })
</script>

{#if isText}
  {node}{#if caretClass !== null}<span
      class={caretClass || undefined}
      style={CARET_STYLE}>{CARET_TEXT}</span
    >{/if}
{:else if Component}
  <Component {...mappedProps}>
    {#each children as child, i (i)}
      <ComarkNode
        node={child}
        {components}
        {componentsManifest}
        caretClass={i === children.length - 1 ? caretClass : null}
      />
    {/each}
  </Component>
{:else if isVoid}
  <svelte:element this={tag} {...mappedProps} />
{:else if tag}
  <svelte:element this={tag} {...mappedProps}>
    {#each children as child, i (i)}
      <ComarkNode
        node={child}
        {components}
        {componentsManifest}
        caretClass={i === children.length - 1 ? caretClass : null}
      />
    {/each}
  </svelte:element>
{/if}
