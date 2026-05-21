<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title = '',
    children,
    footer,
  }: {
    title?: string
    children?: Snippet
    footer?: Snippet
  } = $props()
</script>

<div class="card">
  <h3>{title}</h3>
  {@render children?.()}
  <footer>{@render footer?.()}</footer>
</div>
