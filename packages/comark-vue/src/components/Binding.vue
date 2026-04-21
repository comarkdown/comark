<script setup lang="ts">
defineProps({
  value: {
    type: [String, Number, Boolean, Object],
    default: undefined,
  },
  defaultValue: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  ss{{ value || defaultValue }} dd
</template>
