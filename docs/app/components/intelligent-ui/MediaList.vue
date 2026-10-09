<script setup lang="ts">
defineProps<{
  items?: { image?: string; title?: string; description?: string }[]
}>()
</script>

<template>
  <ul class="not-prose my-4 divide-y divide-default">
    <li
      v-for="(item, index) in items"
      :key="index"
      class="flex gap-4 py-3"
    >
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.title ?? ''"
        class="size-16 shrink-0 rounded-lg bg-elevated object-cover"
      />
      <div class="min-w-0">
        <p class="font-semibold text-highlighted">
          {{ item.title }}
        </p>
        <p class="mt-0.5 text-sm text-muted">
          {{ item.description }}
        </p>
      </div>
    </li>
  </ul>
</template>
