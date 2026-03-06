<script setup lang="ts">
import { textContent } from 'comark/ast'

const props = withDefaults(defineProps<{
  __node: any
  language?: string
  filename?: string
  containerClass?: string
}>(), {
  containerClass: 'my-5',
})

const langToIcon: Record<string, string> = {
  ts: 'i-logos-typescript-icon',
  typescript: 'i-logos-typescript-icon',
  js: 'i-logos-javascript',
  javascript: 'i-logos-javascript',
  vue: 'i-logos-vue',
  react: 'i-logos-react',
  jsx: 'i-logos-react',
  tsx: 'i-logos-react',
  html: 'i-vscode-icons-file-type-html',
  css: 'i-logos-css-3',
  json: 'i-logos-json',
  bash: 'i-lucide-terminal',
  sh: 'i-lucide-terminal',
  shell: 'i-lucide-terminal',
}

const hasHeader = computed(() => !!props.filename || !!props.language)

const displayName = computed(() => props.filename || props.language || '')

const icon = computed(() => {
  const lang = props.language ?? ''
  if (langToIcon[lang]) return langToIcon[lang]
  if (props.filename) {
    const ext = props.filename.split('.').pop() ?? ''
    if (langToIcon[ext]) return langToIcon[ext]
  }
  return undefined
})

const copied = ref(false)
const codeContent = ref('')

function extractCodeFromNode() {
  codeContent.value = props.__node ? textContent(props.__node) : ''
}

extractCodeFromNode()

watch(() => props.__node, extractCodeFromNode)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(codeContent.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch { /* clipboard API may fail silently */ }
}
</script>

<template>
  <div :class="['relative group overflow-hidden', containerClass]">
    <div
      v-if="hasHeader"
      class="flex items-center gap-1.5 border border-b-0 border-muted bg-default rounded-t-md px-4 py-3"
    >
      <UIcon
        v-if="icon"
        :name="icon"
        class="size-4 shrink-0"
      />
      <span class="text-default text-sm font-mono">{{ displayName }}</span>
    </div>

    <UButton
      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      color="neutral"
      variant="outline"
      size="xs"
      :aria-label="copied ? 'Copied' : 'Copy code'"
      :class="['absolute z-10 lg:opacity-0 lg:group-hover:opacity-100 transition', hasHeader ? 'top-[11px] right-[11px]' : 'top-2.5 right-2.5']"
      @click="copyCode"
    />

    <pre :class="['shiki-container !m-0 font-mono text-sm border border-muted bg-muted overflow-x-auto px-4 py-3', hasHeader ? 'rounded-b-md rounded-t-none' : 'rounded-md']"><slot /></pre>
  </div>
</template>

<style scoped>
.shiki-container :deep(span.line) {
  display: inline-block;
}
html.dark .shiki-container:not(.shiki-stream) :deep(span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
