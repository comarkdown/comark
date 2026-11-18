<script setup lang="ts">
import { useIntervalFn, useIntersectionObserver } from '@vueuse/core'
import BikeDiagram from '../intelligent-ui/BikeDiagram.vue'
import { bikePrompt, bikeStages } from '~/constants/intelligent-ui'

const components = { 'bike-diagram': BikeDiagram }
const sources = bikeStages.map((item) => `\`\`\`mdc\n${item.markdown}\n\`\`\``)

const stage = ref(0)
const showSource = ref(false)
const rootRef = ref<HTMLElement | null>(null)

// Lets the diagram play its intro once its stage shows.
provide(
  'intelligent-ui:visible',
  computed(() => stage.value === bikeStages.length - 1 && !showSource.value)
)

// Walk through the stages once, the first time the demo scrolls into view.
const { pause, resume } = useIntervalFn(
  () => {
    if (stage.value < bikeStages.length - 1) stage.value++
    else pause()
  },
  1800,
  { immediate: false }
)

const { stop } = useIntersectionObserver(
  rootRef,
  ([entry]) => {
    if (!entry?.isIntersecting) return
    stop()
    resume()
  },
  { threshold: 0.5 }
)

function select(index: number) {
  pause()
  stop()
  stage.value = index
}
</script>

<template>
  <div
    ref="rootRef"
    class="not-prose my-8 rounded-2xl border border-default bg-muted/30 p-4 sm:p-6"
  >
    <div class="flex justify-end">
      <p class="max-w-xs rounded-2xl bg-primary/10 px-4 py-2 text-sm text-highlighted">
        {{ bikePrompt }}
      </p>
    </div>

    <div class="mt-6 flex items-center justify-between gap-2 border-b border-default">
      <div
        class="flex gap-4"
        role="tablist"
      >
        <button
          v-for="(item, index) in bikeStages"
          :key="item.label"
          type="button"
          role="tab"
          :aria-selected="stage === index"
          class="-mb-px border-b-2 pb-2 text-sm transition-colors"
          :class="
            stage === index
              ? 'border-primary font-medium text-highlighted'
              : 'border-transparent text-muted hover:text-default'
          "
          @click="select(index)"
        >
          {{ item.label }}
        </button>
      </div>
      <UButton
        :label="showSource ? 'Preview' : 'Source'"
        :icon="showSource ? 'i-lucide-eye' : 'i-lucide-code'"
        color="neutral"
        variant="ghost"
        size="xs"
        class="mb-1"
        @click="showSource = !showSource"
      />
    </div>

    <!-- Every stage stays mounted in the same cell, so the box keeps the tallest height. -->
    <div class="grid pt-4">
      <div
        v-for="(item, index) in bikeStages"
        :key="item.label"
        class="col-start-1 row-start-1 transition-all duration-300 [&_.comark-content>:first-child]:mt-0 [&_.comark-content>:last-child]:mb-0"
        :class="
          stage === index ? 'translate-y-0 opacity-100' : 'pointer-events-none invisible translate-y-1.5 opacity-0'
        "
        :aria-hidden="stage !== index"
      >
        <Markdown
          v-show="!showSource"
          :value="item.markdown"
          :components="components"
        />
        <Markdown
          v-show="showSource"
          :value="sources[index]"
        />
      </div>
    </div>
  </div>
</template>
