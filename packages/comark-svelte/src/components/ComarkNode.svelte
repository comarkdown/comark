<!--
@component
@deprecated Use `MarkdownNode` instead — same component, renamed to describe
what it renders. `Node` will be removed in a future major version.
-->
<script lang="ts">
  import type { MarkdownNodeProps } from '../types.js'
  import MarkdownNode from './MarkdownNode.svelte'
  import { warnDeprecated } from '../internal/deprecation.js'

  let props: MarkdownNodeProps = $props()

  warnDeprecated('ComarkNode', 'MarkdownNode')
</script>

<MarkdownNode {...props} />
