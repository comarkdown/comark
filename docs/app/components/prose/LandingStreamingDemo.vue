<script setup lang="ts">
const POEM = `Awake! for **Morning in the Bowl of Night**
Has flung the Stone that puts the Stars to Flight:
And Lo! the \`Hunter of the East\` has caught
The Sultan's Turret in a Noose of Light.

Come, fill the Cup, and in the fire of Spring
_The Winter Garment of Repentance fling_:
The Bird of Time has but a little way
To flutter—and the Bird is on the Wing.

`
// Revealed atomically (not typed char-by-char) so the parser never sees a
// half-typed attribute — a truncated quoted value gets auto-closed as a
// boolean, which breaks the icon.
const ALERT_OPEN = '::callout{icon="i-lucide-feather" title="No Markup left behind"}\n'
const ALERT_BODY = 'Even as the Bird of Time takes flight, every stroke of syntax lands whole.'
const ALERT_CLOSE = '\n::'

const streamedText = ref('')
const isStreaming = ref(false)
const rootRef = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null
let hasStarted = false

// Each segment either types in char-by-char (chunked) or gets appended whole in
// one go — the latter for the alert's opening/closing tags, so the parser
// never sees a half-typed attribute.
const SEGMENTS: { text: string; atomic?: boolean }[] = [
  { text: POEM },
  { text: ALERT_OPEN, atomic: true },
  { text: ALERT_BODY },
  { text: ALERT_CLOSE, atomic: true },
]

function scrollToBottom() {
  nextTick(() => {
    if (rootRef.value) rootRef.value.scrollTop = rootRef.value.scrollHeight
  })
}

function startStream() {
  if (isStreaming.value) return
  streamedText.value = ''
  isStreaming.value = true
  let segmentIndex = 0
  let i = 0
  const chunkSize = 4

  function next() {
    const segment = SEGMENTS[segmentIndex]
    if (!segment) {
      isStreaming.value = false
      timer = setTimeout(startStream, 3000)
      return
    }

    if (segment.atomic) {
      streamedText.value += segment.text
      segmentIndex++
      i = 0
      scrollToBottom()
      timer = setTimeout(next, 60 + Math.random() * 30)
      return
    }

    streamedText.value += segment.text.slice(i, i + chunkSize)
    i += chunkSize
    scrollToBottom()
    if (i >= segment.text.length) {
      segmentIndex++
      i = 0
    }
    timer = setTimeout(next, 60 + Math.random() * 30)
  }
  next()
}

onMounted(() => {
  if (!rootRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasStarted) {
          hasStarted = true
          startStream()
        }
      }
    },
    { threshold: 0.2 }
  )
  observer.observe(rootRef.value)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  if (observer) observer.disconnect()
})
</script>

<template>
  <div
    ref="rootRef"
    class="not-prose h-80 overflow-y-auto rounded-2xl border border-muted bg-muted/30 p-4 md:h-96"
  >
    <Markdown
      v-if="streamedText"
      class="text-sm"
      :value="streamedText"
      :streaming="isStreaming"
      :caret="{ class: 'caret' }"
    />
  </div>
</template>
