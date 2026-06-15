<script setup lang="ts">
const navigation = useMainNavigation()
</script>

<template>
  <div class="flex flex-col gap-4">
    <UContentSearchButton :collapsed="false" size="lg" class="text-muted font-normal" :ui="{ leadingIcon: 'hidden' }" />

    <UNavigationMenu
      :items="navigation"
      variant="pill"
      orientation="vertical"
    />
  </div>
</template>
