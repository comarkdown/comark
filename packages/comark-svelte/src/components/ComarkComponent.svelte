<script lang="ts">
  import type { ComarkNode as ComarkNodeType, ComponentManifest, NodeRenderData } from 'comark'
  import type { Snippet } from 'svelte'
  import type { ComponentResolver } from '../types.js'
  import ComarkNode from './ComarkNode.svelte'
  import Resolve from './Resolve.svelte'
  import ComarkComponent from './ComarkComponent.svelte'

  interface NamedSlot {
    name: string
    children: ComarkNodeType[]
    caretClass: string | null
  }

  const EMPTY_RENDER_DATA: NodeRenderData = { frontmatter: {}, meta: {}, data: {}, props: {} }

  let {
    Component = null,
    componentPromise = null,
    props = {},
    namedSlots = [],
    slotIndex = 0,
    components = {},
    componentsManifest,
    resolver: Resolver = Resolve,
    renderData = EMPTY_RENDER_DATA,
    children,
  }: {
    Component?: any
    componentPromise?: Promise<any> | null
    props?: Record<string, any>
    namedSlots?: NamedSlot[]
    slotIndex?: number
    components?: Record<string, any>
    componentsManifest?: ComponentManifest
    resolver?: ComponentResolver
    renderData?: NodeRenderData
    children?: Snippet
  } = $props()
</script>

{#if slotIndex < namedSlots.length}
  {@const slot = namedSlots[slotIndex]}
  {#snippet namedSlot()}
    {#each slot.children as child, i (i)}
      <ComarkNode
        node={child}
        {components}
        {componentsManifest}
        resolver={Resolver}
        caretClass={i === slot.children.length - 1 ? slot.caretClass : null}
        {renderData}
      />
    {/each}
  {/snippet}

  <ComarkComponent
    {Component}
    {componentPromise}
    props={{ ...props, [slot.name]: namedSlot }}
    {namedSlots}
    slotIndex={slotIndex + 1}
    {components}
    {componentsManifest}
    resolver={Resolver}
    {renderData}
  >
    {@render children?.()}
  </ComarkComponent>
{:else if Component}
  <Component {...props}>
    {@render children?.()}
  </Component>
{:else if componentPromise}
  <Resolver promise={componentPromise} {props}>
    {@render children?.()}
  </Resolver>
{/if}
