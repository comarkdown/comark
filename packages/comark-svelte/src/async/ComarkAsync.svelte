<!--
@component
@deprecated Use `MarkdownAsync` instead — same component, renamed to describe
what it renders. `ComarkAsync` will be removed in a future major version.
-->
<script lang="ts">
  import type { ComarkProps } from '../types.js'
  import MarkdownAsync from './MarkdownAsync.svelte'
  import { warnDeprecated } from '../internal/deprecation.js'

  let props: ComarkProps = $props()

  warnDeprecated('ComarkAsync', 'MarkdownAsync')
</script>

<MarkdownAsync {...props} />
