<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveIfWrapper, shouldRenderIf, type IfProps } from 'comark/plugins/binding'

  let {
    children,
    else: elseContent,
    ...props
  }: IfProps & {
    children?: Snippet
    else?: Snippet
  } = $props()

  let visible = $derived(shouldRenderIf(props))
  let branch = $derived(visible ? children : elseContent)
  let wrapper = $derived(visible || elseContent ? resolveIfWrapper(props.as) : undefined)
</script>

{#if visible || elseContent}
  {#if wrapper}
    <svelte:element this={wrapper}>
      {@render branch?.()}
    </svelte:element>
  {:else}
    {@render branch?.()}
  {/if}
{/if}
