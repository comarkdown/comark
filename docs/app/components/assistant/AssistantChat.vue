<script setup lang="ts">
const appConfig = useAppConfig()
const { toggle, isOpen } = useAssistant()
const { t } = useDocusI18n()

const tooltipText = computed(() => t('assistant.tooltip'))
</script>

<template>
  <UTooltip
    v-if="!isOpen"
    :text="tooltipText"
  >
    <UButton
      color="neutral"
      variant="outline"
      label="Ask AI"
      @click="toggle"
    />
  </UTooltip>
</template>
