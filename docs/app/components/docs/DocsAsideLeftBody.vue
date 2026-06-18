<script setup lang="ts">
const filteredNavigation = useFilteredNavigation()
</script>

<template>
  <UContentNavigation
    highlight
    :collapsible="false"
    :navigation="filteredNavigation"
  />
</template>
