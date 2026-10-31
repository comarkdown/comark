<script setup lang="ts">
defineProps<{
  label?: string
  title?: string
}>()
</script>

<template>
  <div class="my-4 rounded-xl border border-default px-5 py-4">
    <p
      v-if="label"
      class="m-0 text-xs font-medium tracking-wide text-muted uppercase"
    >
      {{ label }}
    </p>
    <p
      v-if="title"
      class="mt-1 mb-0 text-lg font-semibold text-highlighted"
    >
      {{ title }}
    </p>
    <div class="text-sm [&_ul]:my-2">
      <slot />
    </div>
  </div>
</template>
