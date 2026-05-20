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

  let Component = $derived(await promise)
</script>

<Component {...props}>
  {@render children?.()}
</Component>
