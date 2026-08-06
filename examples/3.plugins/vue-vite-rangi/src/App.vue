<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { content } from './content'
import { Markdown } from '@comark/vue'
import rangi from '@comark/vue/plugins/rangi'
import { github } from 'rangi/themes'

const isDark = ref(false)

onMounted(() => {
  isDark.value = document.body.classList.contains('dark')
})

function toggleTheme() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark', isDark.value)
}
</script>

<template>
  <div>
    <button
      class="theme-toggle"
      @click="toggleTheme"
    >
      {{ isDark ? '☀️ Light' : '🌙 Dark' }}
    </button>

    <Suspense>
      <Markdown :plugins="[rangi({ theme: github, lineNumbers: true })]">
        {{ content }}
      </Markdown>
    </Suspense>
  </div>
</template>

<style>
pre.shj {
  padding: 1rem 1rem 1rem 0;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  counter-reset: line;
}

.shj .line {
  display: block;
  counter-increment: line;
  padding-right: 1rem;
}

.shj .line:empty {
  height: 1lh;
}

/* Line-number gutter */
.shj .line::before {
  content: counter(line);
  display: inline-block;
  width: 2.75rem;
  margin-right: 1rem;
  padding-right: 0.75rem;
  text-align: right;
  opacity: 0.45;
  user-select: none;
  color: inherit;
  border-right: 1px solid color-mix(in srgb, currentColor 15%, transparent);
}

.shj .line.highlight {
  background-color: rgba(255, 200, 0, 0.12);
}

body.dark .shj .line.highlight {
  background-color: rgba(255, 255, 0, 0.1);
}

/* Dual-theme: activate dark palette via CSS vars (same hook as Shiki) */
body.dark .shj span {
  color: var(--shiki-dark) !important;
}

body.dark pre.shj {
  background-color: var(--shiki-dark-bg) !important;
  color: var(--shiki-dark) !important;
}
</style>
