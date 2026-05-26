<script setup lang="ts">
defineProps<{
  type?: 'info' | 'warning' | 'success' | 'error'
}>()

const colors: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
  warning:
    'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
  success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
  error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
}
</script>

<template>
  <div
    class="my-3 rounded-lg border p-4 text-sm"
    :class="colors[type ?? 'info']"
  >
    <slot />
  </div>
</template>
