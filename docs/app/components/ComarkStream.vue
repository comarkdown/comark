<script setup lang="ts">
import { Comark } from 'comark/vue'
import cjkFriendlyPlugin from '@comark/cjk'
import mathPlugin from '@comark/math'
import { Math } from '@comark/math/vue'
import comarkHighlight from 'comark/plugins/highlight'
import ProsePre from './landing/ProsePre.vue'
import { ref } from 'vue'

const props = defineProps<{
  markdown: string
  chunkSize?: number
  delayMs?: number
  comarkProps?: object
}>()

const accumulated = ref('')
const isStreaming = ref(false)
const controller = ref<AbortController | null>(null)

async function startStream() {
  if (isStreaming.value) return

  accumulated.value = ''
  isStreaming.value = true
  controller.value = new AbortController()

  const chunkSize = props.chunkSize ?? 10
  const delayMs = props.delayMs ?? 100

  for (let i = 0; i < props.markdown.length; i += chunkSize) {
    if (controller.value.signal.aborted) break

    const chunk = props.markdown.slice(i, i + chunkSize)
    accumulated.value += chunk

    if (i + chunkSize < props.markdown.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  isStreaming.value = false
}

function reset() {
  if (controller.value) {
    controller.value.abort()
  }
  isStreaming.value = false
  controller.value = null
}

// Expose methods to parent
defineExpose({
  startStream,
  reset,
  isStreaming,
})
</script>

<template>
  <div>
    <Comark
      v-if="markdown"
      class="prose dark:prose-invert max-w-none"
      :markdown="accumulated"
      :options="{
        plugins: [cjkFriendlyPlugin(), mathPlugin(), comarkHighlight()],
      }"
      :streaming="isStreaming"
      :components="{ Math, pre: ProsePre }"
      v-bind="comarkProps"
    />
  </div>
</template>
