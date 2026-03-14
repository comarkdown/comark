<script setup lang="ts">
const filteredNavigation = useFilteredNavigation()
</script>

<template>
  <UContentNavigation
    highlight
    :navigation="filteredNavigation"
  />
</template>
