<script setup lang="ts">
import { autoCloseMarkdown } from 'comark'

defineProps<{
  headline: string
  title: string
  description: string
  linkLabel: string
  linkTo: string
}>()

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
const sectionRef = ref<HTMLElement | null>(null)
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
        timer = setTimeout(nextStep, 2000)
      }, 600)
      return
    }
    rawText.value += step.raw[i]
    i++
    timer = setTimeout(typeChar, 50 + Math.random() * 30)
  }

  typeChar()
}

function selectStep(i: number) {
  clearTimer()
  currentStep.value = i
  animate()
}

function nextStep() {
  currentStep.value = (currentStep.value + 1) % steps.length
  animate()
}

onMounted(() => {
  if (!sectionRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasStarted) {
          hasStarted = true
          animate()
        }
      }
    },
    { threshold: 0.3 },
  )
  observer.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  clearTimer()
  if (observer) observer.disconnect()
})
</script>

<template>
  <div
    ref="sectionRef"
    class="border-b border-default"
  >
    <div class="grid lg:grid-cols-2">
      <div
        class="border-b border-default p-6 lg:border-r lg:border-b-0 lg:p-8"
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

        <div class="mt-6 flex flex-wrap gap-2">
          <UButton
            v-for="(step, i) in steps"
            :key="step.label"
            :label="step.label"
            :variant="currentStep === i ? 'soft' : 'outline'"
            :color="currentStep === i ? 'primary' : 'neutral'"
            size="xs"
            :ui="{ base: 'font-mono' }"
            @click="selectStep(i)"
          />
        </div>

        <UButton
          :label="linkLabel"
          :to="linkTo"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
          class="mt-6 px-0"
        />
      </div>

      <div class="flex min-w-0 flex-col">
        <div class="flex items-center border-b border-default bg-muted/30 px-6 lg:px-8">
          <span class="border-b-2 border-primary px-1 py-2.5 font-mono text-xs text-primary">
            {{ current.label }}
          </span>
        </div>

        <div class="grid min-h-0 flex-1 grid-cols-[1fr_1px_1fr]">
          <div class="min-w-0">
            <div class="border-b border-default px-4 py-2 sm:px-6 lg:px-8">
              <span class="font-mono text-xs text-dimmed">source</span>
            </div>
            <div class="h-[160px] px-4 py-5 sm:px-6 lg:px-8">
              <div class="font-mono text-xs/7 whitespace-pre-wrap sm:text-sm/7">
                <span class="text-highlighted">{{ rawText }}</span>
                <span
                  v-if="!showAutoClosed"
                  class="caret"
                />
                <span
                  v-if="showAutoClosed"
                  class="autoclose-suffix"
                  :class="suffixVisible ? 'opacity-100' : 'opacity-0'"
                >{{ autoClosedSuffix }}</span>
              </div>
            </div>
          </div>

          <div class="bg-border" />

          <div class="min-w-0">
            <div class="border-b border-default px-4 py-2 sm:px-6 lg:px-8">
              <span class="font-mono text-xs text-dimmed">rendered output</span>
            </div>
            <div class="h-[160px] px-4 py-5 sm:px-6 lg:px-8">
              <div class="autoclose-rendered overflow-hidden">
                <ComarkDocs
                  v-if="liveMarkdown"
                  :key="currentStep"
                  class="prose prose-sm max-w-none dark:prose-invert"
                  :markdown="liveMarkdown"
                  :streaming="!showAutoClosed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.autoclose-suffix {
  color: var(--ui-primary);
  transition: opacity 0.3s ease;
}

.autoclose-rendered :deep(*) {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
