<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    promise,
    props = {},
    children,
  }: {
    promise: Promise<any>
    props?: Record<string, any>
    children?: Snippet
  } = $props()
</script>

{#await promise then Component}
  <Component {...props}>
    {@render children?.()}
  </Component>
{/await}
