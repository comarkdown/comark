<!--
@component
Renders a KaTeX math expression from a Comark AST `math` node.

Receives a `content` prop with the LaTeX source and a `class` prop that
determines inline vs display mode (display when class does NOT contain "inline").

@example
```svelte
<script>
  import { math, Math } from '@comark/svelte/plugin-math'
  import { Comark } from '@comark/svelte'
</script>

<Comark markdown="$E = mc^2$" plugins={[math()]} components={{ math: Math }} />
```
-->
<script lang="ts">
  import katex from 'katex'
  import 'katex/dist/katex.min.css'

  let {
    content,
    class: className = '',
  }: {
    content: string
    class?: string
  } = $props()

  let isInline = $derived(className.split(' ').includes('inline'))

  let mathml = $derived.by(() => {
    try {
      return katex.renderToString(content, {
        throwOnError: true,
        displayMode: !isInline,
      })
    }
    catch {
      return '...'
    }
  })
</script>

<!-- eslint-disable svelte/no-at-html-tags -- KaTeX output is safe rendered HTML -->
{#if isInline}
  <span class="math inline">{@html mathml}</span>
{:else}
  <div class="math block">{@html mathml}</div>
{/if}
