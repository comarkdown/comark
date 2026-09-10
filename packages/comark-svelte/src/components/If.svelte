<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveIfWrapper, shouldRenderIf, type IfProps } from 'comark/plugins/binding'

  let {
    children,
    ...props
  }: IfProps & {
    children?: Snippet
  } = $props()

  let visible = $derived(shouldRenderIf(props))
  let wrapper = $derived(visible ? resolveIfWrapper(props.as) : undefined)
</script>

{#if visible}
  {#if wrapper}
    <svelte:element this={wrapper}>
      {@render children?.()}
    </svelte:element>
  {:else}
    {@render children?.()}
  {/if}
{/if}
