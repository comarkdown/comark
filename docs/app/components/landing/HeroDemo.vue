<script setup lang="ts">
const DEMO_MARKDOWN = `# Hello World

A **high-performance** markdown parser with _streaming_ support.

## Features

- Parse markdown in real-time
- Vue & React components
- Auto-close incomplete syntax

::alert{type="info"}
Comark handles **components in markdown** natively.
::

> Built for modern web applications.

\`\`\`ts
import { parse } from 'comark'

const tree = await parse('# Hello **World**')
\`\`\`
`

const rawText = ref('')
const isStreaming = ref(false)
const hasPlayed = ref(false)
const sourceEl = ref<HTMLElement | null>(null)
const renderedEl = ref<HTMLElement | null>(null)

let timer: ReturnType<typeof setTimeout> | null = null

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
  const chunkSize = 3

  function next() {
    if (i >= DEMO_MARKDOWN.length) {
      isStreaming.value = false
      return
    }
    const chunk = DEMO_MARKDOWN.slice(i, i + chunkSize)
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
        label="Replay"
        icon="i-lucide-rotate-ccw"
        variant="ghost"
        color="neutral"
        size="xs"
        :disabled="!hasPlayed || isStreaming"
        @click="replay"
      />
    </div>

    <div class="grid md:grid-cols-2">
      <div class="border-b border-muted md:border-r md:border-b-0">
        <div class="border-b border-muted bg-muted px-4 py-2">
          <span class="font-mono text-xs text-muted">source.md</span>
        </div>
        <div
          ref="sourceEl"
          class="h-[400px] overflow-auto scroll-smooth p-4"
        >
          <pre class="font-mono text-sm/6 whitespace-pre-wrap text-default">{{ rawText }}<span
v-if="isStreaming"
                                                                                               class="caret"
          /></pre>
        </div>
      </div>

      <div>
        <div class="border-b border-muted bg-muted px-4 py-2">
          <span class="font-mono text-xs text-muted">rendered output</span>
        </div>
        <div
          ref="renderedEl"
          class="h-[400px] overflow-auto scroll-smooth p-4"
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
