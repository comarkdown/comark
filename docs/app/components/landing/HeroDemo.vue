<script setup lang="ts">
import { codeToHtml } from 'shiki'

const props = defineProps<{
  demoMarkdown: string
}>()

const rawText = ref('')
const isStreaming = ref(false)
const hasPlayed = ref(false)
const sourceEl = ref<HTMLElement | null>(null)
const renderedEl = ref<HTMLElement | null>(null)
const highlightedSource = ref('')

let timer: ReturnType<typeof setTimeout> | null = null
let highlightTimer: ReturnType<typeof setTimeout> | null = null

watch(rawText, (text) => {
  if (highlightTimer) clearTimeout(highlightTimer)
  highlightTimer = setTimeout(async () => {
    if (!text) {
      highlightedSource.value = ''
      return
    }
    highlightedSource.value = await codeToHtml(text, {
      lang: 'mdc',
      themes: { light: 'github-light', dark: 'github-dark' },
    })
  }, 16)
})

function scrollToBottom() {
  nextTick(() => {
    if (sourceEl.value) {
      sourceEl.value.scrollTop = sourceEl.value.scrollHeight
    }
    if (renderedEl.value) {
      renderedEl.value.scrollTop = renderedEl.value.scrollHeight
    }
  })
}

function startStream() {
  if (isStreaming.value) return
  rawText.value = ''
  isStreaming.value = true
  hasPlayed.value = true

  let i = 0
  const chunkSize = 4

  function next() {
    if (i >= props.demoMarkdown.length) {
      isStreaming.value = false
      return
    }
    const chunk = props.demoMarkdown.slice(i, i + chunkSize)
    rawText.value += chunk
    i += chunkSize
    scrollToBottom()
    const delay = 30 + Math.random() * 20
    timer = setTimeout(next, delay)
  }

  next()
}

function replay() {
  if (timer) clearTimeout(timer)
  isStreaming.value = false
  rawText.value = ''
  setTimeout(startStream, 100)
}

onMounted(() => {
  setTimeout(startStream, 200)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  if (highlightTimer) clearTimeout(highlightTimer)
})
</script>

<template>
  <div class="overflow-hidden border border-muted bg-default">
    <div class="flex items-center justify-between border-b border-muted bg-muted px-4 py-2.5">
      <div class="flex items-center gap-2">
        <div class="flex gap-1.5">
          <div class="size-2.5 rounded-full bg-accented" />
          <div class="size-2.5 rounded-full bg-accented" />
          <div class="size-2.5 rounded-full bg-accented" />
        </div>
        <span class="ml-3 font-mono text-xs text-muted">comark — streaming</span>
      </div>
      <UButton
        label="Open in playground"
        trailing-icon="i-lucide-arrow-right"
        variant="subtle"
        color="neutral"
        size="xs"
        to="/play"
      />
    </div>

    <div class="grid md:grid-cols-2">
      <div class="min-w-0 border-b border-muted md:border-r md:border-b-0">
        <div class="border-b border-muted bg-muted px-4 py-2">
          <span class="font-mono text-xs text-muted">source.md</span>
        </div>
        <div
          ref="sourceEl"
          class="shiki-source h-[280px] overflow-y-auto overflow-x-hidden scroll-smooth p-4 md:h-[400px]"
        >
          <div
            class="font-mono text-sm/6"
            v-html="highlightedSource"
          />
          <span
            v-if="isStreaming"
            class="caret"
          />
        </div>
      </div>

      <div class="min-w-0">
        <div class="border-b border-muted bg-muted px-4 py-2 flex items-center justify-between">
          <span class="font-mono text-xs text-muted">rendered output</span>
          <UButton
            label="Replay"
            icon="i-lucide-rotate-ccw"
            variant="ghost"
            color="neutral"
            size="xs"
            class="transition-opacity"
            :class="{ 'opacity-0': !hasPlayed || isStreaming }"
            @click="replay"
          />
        </div>
        <div
          ref="renderedEl"
          class="h-[280px] overflow-auto scroll-smooth p-4 md:h-[400px]"
        >
          <ComarkDocs
            v-if="rawText"
            class="prose prose-sm max-w-none dark:prose-invert"
            :markdown="rawText"
            :streaming="isStreaming"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shiki-source :deep(pre) {
  margin: 0;
  background: transparent !important;
  white-space: pre-wrap;
  word-break: break-word;
}

.shiki-source :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.shiki-source :deep(.line) {
  display: inline;
}

.shiki-source :deep(span) {
  background-color: transparent !important;
}

html.dark .shiki-source :deep(span) {
  color: var(--shiki-dark) !important;
  font-style: var(--shiki-dark-font-style) !important;
}
</style>
