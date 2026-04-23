<script setup lang="ts">
defineProps<{
  name: string
  badge?: string
  duration?: string
}>()
</script>

<template>
  <div class="not-prose flex items-center gap-3 py-5">
    <div
      class="flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-200 to-primary-400 text-sm font-semibold text-white dark:from-primary-700 dark:to-primary-500"
    >
      {{ name[0] }}
    </div>
    <div>
      <p class="text-sm font-semibold text-highlighted">Hosted by {{ name }}</p>
      <p class="text-xs text-muted">
        <span v-if="badge">{{ badge }}</span>
        <span
          v-if="badge && duration"
          class="mx-1"
          >·</span
        >
        <span v-if="duration">{{ duration }}</span>
      </p>
    </div>
  </div>
</template>
