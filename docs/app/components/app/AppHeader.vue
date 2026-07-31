<script setup lang="ts">
const { isEnabled: isAssistantEnabled } = useAssistant()
</script>

<template>
  <UHeader :ui="{ left: 'lg:flex-none', right: 'gap-2.5', body: 'sm:p-4' }">
    <AppHeaderCenter />

    <template #left>
      <AppHeaderLeft />
    </template>

    <template #right>
      <UContentSearchButton
        :collapsed="false"
        class="text-muted font-normal hidden lg:inline-flex min-w-[150px]"
        :ui="{
          leadingIcon: 'hidden',
        }"
      />

      <template v-if="isAssistantEnabled">
        <AssistantChat />
      </template>
    </template>

    <template #toggle="{ open, toggle }">
      <IconMenuToggle
        :open="open"
        variant="outline"
        class="lg:hidden rounded-full"
        @click="toggle"
      />
    </template>

    <template #body>
      <AppHeaderBody />
    </template>
  </UHeader>
</template>
