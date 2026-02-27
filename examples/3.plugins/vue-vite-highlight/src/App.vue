<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { content } from './content'
import { Comark } from 'comark/vue'
import highlight from 'comark/plugins/highlight'

// Import themes and languages directly
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
import vue from '@shikijs/langs/vue'
import tsx from '@shikijs/langs/tsx'
import python from '@shikijs/langs/python'
import rust from '@shikijs/langs/rust'
import go from '@shikijs/langs/go'
import sql from '@shikijs/langs/sql'
import css from '@shikijs/langs/css'
import json from '@shikijs/langs/json'
import bash from '@shikijs/langs/bash'
import markdown from '@shikijs/langs/markdown'

// Theme toggle
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
      <Comark
        :plugins="[
          highlight({
            themes: {
              light: githubLight,
              dark: githubDark,
            },
            languages: [
              javascript,
              typescript,
              vue,
              tsx,
              python,
              rust,
              go,
              sql,
              css,
              json,
              bash,
              markdown,
            ],
          }),
        ]"
      >
        {{ content }}
      </Comark>
    </Suspense>
  </div>
</template>

<style>
.dark .shiki span {
  color: var(--shiki-dark) !important;
}
</style>
