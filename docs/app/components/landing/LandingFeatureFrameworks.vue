<script setup lang="ts">
import { codeToHtml } from 'shiki'

defineProps<{
  headline: string
  title: string
  description: string
  vueLinkLabel: string
  vueLinkTo: string
  reactLinkLabel: string
  reactLinkTo: string
}>()

const activeTab = ref<'vue' | 'react'>('vue')

const vueCode = `<script setup lang="ts">
import { Comark } from 'comark/vue'
import Alert from './components/Alert.vue'

const md = \`
# Hello **World**

::alert{type="info"}
This is a Comark component!
::
\`
${'<'}/script>

<template>
  <Suspense>
    <Comark :components="{ Alert }">
      {{ md }}
    </Comark>
  </Suspense>
</template>`

const reactCode = `import { Comark } from 'comark/react'
import { Alert } from './components/Alert'

const markdown = \`
# Hello **World**

::alert{type="info"}
This is a Comark component!
::
\`

export default function App() {
  return (
    <Comark components={{ Alert }}>
      {markdown}
    </Comark>
  )
}`

const { data: highlighted } = await useAsyncData('fw-highlight', async () => {
  const themes = { light: 'github-light', dark: 'github-dark' } as const
  const [vue, react] = await Promise.all([
    codeToHtml(vueCode, { lang: 'vue', themes }),
    codeToHtml(reactCode, { lang: 'tsx', themes }),
  ])
  return { vue, react }
})
</script>

<template>
  <div class="overflow-hidden p-6 lg:p-8">
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

    <div class="mt-6 overflow-hidden border border-muted bg-muted/50">
      <div class="flex items-center border-b border-muted">
        <button
          class="flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs"
          :class="activeTab === 'vue' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-highlighted'"
          @click="activeTab = 'vue'"
        >
          <UIcon
            name="i-logos-vue"
            class="size-3.5"
          />
          App.vue
        </button>
        <button
          class="flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs"
          :class="activeTab === 'react' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-highlighted'"
          @click="activeTab = 'react'"
        >
          <UIcon
            name="i-logos-react"
            class="size-3.5"
          />
          App.tsx
        </button>
      </div>
      <div class="shiki-block h-[280px] overflow-auto p-4">
        <div
          v-show="activeTab === 'vue'"
          class="text-sm/6"
          v-html="highlighted?.vue"
        />
        <div
          v-show="activeTab === 'react'"
          class="text-sm/6"
          v-html="highlighted?.react"
        />
      </div>
    </div>

    <div class="mt-4 flex items-center gap-4">
      <UButton
        :label="vueLinkLabel"
        :to="vueLinkTo"
        variant="link"
        trailing-icon="i-lucide-arrow-right"
        class="px-0"
      />
      <UButton
        :label="reactLinkLabel"
        :to="reactLinkTo"
        variant="link"
        trailing-icon="i-lucide-arrow-right"
        class="px-0"
      />
    </div>
  </div>
</template>

<style scoped>
.shiki-block :deep(pre) {
  margin: 0;
  background: transparent !important;
}

.shiki-block :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.shiki-block :deep(span) {
  background-color: transparent !important;
}

html.dark .shiki-block :deep(span) {
  color: var(--shiki-dark) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
}
</style>
