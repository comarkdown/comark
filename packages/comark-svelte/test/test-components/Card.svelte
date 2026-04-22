<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title = '',
    variant = '',
    children,
  }: {
    title?: string
    variant?: string
    children?: Snippet
  } = $props()
</script>

<div class="card card-{variant}">
  <h3>{title}</h3>
  <div class="body">
    {@render children?.()}
  </div>
</div>
