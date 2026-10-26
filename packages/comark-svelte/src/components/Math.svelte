<!--
@component
Renders a KaTeX math expression from a Comark AST `math` node.

Receives a `content` prop with the LaTeX source and a `class` prop that
determines inline vs display mode (display when class does NOT contain "inline").

@example
```svelte
<script>
  import math, { Math } from '@comark/svelte/plugins/math'
  import { Markdown } from '@comark/svelte'
</script>

<Markdown value="$E = mc^2$" plugins={[math()]} components={{ math: Math }} />
```
-->
<script lang="ts">
  import { loadKatex, typesetMath } from 'comark/plugins/math'

  let {
    content,
    class: className = '',
  }: {
    content: string
    class?: string
  } = $props()

  let isInline = $derived(className.split(' ').includes('inline'))

  // KaTeX loads on first use; parsing a document with math loads it, so a
  // server render after parsing typesets. Until then, and for unfinished or
  // invalid TeX, the source shows.
  let loaded = $state(false)
  let html = $derived.by(() => {
    void loaded
    return typesetMath(content, !isInline)
  })

  $effect(() => {
    if (html === undefined) loadKatex().then(() => (loaded = true), () => {})
  })
</script>

<!-- eslint-disable svelte/no-at-html-tags -- KaTeX output is safe rendered HTML -->
{#if isInline}
  <span class="math inline">{#if html}{@html html}{:else}{content}{/if}</span>
{:else}
  <div class="math block">{#if html}{@html html}{:else}{content}{/if}</div>
{/if}
