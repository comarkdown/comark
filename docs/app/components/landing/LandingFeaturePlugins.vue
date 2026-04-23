<script setup lang="ts">
import { codeToHtml } from 'shiki'

interface Plugin {
  id: string
  name: string
  icon: string
  description: string
  input: string
  package: string
}

const props = defineProps<{
  headline: string
  title: string
  description: string
  linkLabel: string
  linkTo: string
  plugins: Plugin[]
}>()

const activePlugin = ref(props.plugins[0]?.id ?? '')

const current = computed(() => props.plugins.find((p) => p.id === activePlugin.value) ?? props.plugins[0]!)

const highlightedSource = ref('')

watch(
  current,
  async (plugin) => {
    highlightedSource.value = await codeToHtml(plugin.input, {
      lang: 'mdc',
      themes: { light: 'github-light', dark: 'github-dark' },
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="border-b border-default">
    <div class="grid lg:grid-cols-2">
      <div class="border-b border-default p-6 lg:border-r lg:border-b-0 lg:p-8">
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
            v-for="plugin in plugins"
            :key="plugin.id"
            :label="plugin.name"
            :icon="plugin.icon"
            :variant="activePlugin === plugin.id ? 'soft' : 'outline'"
            :color="activePlugin === plugin.id ? 'primary' : 'neutral'"
            size="xs"
            @click="activePlugin = plugin.id"
          />
        </div>

        <p class="mt-6 text-sm/6 text-muted">
          {{ current.description }}
        </p>

        <UButton
          :label="linkLabel"
          :to="linkTo"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
          class="mt-4 px-0"
        />
      </div>

      <div class="flex min-w-0 flex-col">
        <div class="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[1fr_1px_1fr]">
          <div class="min-w-0 border-b border-default sm:border-b-0">
            <div class="border-b border-default px-4 py-2 sm:px-6 lg:px-8">
              <span class="font-mono text-xs text-dimmed">source</span>
            </div>
            <div class="shiki-source h-[200px] overflow-auto p-4 sm:h-[360px] sm:p-6 lg:p-8">
              <div
                class="font-mono text-sm/6"
                v-html="highlightedSource"
              />
            </div>
          </div>

          <div class="hidden bg-border sm:block" />

          <div class="min-w-0">
            <div class="border-b border-default px-4 py-2 sm:px-6 lg:px-8">
              <span class="font-mono text-xs text-dimmed">rendered output</span>
            </div>
            <div class="h-[200px] overflow-auto p-4 sm:h-[360px] sm:p-6 lg:p-8">
              <ComarkDocs
                :key="current.id"
                class="prose prose-sm max-w-none dark:prose-invert"
                :markdown="current.input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shiki-source :deep(pre) {
  margin: 0;
  background: transparent !important;
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
