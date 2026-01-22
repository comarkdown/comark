<script setup lang="ts">
const props = defineProps<{
  name: string
}>()

const nameToRender = computed(() => props.name.toUpperCase())
</script>

<template>
  <div>
    <h1>Required Prop Test</h1>
    <p>{{ nameToRender }}</p>
  </div>
</template>
