<script setup lang="ts">
const navigation = useMainNavigation()
</script>

<template>
  <UNavigationMenu
    variant="pill"
    :items="navigation"
    orientation="vertical"
  />
</template>
