<script setup lang="ts">
const navigation = useMainNavigation()
</script>

<template>
  <UNavigationMenu
    :items="navigation.map(({ icon, ...item }) => item)"
    variant="link"
    :ui="{ list: 'gap-x-2', childLink: 'py-1', content: 'w-fit', childList: 'p-1' }"
    content-orientation="vertical"
  />
</template>
