<script setup lang="ts">
defineProps<{
  images?: { src?: string; alt?: string }[]
}>()
</script>

<template>
  <div class="not-prose my-4 grid aspect-[16/9] grid-cols-[2fr_1fr] grid-rows-2 gap-1.5 overflow-hidden rounded-xl">
    <template
      v-for="(image, index) in (images ?? []).slice(0, 3)"
      :key="index"
    >
      <img
        v-if="image.src"
        :src="image.src"
        :alt="image.alt ?? ''"
        class="size-full bg-elevated object-cover"
        :class="index === 0 ? 'row-span-2' : ''"
      />
      <div
        v-else
        class="bg-elevated"
        :class="index === 0 ? 'row-span-2' : ''"
      />
    </template>
  </div>
</template>
