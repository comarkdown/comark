<script setup lang="ts">
const { toggle } = useAssistant()
const { t } = useDocusI18n()

const tooltipText = computed(() => t('assistant.tooltip'))
</script>

<template>
  <UTooltip :text="tooltipText">
    <UButton
      color="neutral"
      variant="outline"
      label="Ask AI"
      @click="toggle"
    />
  </UTooltip>
</template>
