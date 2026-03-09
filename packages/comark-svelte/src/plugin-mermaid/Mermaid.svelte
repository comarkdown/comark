<!--
@component
Renders a Mermaid diagram from a Comark AST `mermaid` node.

Receives a `content` prop with the Mermaid diagram source.
Supports `theme` and `themeDark` props for light/dark mode theming.
Automatically detects dark mode from the `<html>` element's `dark` class.

@example
```svelte
<script>
  import { mermaid, Mermaid } from '@comark/svelte/plugin-mermaid'
  import { Comark } from '@comark/svelte'
</script>

<Comark markdown={md} plugins={[mermaid()]} components={{ mermaid: Mermaid }} />
```
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import {
    renderMermaidSVG,
    THEMES,
    type DiagramColors,
  } from 'beautiful-mermaid'
  import type { ThemeNames } from '@comark/mermaid'

  let {
    content,
    class: className = '',
    height = '400px',
    width = '100%',
    theme,
    'theme-dark': themeDark,
  }: {
    'content': string
    'class'?: string
    'height'?: string
    'width'?: string
    'theme'?: ThemeNames | DiagramColors
    'theme-dark'?: ThemeNames | DiagramColors
  } = $props()

  let isDark = $state(false)

  let resolvedTheme = $derived.by(() => {
    const themeProp = isDark ? themeDark : theme

    let resolved: DiagramColors | undefined
    if (typeof themeProp === 'string') {
      resolved = THEMES[themeProp]
    }
    else if (typeof themeProp === 'object') {
      resolved = themeProp
    }

    if (!resolved) {
      resolved = THEMES[isDark ? 'tokyo-night' : 'tokyo-light']
    }

    return resolved
  })

  let { svgContent, error } = $derived.by(() => {
    try {
      return {
        svgContent: renderMermaidSVG(content, resolvedTheme),
        error: null as string | null,
      }
    }
    catch (err) {
      return {
        svgContent: '',
        error: err instanceof Error ? err.message : 'Failed to render diagram',
      }
    }
  })

  onMount(() => {
    const htmlEl = document.documentElement
    isDark = htmlEl.classList.contains('dark')

    const observer = new MutationObserver(() => {
      isDark = htmlEl.classList.contains('dark')
    })

    observer.observe(htmlEl, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  })
</script>

<div
  class="mermaid {className}"
  style:display="flex"
  style:justify-content="center"
  style:width
  style:height
  data-error={error}
>
  <!-- eslint-disable svelte/no-at-html-tags -- Mermaid SVG output is safe rendered content -->
  {@html svgContent}
</div>
