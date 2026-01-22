<script setup lang="ts">
import { createHighlighter } from 'shiki'
import { ShikiCachedRenderer } from 'shiki-stream/vue'
import { onMounted, ref } from 'vue'

defineProps<{
  code: string
  lang?: string
  theme?: string
}>()

// Create highlighter instance
const highlighter = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    highlighter.value = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'vue', 'html', 'css', 'json', 'markdown', 'bash', 'shell', 'text'],
    })
  }
  catch (error) {
    console.error('Failed to create highlighter:', error)
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="code-wrapper">
    <div v-if="lang" class="language-label">
      {{ lang }}
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-skeleton">
      <div v-for="i in 3" :key="i" class="skeleton-line" />
    </div>

    <!-- Shiki renderer -->
    <ShikiCachedRenderer
      v-else-if="highlighter"
      :highlighter="highlighter"
      :code="code"
      :lang="lang || 'text'"
      :theme="theme || 'github-dark'"
    />

    <!-- Fallback -->
    <pre v-else class="code-block"><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-wrapper {
  position: relative;
  margin: 1rem 0;
}

.language-label {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.75rem;
  color: rgb(156, 163, 175);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  z-index: 10;
}

.loading-skeleton {
  background: rgb(31, 41, 55);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgb(55, 65, 81);
}

.skeleton-line {
  height: 1rem;
  background: rgb(55, 65, 81);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-line:last-child {
  margin-bottom: 0;
  width: 60%;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.code-block {
  background: rgb(31, 41, 55);
  color: rgb(229, 231, 235);
  padding: 1rem;
  padding-top: 2.5rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0;
  border: 1px solid rgb(55, 65, 81);
}

.code-block code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  display: block;
  white-space: pre;
}

/* Style shiki output */
:deep(.shiki) {
  margin: 0;
  padding: 1rem;
  padding-top: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(55, 65, 81);
  overflow-x: auto;
}

:deep(.shiki code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  display: block;
}

:deep(.shiki .line) {
  display: block;
  min-height: 1.5rem;
}
</style>
