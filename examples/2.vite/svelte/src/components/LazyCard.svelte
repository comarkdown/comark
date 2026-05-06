<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title = 'Lazy component',
    accent = 'violet',
    children,
  }: {
    title?: string
    accent?: 'violet' | 'cyan' | 'emerald'
    children?: Snippet
  } = $props()

  const accents = {
    violet: 'border-violet-400 bg-violet-50 text-violet-950 dark:border-violet-500/60 dark:bg-violet-950/40 dark:text-violet-100',
    cyan: 'border-cyan-400 bg-cyan-50 text-cyan-950 dark:border-cyan-500/60 dark:bg-cyan-950/40 dark:text-cyan-100',
    emerald: 'border-emerald-400 bg-emerald-50 text-emerald-950 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-100',
  }
</script>

<section class="my-4 rounded-xl border p-4 shadow-sm {accents[accent]}">
  <p class="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
    Loaded from componentsManifest
  </p>
  <h3 class="mb-2 text-lg font-semibold">{title}</h3>
  <div class="text-sm leading-relaxed">
    {@render children?.()}
  </div>
</section>
