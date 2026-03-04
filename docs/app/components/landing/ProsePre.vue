<script setup lang="ts">
import { textContent } from 'comark/ast'

const props = withDefaults(defineProps<{
  __node: any
  language?: string
  theme?: string
  filename?: string
  containerClass?: string
  fallbackClass?: string
  fallbackWithHeaderClass?: string
  shikiStyle?: Record<string, string>
}>(), {
  theme: 'github-dark',
  containerClass: 'my-4',
  fallbackClass: 'bg-elevated text-default p-4 rounded-lg overflow-x-auto border border-accented',
})

const componentKey = ref(0)
const copied = ref(false)
const codeContent = ref('')

function extractCodeFromNode() {
  codeContent.value = props.__node ? textContent(props.__node) : ''
}

extractCodeFromNode()

watch(() => props.__node, () => {
  extractCodeFromNode()
  componentKey.value++
})

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
  <div :class="`relative ${containerClass} group rounded-lg`">
    <div class="flex items-center justify-between rounded-t-lg border border-b-0 border-accented px-4 py-2">
      <span class="rounded bg-accented/80 px-2.5 py-1 font-mono text-sm font-semibold tracking-wider text-toned backdrop-blur-sm">
        {{ filename || language }}
      </span>

      <button
        type="button"
        class="ml-auto rounded px-3 py-1.5 text-xs font-medium text-default backdrop-blur-sm transition-all duration-200 bg-accented/80 hover:bg-accented hover:text-highlighted focus:outline-none focus:ring-2 focus:ring-primary"
        @click="copyCode"
      >
        <span class="flex items-center gap-1.5">
          <UIcon
            :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            class="size-4"
          />
          {{ copied ? 'Copied!' : 'Copy' }}
        </span>
      </button>
    </div>

    <pre class="shiki-container mt-0 overflow-x-auto rounded-b-lg rounded-t-none border border-accented bg-elevated p-4"><slot /></pre>
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
