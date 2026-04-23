<script setup lang="ts">
import { content } from './content'
import { Comark } from '@comark/vue'
import jsonRender from '@comark/vue/plugins/json-render'
import highlight from '@comark/vue/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'
import { useColorMode } from '@vueuse/core'

const colorMode = useColorMode()

const plugins = [
  jsonRender(),
  highlight({
    themes: { light: githubLight, dark: githubDark },
  }),
]
</script>

<template>
  <UApp>
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-default bg-default/80 backdrop-blur">
      <UContainer class="flex h-14 items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base font-bold tracking-tight text-highlighted">Comark</span>
          <span class="text-muted font-light">&middot;</span>
          <UBadge
            color="primary"
            variant="subtle"
            size="sm"
          >
            JSON Render
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
        <Suspense>
          <Comark
            class="prose"
            :plugins="plugins"
          >
            {{ content }}
          </Comark>
        </Suspense>
      </UContainer>
    </main>
  </UApp>
</template>

<style>
.prose pre.shiki {
  margin: 0.75rem 0 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--ui-border);
  overflow: auto;
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
</style>
