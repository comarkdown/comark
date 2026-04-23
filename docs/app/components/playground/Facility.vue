<script setup lang="ts">
defineProps<{
  icon: string
}>()
</script>

<template>
  <div class="not-prose flex items-start gap-4 py-3">
    <UIcon
      :name="icon"
      class="mt-0.5 size-6 shrink-0 text-highlighted"
    />
    <div>
      <div class="text-sm font-medium text-highlighted [&>p]:m-0">
        <slot name="title" />
      </div>
      <div class="text-sm text-muted [&>p]:m-0">
        <slot name="description" />
      </div>
    </div>
  </div>
</template>
