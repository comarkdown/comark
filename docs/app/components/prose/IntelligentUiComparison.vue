<script setup lang="ts">
import ImageCollage from '../intelligent-ui/ImageCollage.vue'
import MediaList from '../intelligent-ui/MediaList.vue'
import QuantityCalculator from '../intelligent-ui/QuantityCalculator.vue'
import SummaryCard from '../intelligent-ui/SummaryCard.vue'
import Timeline from '../intelligent-ui/Timeline.vue'
import { roastMarkdown, roastPlainMarkdown, roastPrompt } from '~/constants/intelligent-ui'

const components = {
  'image-collage': ImageCollage,
  'summary-card': SummaryCard,
  'media-list': MediaList,
  'quantity-calculator': QuantityCalculator,
  timeline: Timeline,
}

const source = `\`\`\`mdc\n${roastMarkdown}\`\`\``

const showSource = ref(false)
const text = ref(roastMarkdown)
const isStreaming = ref(false)
const scrollRef = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

// Lines with a URL land whole, so images never request a half-written address.
const chunks = roastMarkdown
  .split(/(?<=\n)/)
  .flatMap((line) => (line.includes('http') ? [line] : (line.match(/[\s\S]{1,6}/g) ?? [])))

// Replays the answer like a model stream.
function replay() {
  clearTimeout(timer)
  showSource.value = false
  text.value = ''
  isStreaming.value = true
  let i = 0

  function next() {
    if (i >= chunks.length) {
      isStreaming.value = false
      return
    }
    text.value += chunks[i++]
    if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    timer = setTimeout(next, 16)
  }
  next()
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="not-prose my-8 grid gap-4 md:grid-cols-2">
    <div class="flex min-w-0 flex-col rounded-2xl border border-default bg-muted/30">
      <div class="flex h-11 items-center border-b border-default px-4">
        <p class="text-sm font-medium text-muted">Markdown only</p>
      </div>
      <div class="h-[36rem] overflow-y-auto p-4 [&_.comark-content>:last-child]:mb-0">
        <p class="ml-auto max-w-[85%] rounded-2xl bg-elevated px-4 py-2 text-sm text-highlighted">
          {{ roastPrompt }}
        </p>
        <Markdown
          :value="roastPlainMarkdown"
          class="mt-4 text-sm"
        />
      </div>
    </div>

    <div class="flex min-w-0 flex-col rounded-2xl border border-default bg-muted/30">
      <div class="flex h-11 items-center justify-between gap-2 border-b border-default px-4">
        <p class="text-sm font-medium text-highlighted">With Comark components</p>
        <div class="flex gap-1">
          <UButton
            :label="isStreaming ? 'Streaming' : 'Replay'"
            icon="i-lucide-play"
            color="neutral"
            variant="ghost"
            size="xs"
            :loading="isStreaming"
            @click="replay"
          />
          <UButton
            :label="showSource ? 'Preview' : 'Source'"
            :icon="showSource ? 'i-lucide-eye' : 'i-lucide-code'"
            color="neutral"
            variant="ghost"
            size="xs"
            :disabled="isStreaming"
            @click="showSource = !showSource"
          />
        </div>
      </div>
      <div
        ref="scrollRef"
        class="h-[36rem] overflow-y-auto p-4 [&_.comark-content>:last-child]:mb-0"
      >
        <p class="ml-auto max-w-[85%] rounded-2xl bg-primary/10 px-4 py-2 text-sm text-highlighted">
          {{ roastPrompt }}
        </p>
        <Markdown
          v-show="!showSource"
          :value="text"
          :streaming="isStreaming"
          :components="components"
          :caret="isStreaming"
          class="mt-4 text-sm"
        />
        <Markdown
          v-show="showSource"
          :value="source"
          class="mt-4"
        />
      </div>
    </div>
  </div>
</template>
