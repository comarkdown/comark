<script setup lang="ts">
definePageMeta({
  footer: false,
})
const title = 'Playground - Comark'
const description =
  'Try Comark live in the browser. Edit markdown with component syntax and see the rendered output in real-time.'
useSeoMeta({
  title,
  description,
})
defineOgImage('OgImageDocs', {
  headline: 'Playground',
  title,
  description,
})
</script>

<template>
  <ClientOnly>
    <Playground />

    <template #fallback>
      <div class="h-[calc(100vh-64px)] overflow-hidden">
        <div class="grid h-full grid-cols-2 divide-x divide-default">
          <div class="flex h-full flex-col">
            <div class="h-9 border-b border-default bg-default px-3" />
            <div class="flex-1 p-4">
              <USkeleton class="h-full w-full" />
            </div>
          </div>

          <div class="flex h-full flex-col">
            <div class="h-9 border-b border-default bg-default px-3" />
            <div class="flex-1 p-4 space-y-4">
              <USkeleton class="h-6 w-32" />
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-5/6" />
              <USkeleton class="h-4 w-4/6" />
              <USkeleton class="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>
