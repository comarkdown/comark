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
<script module lang="ts">
  let katex: typeof import('katex').default | undefined
  let loading: Promise<unknown> | undefined

  // KaTeX loads on first use, so pages without math don't download it.
  function loadKatex(): Promise<unknown> {
    loading ??= import('katex').then(
      (module) => (katex = module.default),
      (error) => {
        loading = undefined
        throw error
      }
    )
    return loading
  }

  // HTML, `''` when KaTeX can't typeset the formula, or `undefined` before KaTeX loads.
  function typeset(tex: string, displayMode: boolean): string | undefined {
    if (!katex) return undefined
    try {
      return katex.renderToString(tex, { throwOnError: true, displayMode })
    } catch {
      return ''
    }
  }
</script>

<script lang="ts">
  let {
    content,
    class: className = '',
  }: {
    content: string
    class?: string
  } = $props()

  let isInline = $derived(className.split(' ').includes('inline'))

  // Until KaTeX loads, and for unfinished or invalid TeX, the source shows.
  // Server rendering can't wait for it, so the browser typesets after hydration.
  let loaded = $state(false)
  let html = $derived.by(() => {
    void loaded
    return typeset(content, !isInline)
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
