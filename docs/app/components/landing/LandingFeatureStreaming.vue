<script setup lang="ts">
defineProps<{
  headline: string
  title: string
  description: string
  linkLabel: string
  linkTo: string
}>()

const STREAMING_MD = `Awake! for **Morning in the Bowl of Night**
Has flung the Stone that puts the Stars to Flight:
And Lo! the \`Hunter of the East\` has caught
The Sultan's Turret in a Noose of Light.

Come, fill the Cup, and in the fire of Spring
_The Winter Garment of Repentance fling_:
The Bird of Time has but a little way
To flutter—and the Bird is on the Wing.`

const streamedText = ref('')
const isStreaming = ref(false)
const sectionRef = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null
let hasStarted = false

function startStream() {
  if (isStreaming.value) return
  streamedText.value = ''
  isStreaming.value = true
  let i = 0
  const chunkSize = 4

  function next() {
    if (i >= STREAMING_MD.length) {
      isStreaming.value = false
      timer = setTimeout(startStream, 3000)
      return
    }
    streamedText.value += STREAMING_MD.slice(i, i + chunkSize)
    i += chunkSize
    timer = setTimeout(next, 60 + Math.random() * 30)
  }
  next()
}

onMounted(() => {
  if (!sectionRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasStarted) {
          hasStarted = true
          startStream()
        }
      }
    },
    { threshold: 0.3 },
  )
  observer.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  if (observer) observer.disconnect()
})
</script>

<template>
  <div
    ref="sectionRef"
    class="overflow-hidden p-6 lg:p-8"
  >
    <span
      v-if="headline"
      class="section-label"
    >
      {{ headline }}
    </span>
    <h2 class="mt-4 text-2xl font-bold text-highlighted">
      {{ title }}
    </h2>
    <p class="mt-3 text-base/7 text-muted">
      {{ description }}
    </p>

    <div class="mt-6 h-[280px] overflow-auto border border-muted bg-muted/50 p-4">
      <ComarkDocs
        v-if="streamedText"
        class="prose prose-sm max-w-none dark:prose-invert"
        :markdown="streamedText"
        :streaming="isStreaming"
        :caret="{ class: 'caret' }"
      />
    </div>

    <UButton
      :label="linkLabel"
      :to="linkTo"
      variant="link"
      trailing-icon="i-lucide-arrow-right"
      class="mt-4 px-0"
    />
  </div>
</template>
