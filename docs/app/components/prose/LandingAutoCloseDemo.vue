<script setup lang="ts">
import { autoCloseMarkdown } from 'comark'

interface DemoStep {
  raw: string
  autoClosed: string
  label: string
}

const steps: DemoStep[] = [
  { raw: '**bold text', autoClosed: '**bold text**', label: 'Bold' },
  { raw: '_italic content', autoClosed: '_italic content_', label: 'Italic' },
  { raw: '~~strikethrough', autoClosed: '~~strikethrough~~', label: 'Strikethrough' },
  { raw: '[Comark](https://comark.dev', autoClosed: '[Comark](https://comark.dev)', label: 'Link' },
]

const currentStep = ref(0)
const rawText = ref('')
const showAutoClosed = ref(false)
const suffixVisible = ref(false)
const rootRef = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null
let hasStarted = false

const current = computed(() => steps[currentStep.value] ?? steps[0]!)

const autoClosedSuffix = computed(() => {
  const step = current.value
  return step.autoClosed.slice(step.raw.length)
})

const liveMarkdown = computed(() => {
  if (!rawText.value) return ''
  if (showAutoClosed.value) return current.value.autoClosed
  if (rawText.value.length < 3) return ''
  return autoCloseMarkdown(rawText.value)
})

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function nextStep() {
  currentStep.value = (currentStep.value + 1) % steps.length
  animate()
}

function animate() {
  clearTimer()
  const step = current.value
  rawText.value = ''
  showAutoClosed.value = false
  suffixVisible.value = false
  let i = 0

  function typeChar() {
    if (i >= step.raw.length) {
      timer = setTimeout(() => {
        showAutoClosed.value = true
        requestAnimationFrame(() => {
          suffixVisible.value = true
        })
        timer = setTimeout(nextStep, 3000)
      }, 600)
      return
    }
    rawText.value += step.raw[i]
    i++
    timer = setTimeout(typeChar, 50 + Math.random() * 30)
  }

  typeChar()
}

onMounted(() => {
  if (!rootRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasStarted) {
          hasStarted = true
          animate()
        }
      }
    },
    { threshold: 0.2 }
  )
  observer.observe(rootRef.value)
})

onBeforeUnmount(() => {
  clearTimer()
  if (observer) observer.disconnect()
})
</script>

<template>
  <div
    ref="rootRef"
    class="not-prose flex h-80 flex-col overflow-hidden rounded-2xl border border-muted md:h-96"
  >
    <div class="flex items-center border-b border-muted bg-muted/30 px-4 py-2">
      <span class="border-b-2 border-primary px-1 py-1 font-mono text-xs text-primary">
        {{ current.label }}
      </span>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-[1fr_1px_1fr]">
      <div class="min-w-0 overflow-y-auto">
        <div class="border-b border-muted px-4 py-2">
          <span class="font-mono text-xs text-dimmed">source</span>
        </div>
        <div class="px-4 py-4">
          <div class="font-mono text-xs/6 whitespace-pre-wrap">
            <span class="text-highlighted">{{ rawText }}</span>
            <span
              v-if="!showAutoClosed"
              class="caret"
            />
            <span
              v-if="showAutoClosed"
              class="autoclose-suffix"
              :class="suffixVisible ? 'opacity-100' : 'opacity-0'"
              >{{ autoClosedSuffix }}</span
            >
          </div>
        </div>
      </div>

      <div class="bg-border" />

      <div class="min-w-0 overflow-y-auto">
        <div class="border-b border-muted px-4 py-2">
          <span class="font-mono text-xs text-dimmed">rendered output</span>
        </div>
        <div class="px-4 py-4 text-sm">
          <div class="autoclose-rendered overflow-hidden">
            <Markdown
              v-if="liveMarkdown"
              :key="currentStep"
              class="text-sm"
              :value="liveMarkdown"
              :streaming="!showAutoClosed"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes autoclose-pulse {
  0%,
  100% {
    color: var(--ui-primary);
    transform: scale(1);
  }
  50% {
    color: var(--ui-text-highlighted);
    transform: scale(1.25);
  }
}

.autoclose-suffix {
  display: inline-block;
  font-weight: 700;
  color: var(--ui-primary);
  transition: opacity 0.3s ease;
  animation: autoclose-pulse 0.85s ease-in-out infinite;
}

.autoclose-rendered :deep(*) {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
