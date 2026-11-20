<script lang="ts">
  import { Markdown } from '@comark/svelte'
  import { store, type StreamState } from '../shared/store'

  let state: StreamState = $state(store.getState())

  $effect(() => store.subscribe((next) => (state = next)))
</script>

<Markdown
  value={state.streamed}
  streaming={state.streaming}
  plugins={state.plugins}
  effects={state.effects}
/>
