<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title = 'Lazy card',
    accent = 'cyan',
    children,
    footer,
  }: {
    title?: string
    accent?: 'cyan' | 'emerald'
    children?: Snippet
    footer?: Snippet
  } = $props()
</script>

<section class="lazy-card" data-accent={accent} data-lazy-card>
  <p class="lazy-card__label">Resolved from componentsManifest</p>
  <h3>{title}</h3>
  <div>
    {@render children?.()}
  </div>
  {#if footer}
    <footer class="lazy-card__footer">
      {@render footer()}
    </footer>
  {/if}
</section>
