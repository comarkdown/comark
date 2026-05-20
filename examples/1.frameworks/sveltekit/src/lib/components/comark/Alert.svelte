<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    type = 'info',
    children,
  }: {
    type?: 'info' | 'success' | 'warning'
    children?: Snippet
  } = $props()
</script>

<div class="alert alert-{type}" role="alert">
  {@render children?.()}
</div>
