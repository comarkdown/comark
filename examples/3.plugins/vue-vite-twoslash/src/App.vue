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
import { useColorMode } from '@vueuse/core'
import type { ComarkPlugin } from 'comark'

const colorMode = useColorMode()
const plugins = shallowRef<ComarkPlugin[] | null>(null)
const loading = ref(true)

onMounted(async () => {
  const twoslash = createTwoslashFromCDN()
  await twoslash.init()

  const transformer = createTransformerFactory(twoslash.runSync)({
    explicitTrigger: true,
    renderer: rendererRich(),
  })

  plugins.value = [
    highlight({
      themes: { light: githubLight, dark: githubDark },
      transformers: [transformer],
    }),
  ]
  loading.value = false
})
</script>

<template>
  <UApp>
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-default bg-default/80 backdrop-blur">
      <UContainer class="flex h-14 items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base font-bold tracking-tight text-highlighted">Comark</span>
          <span class="text-muted font-light">·</span>
          <UBadge
            color="primary"
            variant="subtle"
            size="sm"
          >
            Twoslash
          </UBadge>
        </div>

        <UTooltip :text="colorMode === 'dark' ? 'Light mode' : 'Dark mode'">
          <UButton
            :icon="colorMode === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            color="neutral"
            variant="ghost"
            size="md"
            @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
          />
        </UTooltip>
      </UContainer>
    </header>

    <!-- Page -->
    <main class="py-12 px-4">
      <UContainer class="max-w-3xl">
        <!-- Loading -->
        <template v-if="loading">
          <div class="mb-12 space-y-3">
            <USkeleton class="h-9 w-1/2 rounded-lg" />
            <USkeleton class="h-4 w-4/5 rounded" />
            <USkeleton class="h-4 w-3/5 rounded" />
          </div>
          <div class="mb-8 space-y-3">
            <USkeleton class="h-5 w-1/3 rounded-md" />
            <USkeleton class="h-36 w-full rounded-xl" />
          </div>
          <div class="mb-8 space-y-3">
            <USkeleton class="h-5 w-1/3 rounded-md" />
            <USkeleton class="h-36 w-full rounded-xl" />
          </div>
          <div class="mt-8 flex items-center gap-2 text-sm text-muted">
            <UIcon
              name="i-lucide-loader-circle"
              class="animate-spin"
            />
            Loading TypeScript types from CDN…
          </div>
        </template>

        <!-- Content -->
        <Suspense v-else>
          <Comark
            class="prose"
            :plugins="plugins!"
          >
            {{ content }}
          </Comark>
        </Suspense>
      </UContainer>
    </main>
  </UApp>
</template>

<style>
/* ─── Prose ────────────────────────────────────────────────── */
/* Inline code */
.prose :not(pre) > code {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.825em;
  background: var(--ui-bg);
  color: var(--ui-primary);
  border: 1px solid var(--ui-border);
  border-radius: 0.3rem;
  padding: 0.15em 0.4em;
}

/* Code blocks */
.prose pre.shiki {
  margin: 0.75rem 0 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--ui-border);
  overflow: visible;
  line-height: 1.65;
  font-size: 0.88rem;
}
.prose .shiki .line {
  display: block;
}
.prose .shiki .line:empty {
  height: 1lh;
}
.dark .prose pre.shiki span {
  color: var(--shiki-dark) !important;
}

/* Twoslash popup */
.prose .twoslash-popup-container {
  width: max-content;
}
.prose pre .twoslash-hover pre {
  margin: 0;
  padding: 0;
  background: transparent !important;
  border: none;
}
.prose pre .twoslash-hover pre .line {
  display: inline;
}
.dark .twoslash-popup-container {
  background: var(--ui-bg-elevated) !important;
  border-color: var(--ui-border) !important;
}
.dark .twoslash-popup-code span {
  color: var(--shiki-dark) !important;
}
.dark .twoslash .twoslash-popup-arrow {
  background: var(--ui-bg) !important;
}
</style>
