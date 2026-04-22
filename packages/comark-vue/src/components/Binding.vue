<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number, Boolean, Object, Array],
    default: undefined,
  },
  defaultValue: {
    type: String,
    default: undefined,
  },
})

const rendered = computed(() => {
  if (props.value !== undefined && props.value !== null) {
    return typeof props.value === 'object' ? JSON.stringify(props.value) : String(props.value)
  }
  return props.defaultValue ?? ''
})
</script>

<template>
  {{ rendered }}
</template>
