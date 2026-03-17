<script lang="ts">
  import { Comark } from '@comark/svelte'
  import Alert from './components/Alert.svelte'

  const markdown = `
# Hello *World*

::alert{type="info"}
This is an alert!
::
`
</script>

<Comark markdown={markdown} components={{ Alert }} />
