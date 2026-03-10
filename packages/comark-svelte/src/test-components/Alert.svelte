<script lang="ts">
  import type { Snippet } from 'svelte'

  let { type = 'info', children }: { type?: string, children?: Snippet }
    = $props()
</script>

<div class="alert alert-{type}" role="alert">
  {@render children?.()}
</div>
