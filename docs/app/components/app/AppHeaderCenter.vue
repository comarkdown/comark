<script setup lang="ts">
const navigation = useMainNavigation()
</script>

<template>
  <UNavigationMenu
    :items="navigation.map(({ icon, ...item }) => item)"
    color="neutral"
    variant="link"
    :highlight="false"
    :ui="{ list: '', link: 'font-normal', childLink: 'py-1', content: 'w-fit', childList: 'p-1' }"
    content-orientation="vertical"
  />
</template>
