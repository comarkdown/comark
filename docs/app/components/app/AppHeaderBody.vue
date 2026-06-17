<script setup lang="ts">
const navigation = useMainNavigation()
</script>

<template>
  <div class="flex flex-col gap-4">
    <UContentSearchButton
      :collapsed="false"
      size="lg"
      class="text-muted font-normal"
      :ui="{ leadingIcon: 'hidden', trailing: 'absolute end-0' }"
    />

    <UNavigationMenu
      :items="navigation"
      variant="pill"
      orientation="vertical"
      :highlight="false"
    />
  </div>
</template>
