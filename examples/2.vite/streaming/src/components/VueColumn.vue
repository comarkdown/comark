<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from 'vue'
import { Markdown } from '@comark/vue'
import { store, type StreamState } from '../shared/store'

const state = shallowRef<StreamState>(store.getState())
let unsubscribe: (() => void) | undefined

onMounted(() => {
  unsubscribe = store.subscribe((next) => (state.value = next))
})

onUnmounted(() => unsubscribe?.())
</script>

<template>
  <Suspense>
    <Markdown
      :value="state.streamed"
      :streaming="state.streaming"
      :plugins="state.plugins"
      :effects="state.effects"
    />
    <template #fallback>
      <p class="muted">Parsing…</p>
    </template>
  </Suspense>
</template>
