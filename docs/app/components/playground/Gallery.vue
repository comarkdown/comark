<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

defineProps<{
  cover?: boolean
}>()

const zoomed = ref<string | null>(null)

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG') {
    e.stopPropagation()
    zoomed.value = (target as HTMLImageElement).src
  }
}

function close() {
  zoomed.value = null
}

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
})
</script>

<template>
  <div
    v-if="cover"
    class="not-prose relative mb-6 h-80 overflow-hidden rounded-xl [&>p]:m-0 [&>p]:h-full [&_img]:block [&_img]:size-full [&_img]:cursor-zoom-in [&_img]:object-cover"
    @click.capture="handleClick"
  >
    <slot />
  </div>

  <div
    v-else
    class="not-prose relative mb-6 grid h-72 grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-2 overflow-hidden rounded-xl"
    @click.capture="handleClick"
  >
    <div class="row-span-2 overflow-hidden [&_img]:block [&_img]:size-full [&_img]:cursor-zoom-in [&_img]:object-cover">
      <slot name="main" />
    </div>
    <div class="col-span-2 row-span-2 grid grid-cols-2 grid-rows-2 gap-2 *:overflow-hidden [&>p]:m-0 [&_img]:block [&_img]:size-full [&_img]:cursor-zoom-in [&_img]:object-cover">
      <slot name="thumbnails" />
    </div>
  </div>

  <Teleport to="body">
    <Transition name="gallery-fade">
      <div
        v-if="zoomed"
        class="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 backdrop-blur-sm"
        @click="close"
      >
        <img
          :src="zoomed"
          class="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        >
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity 0.2s ease;
}
.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0;
}
</style>
