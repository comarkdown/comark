<!--
@component
@deprecated Use `MarkdownParsed` instead — same component, renamed to describe
what it renders. `ComarkRenderer` will be removed in a future major version.
-->
<script lang="ts">
  import type { ComarkRendererProps } from '../types.js'
  import MarkdownParsed from './MarkdownParsed.svelte'
  import { warnDeprecated } from '../internal/deprecation.js'

  let props: ComarkRendererProps = $props()

  warnDeprecated('ComarkRenderer', 'MarkdownParsed')
</script>

<MarkdownParsed {...props} />
