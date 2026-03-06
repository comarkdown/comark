<script setup lang="ts">
import ProsePreRaw from './ProsePreRaw.vue'

defineProps<{
  headline: string
  title: string
  description: string
}>()

const activeTab = ref<'vue' | 'react'>('vue')

const vueCode = `<script setup lang="ts">
import { Comark } from 'comark/vue'
import Alert from './components/Alert.vue'

const components = { Alert }
const content = ref('# Hello **World**\\n\\n::alert{type="info"}\\nWelcome!\\n::')
${'<'}/script>

<template>
  <Suspense>
    <Comark :components="components">
      {{ content }}
    </Comark>
  </Suspense>
</template>`

const reactCode = `import { Comark } from 'comark/react'
import { Alert } from './components/Alert'

const components = { Alert }

export default function App() {
  const content = '# Hello **World**\\n\\n::alert{type="info"}\\nWelcome!\\n::'

  return (
    <Comark components={components}>
      {content}
    </Comark>
  )
}`
</script>

<template>
  <div class="border-b border-default">
    <div class="border-b border-default p-6 text-center lg:p-8">
      <span
        v-if="headline"
        class="section-label"
      >
        {{ headline }}
      </span>
      <h2 class="mt-4 text-2xl font-bold text-highlighted">
        {{ title }}
      </h2>
      <p class="mx-auto mt-3 max-w-lg text-base/7 text-muted">
        {{ description }}
      </p>
    </div>

    <div class="bg-muted/50">
      <div class="flex items-center border-b border-default">
        <button
          class="flex items-center gap-2 border-b-2 px-5 py-2.5 font-mono text-sm"
          :class="activeTab === 'vue' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-highlighted'"
          @click="activeTab = 'vue'"
        >
          <UIcon
            name="i-logos-vue"
            class="size-4"
          />
          Vue
        </button>
        <button
          class="flex items-center gap-2 border-b-2 px-5 py-2.5 font-mono text-sm"
          :class="activeTab === 'react' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-highlighted'"
          @click="activeTab = 'react'"
        >
          <UIcon
            name="i-logos-react"
            class="size-4"
          />
          React
        </button>
      </div>

      <div class="max-h-[360px] overflow-auto p-4 sm:p-6 lg:p-8">
        <div
          v-show="activeTab === 'vue'"
          class="font-mono text-sm/7 whitespace-pre-wrap text-default"
        >
          <ComarkDocs :components="{ ProsePre: ProsePreRaw }">
            {{ '```vue\n' + vueCode + '\n```' }}
          </ComarkDocs>
        </div>
        <div
          v-show="activeTab === 'react'"
          class="font-mono text-sm/7 whitespace-pre-wrap text-default"
        >
          <ComarkDocs :components="{ ProsePre: ProsePreRaw }">
            {{ '```tsx\n' + reactCode + '\n```' }}
          </ComarkDocs>
        </div>
      </div>
    </div>
  </div>
</template>
