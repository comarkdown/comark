<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { content } from './content'
import { Markdown } from '@comark/vue'
import speedHighlight from '@comark/vue/plugins/speed-highlight'

// Official speed-highlight CSS themes (class-based tokens)
import lightThemeUrl from '@speed-highlight/core/themes/github-light.css?url'
import darkThemeUrl from '@speed-highlight/core/themes/github-dark.css?url'

const isDark = ref(false)
const themeLink = ref<HTMLLinkElement | null>(null)

function applyTheme(dark: boolean) {
  if (!themeLink.value) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.id = 'shj-theme'
    document.head.appendChild(link)
    themeLink.value = link
  }
  themeLink.value.href = dark ? darkThemeUrl : lightThemeUrl
  document.body.classList.toggle('dark', dark)
}

onMounted(() => {
  isDark.value = document.body.classList.contains('dark')
  applyTheme(isDark.value)
})

watch(isDark, (dark) => applyTheme(dark))

function toggleTheme() {
  isDark.value = !isDark.value
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
      <Markdown :plugins="[speedHighlight()]">
        {{ content }}
      </Markdown>
    </Suspense>
  </div>
</template>

<style>
/* Layout polish on top of the official shj theme sheets */
pre.shj {
  padding: 1rem !important;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
  font-size: 0.9rem !important;
  line-height: 1.5 !important;
  box-shadow: none !important;
}

.shj .line {
  display: block;
}

.shj .line:empty {
  height: 1lh;
}

.shj .line.highlight {
  background-color: rgba(255, 200, 0, 0.12);
  display: block;
  margin: 0 -1rem;
  padding: 0 1rem;
}

body.dark .shj .line.highlight {
  background-color: rgba(255, 255, 0, 0.1);
}
</style>
