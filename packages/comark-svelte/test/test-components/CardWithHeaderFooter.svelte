<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title = '',
    children,
    header,
    footer,
  }: {
    title?: string
    children?: Snippet
    header?: Snippet
    footer?: Snippet
  } = $props()
</script>

<section class="card">
  <h3>{title}</h3>
  <header>{@render header?.()}</header>
  <main>{@render children?.()}</main>
  <footer>{@render footer?.()}</footer>
</section>
