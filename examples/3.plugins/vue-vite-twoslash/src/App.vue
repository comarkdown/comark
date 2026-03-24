<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue'
import { content } from './content'
import { Comark } from '@comark/vue'
import highlight from '@comark/vue/plugins/highlight'
import { createTransformerFactory, rendererRich } from '@shikijs/twoslash/core'
import { createTwoslashFromCDN } from 'twoslash-cdn'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'
import '@shikijs/twoslash/style-rich.css'
import type { ComarkPlugin } from 'comark'

const isDark = ref(false)
// plugins start null — Comark renders only once they're ready
const plugins = shallowRef<ComarkPlugin[] | null>(null)

onMounted(async () => {
  isDark.value = document.body.classList.contains('dark')

  // createTwoslashFromCDN fetches TypeScript lib files from CDN instead of the
  // local filesystem, making twoslash work in the browser.
  const twoslash = createTwoslashFromCDN()
  await twoslash.init()

  const transformer = createTransformerFactory(twoslash.runSync)({
    renderer: rendererRich(),
  })

  plugins.value = [
    highlight({
      themes: { light: githubLight, dark: githubDark },
      transformers: [transformer],
    }),
  ]
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

    <p
      v-if="!plugins"
      class="loading"
    >
      Loading TypeScript types…
    </p>

    <Suspense v-else>
      <Comark :plugins="plugins">
        {{ content }}
      </Comark>
    </Suspense>
  </div>
</template>

<style>
.shiki .line {
  display: block;
}
.shiki .line:empty {
  height: 1lh;
}
.dark .shiki span {
  color: var(--shiki-dark) !important;
}

/* Twoslash popup theming */
.dark .twoslash-popup-container {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}
.dark .twoslash-popup-code {
  background: #2a2a2a;
}
.dark .twoslash-popup-code span {
  color: var(--shiki-dark) !important;
}
</style>
