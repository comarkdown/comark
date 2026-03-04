<script setup lang="ts">
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
<\/script>

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
</script>

<template>
  <div class="p-6 lg:p-8">
    <span v-if="headline" class="section-label">
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
          <UIcon name="i-logos-vue" class="size-3.5" />
          App.vue
        </button>
        <button
          class="flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs"
          :class="activeTab === 'react' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-highlighted'"
          @click="activeTab = 'react'"
        >
          <UIcon name="i-logos-react" class="size-3.5" />
          App.tsx
        </button>
      </div>
      <div class="h-[280px] overflow-auto p-4">
        <pre v-show="activeTab === 'vue'" class="font-mono text-sm/6 whitespace-pre-wrap text-default">{{ vueCode }}</pre>
        <pre v-show="activeTab === 'react'" class="font-mono text-sm/6 whitespace-pre-wrap text-default">{{ reactCode }}</pre>
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
