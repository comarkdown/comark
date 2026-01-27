<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { extractText as extractMDCText } from '../../../src/utils/tree'

// Import the Vue renderer from the parent project
const { useMDCStream } = await import('../../../src/vue/composables/useMDCStream')
const { MDCRenderer } = await import('../../../src/vue/components/MDCRenderer')
const resolveComponent = (await import('@/utils/components-manifest')).default

// Import ShikiCode for syntax highlighting
const ShikiCode = (await import('@/components/ShikiCode.vue')).default

const { state, startStream, isStreaming, reset: resetStream } = useMDCStream({
  onChunk: (chunk) => {
    console.log('Received chunk:', chunk.length, 'bytes')
  },
  onComplete: (result) => {
    console.log('Stream complete!', result)
  },
  onError: (error) => {
    console.error('Stream error:', error)
  },
})

const sampleMarkdown = `# MDC Streaming Demo

::required-prop-test
---
name: John Doe
---
::

::multi-slot-test
**This demo This demo This demo This demo This demo This demo This demo This demo This demo**
This demo shows **real-time rendering** with *auto-close* support!

#header
This is header part

#footer
Copyright by Nuxt
::


::alert{type="info"}
Watch how **bold text** and components render correctly even when syntax arrives in chunks.
::

::app-logo{width="200px" height="64px"}
::

## Features

- Auto-closes unclosed \`**bold**\` syntax
- Auto-closes unclosed \`::components\`
- Handles nested components gracefully

### Code Example

\`\`\`javascript
const greeting = 'Hello, World!'
console.log(greeting)

function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}
\`\`\`

::card
**Progressive rendering** means you see content *as it arrives*, not after everything is loaded.

  :::card
  This is perfect for:
  - AI chat responses
  - Large document loading
  - Real-time collaborative editing
  :::
::

| Name    | Age | City      |
|---------|-----|-----------|
| Alice   |  24 | New York  |
| Bob     |  30 | Paris     |
| Charlie |  28 | London    |


> Try different parsers and watch the AST update in real-time!
`

const bytesReceived = ref(0)
const elementsCount = computed(() => state.value.body?.value?.length ?? 0)
const outputColumn = ref<HTMLElement | null>(null)
const astColumn = ref<HTMLElement | null>(null)
const selectedParser = ref<'remark' | 'markdown-it'>('markdown-it')

function scrollToBottom() {
  nextTick(() => {
    if (outputColumn.value) {
      outputColumn.value.scrollTop = outputColumn.value.scrollHeight
    }
    if (astColumn.value) {
      astColumn.value.scrollTop = astColumn.value.scrollHeight
    }
  })
}

async function simulateStream() {
  resetStream()
  bytesReceived.value = 0

  // Create chunks from the markdown
  const chunkSize = 10
  const chunks: string[] = []
  for (let i = 0; i < sampleMarkdown.length; i += chunkSize) {
    chunks.push(sampleMarkdown.slice(i, i + chunkSize))
  }

  // Create a web-compatible ReadableStream
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()
      for (const chunk of chunks) {
        bytesReceived.value += chunk.length
        controller.enqueue(encoder.encode(chunk))
        scrollToBottom()
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      controller.close()
    },
  })

  await startStream(stream, selectedParser.value === 'markdown-it')
  scrollToBottom()
}

function reset() {
  resetStream()
  bytesReceived.value = 0
}

