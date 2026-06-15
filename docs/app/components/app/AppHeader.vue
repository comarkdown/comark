<script setup lang="ts">
const appConfig = useAppConfig()
const { forced: forcedColorMode } = useDocusColorMode()

const { isEnabled: isAssistantEnabled } = useAssistant()
const { isEnabled, locales } = useDocusI18n()
const { subNavigationMode } = useSubNavigation()

const links = computed(() => appConfig.github && appConfig.github.url
  ? [
      {
        'icon': 'i-simple-icons-github',
        'to': appConfig.github.url,
        'target': '_blank',
        'aria-label': 'GitHub',
      },
    ]
  : [])
</script>

<template>
  <UHeader
    :ui="{ left: 'lg:flex-none', right: 'gap-2.5', body: 'sm:p-4' }"
  >
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

    <template
      v-if="subNavigationMode === 'header'"
      #bottom
    >
      <AppHeaderBottom />
    </template>
  </UHeader>
</template>
