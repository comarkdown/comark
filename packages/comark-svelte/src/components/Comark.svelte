<!--
@component
@deprecated Use `Markdown` instead — same component, renamed to describe
what it renders. `Comark` will be removed in a future major version.
-->
<script lang="ts">
  import type { ComarkProps } from '../types.js'
  import Markdown from './Markdown.svelte'
  import { warnDeprecated } from '../internal/deprecation.js'

  let props: ComarkProps = $props()

  warnDeprecated('Comark', 'Markdown')
</script>

<Markdown {...props} />
