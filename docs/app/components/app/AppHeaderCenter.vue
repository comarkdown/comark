<script setup lang="ts">
const navigation = useMainNavigation()
</script>

<template>
  <UNavigationMenu
    :items="navigation.map(({ icon, ...item }) => item)"
    variant="link"
    :ui="{ list: 'gap-x-2' }"
  />
</template>