// Custom components for demo
const customComponents = {
  h1: defineComponent({
    setup(props, { slots }) {
      return () => h('h1', {
        class: 'text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent',
        ...props,
      }, slots.default?.())
    },
  }),
  h2: defineComponent({
    setup(props, { slots }) {
      return () => h('h2', {
        class: 'text-3xl font-semibold mt-8 mb-3 text-gray-100',
        ...props,
      }, slots.default?.())
    },
  }),
  h3: defineComponent({
    setup(props, { slots }) {
      return () => h('h3', {
        class: 'text-2xl font-semibold mt-6 mb-2 text-gray-200',
        ...props,
      }, slots.default?.())
    },
  }),
  code: defineComponent({
    name: 'ProseCode',
    setup(props, { slots }) {
      return () => h('code', {
        class: 'bg-gray-800 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700',
        ...props,
      }, slots.default?.())
    },
  }),
  pre: defineComponent({
    setup(props: any, { slots }) {
      return () => {
        // Extract code content and language from the code element child
        const codeSlot = slots.default?.()
        if (!codeSlot || !Array.isArray(codeSlot)) {
          return h('pre', {
            class: 'bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700',
            ...props,
          }, codeSlot)
        }

        // Find the code element
        const codeElement = codeSlot.find((node: any) => node.type?.name === 'code' || node.type === 'code')
        if (!codeElement) {
          return h('pre', {
            class: 'bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto my-4 border border-gray-700',
            ...props,
          }, codeSlot)
        }

        // Extract text content from code element
        let codeContent = ''
        let language = 'text'

        // Get language from class (e.g., "language-javascript")
        if (codeElement.props?.class) {
          const match = codeElement.props.class.match(/language-(\w+)/)
          if (match) {
            language = match[1]
          }
        }

        // Extract text content
        const extractText = (node: any): string => {
          if (node?.props?.__node) {
            return extractMDCText(node.props?.__node)
          }
          if (typeof node === 'string')
            return node
          if (node.children) {
            if (typeof node.children === 'string')
              return node.children
            if (Array.isArray(node.children)) {
              return node.children.map(extractText).join('')
            }
          }
          return ''
        }

        codeContent = extractText(codeElement)

        // Use ShikiCode for syntax highlighting
        return h(ShikiCode, {
          code: codeContent,
          lang: language,
        })
      }
    },
  }),
  blockquote: defineComponent({
    setup(props, { slots }) {
      return () => h('blockquote', {
        class: 'border-l-4 border-primary pl-4 italic my-4 text-gray-400',
        ...props,
      }, slots.default?.())
    },
  }),
  p: defineComponent({
    setup(props, { slots }) {
      return () => h('p', {
        class: 'my-4 text-gray-300 leading-relaxed',
        ...props,
      }, slots.default?.())
    },
  }),
  strong: defineComponent({
    setup(props, { slots }) {
      return () => h('strong', {
        class: 'text-amber-400 font-semibold',
        ...props,
      }, slots.default?.())
    },
  }),
  em: defineComponent({
    setup(props, { slots }) {
      return () => h('em', {
        class: 'text-purple-400',
        ...props,
      }, slots.default?.())
    },
  }),
  ul: defineComponent({
    setup(props, { slots }) {
      return () => h('ul', {
        class: 'list-disc list-inside my-4 text-gray-300',
        ...props,
      }, slots.default?.())
    },
  }),
  ol: defineComponent({
    setup(props, { slots }) {
      return () => h('ol', {
        class: 'list-decimal list-inside my-4 text-gray-300',
        ...props,
      }, slots.default?.())
    },
  }),
  li: defineComponent({
    setup(props, { slots }) {
      return () => h('li', {
        class: 'my-2',
        ...props,
      }, slots.default?.())
    },
  }),
  table: defineComponent({
    setup(props, { slots }) {
      return () => h('table', {
        class: 'w-full border-collapse my-4',
        ...props,
      }, slots.default?.())
    },
  }),
  thead: defineComponent({
    setup(props, { slots }) {
      return () => h('thead', props, slots.default?.())
    },
  }),
  tbody: defineComponent({
    setup(props, { slots }) {
      return () => h('tbody', props, slots.default?.())
    },
  }),
  tr: defineComponent({
    setup(props, { slots }) {
      return () => h('tr', props, slots.default?.())
    },
  }),
  th: defineComponent({
    setup(props, { slots }) {
      return () => h('th', {
        class: 'bg-gray-800 border border-gray-700 px-4 py-2 text-left font-semibold text-gray-100',
        ...props,
      }, slots.default?.())
    },
  }),
  td: defineComponent({
    setup(props, { slots }) {
      return () => h('td', {
        class: 'border border-gray-700 px-4 py-2 text-gray-300',
        ...props,
      }, slots.default?.())
    },
  }),
  hr: defineComponent({
    setup(props) {
      return () => h('hr', {
        class: 'my-8 border-gray-700',
        ...props,
      })
    },
  }),
  // MDC Components
  alert: defineComponent({
    setup(props: any, { slots }) {
      const typeColors = {
        info: 'border-blue-500 bg-blue-950/30 text-blue-200',
        warning: 'border-yellow-500 bg-yellow-950/30 text-yellow-200',
        error: 'border-red-500 bg-red-950/30 text-red-200',
        success: 'border-green-500 bg-green-950/30 text-green-200',
      }
      const colorClass = typeColors[props.type as keyof typeof typeColors] || typeColors.info
      return () => h('div', {
        class: `border-l-4 p-4 my-4 rounded ${colorClass}`,
        ...props,
      }, slots.default?.())
    },
  }),
  card: defineComponent({
    setup(props: any, { slots }) {
      return () => h('div', {
        class: 'border border-gray-700 bg-gray-800/50 rounded-lg p-4 my-4',
        ...props,
      }, [
        props.title && h('h3', { class: 'text-xl font-semibold mb-2 text-gray-100' }, props.title),
        h('div', {}, slots.default?.()),
      ])
    },
  }),
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-900 overflow-hidden">
    <!-- Compact Header -->
    <div class="flex-shrink-0 bg-gradient-to-r from-primary to-purple-600 p-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-white text-2xl font-bold mb-1">
            MDC Syntax Streaming Demo
          </h1>
          <p class="text-white/90 text-sm">
            Real-time markdown rendering with Vue 3
          </p>
        </div>
        <div class="flex gap-2 items-center">
          <div
            v-if="isStreaming || elementsCount > 0"
            class="text-right mr-4"
          >
            <div class="text-white text-xs opacity-90">
              {{ bytesReceived }} bytes · {{ elementsCount }} nodes
            </div>
            <div class="w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-2">
              <div
                class="h-full bg-white transition-all duration-300"
                :style="{ width: state.isComplete ? '100%' : '75%' }"
              />
            </div>
          </div>
          <USelectMenu
            v-model="selectedParser"
            :items="[
              { value: 'remark', label: 'Remark' },
              { value: 'markdown-it', label: 'Markdown-it' },
            ]"
            value-key="value"
            option-key="label"
            :disabled="isStreaming"
            size="sm"
            class="w-32"
          />
          <UButton
            :disabled="isStreaming"
            size="sm"
            :loading="isStreaming"
            @click="simulateStream"
          >
            {{ isStreaming ? 'Streaming...' : 'Start' }}
          </UButton>
          <UButton
            :disabled="isStreaming"
            color="neutral"
            variant="solid"
            size="sm"
            @click="reset"
          >
            Reset
          </UButton>
        </div>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="flex-1 grid grid-cols-2 overflow-hidden">
      <!-- Rendered Output Column -->
      <div class="flex flex-col overflow-hidden bg-gray-950">
        <div class="flex justify-between items-center px-4 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
          <div class="flex items-center gap-2">
            <h3 class="text-gray-200 font-semibold">
              Rendered Output
            </h3>
            <UBadge
              color="neutral"
              variant="soft"
              size="xs"
            >
              {{ selectedParser }}
            </UBadge>
          </div>
          <UBadge
            v-if="isStreaming"
            color="primary"
            variant="soft"
          >
            Live
          </UBadge>
        </div>
        <div
          ref="outputColumn"
          class="flex-1 overflow-y-auto p-4 scroll-smooth"
        >
          <MDCRenderer
            v-if="elementsCount > 0"
            :body="state.body as any"
            :components="customComponents"
            :components-manifest="resolveComponent"
          />
          <div
            v-else
            class="text-center text-gray-600 py-12"
          >
            Click "Start" to see the renderer in action
          </div>
        </div>
      </div>

      <!-- AST Structure Column -->
      <div class="flex flex-col overflow-hidden bg-gray-950 border-l border-gray-800">
        <div class="flex justify-between items-center px-4 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
          <h3 class="text-gray-200 font-semibold">
            AST Structure
          </h3>
          <UBadge
            color="neutral"
            variant="soft"
          >
            {{ elementsCount }} nodes
          </UBadge>
        </div>
        <div
          ref="astColumn"
          class="flex-1 overflow-y-auto p-4 scroll-smooth"
        >
          <pre
            v-if="elementsCount > 0"
            class="text-xs text-gray-400 leading-relaxed"
          >{{ JSON.stringify(state.body, null, 2) }}</pre>
          <div
            v-else
            class="text-center text-gray-600 py-12"
          >
            AST structure will appear here
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styles */
:deep(.overflow-y-auto::-webkit-scrollbar) {
  width: 8px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-track) {
  background: rgb(30 41 59);
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
  background: rgb(71 85 105);
  border-radius: 4px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
  background: rgb(100 116 139);
}
</style>
