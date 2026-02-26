<script setup lang="ts">
const markdown = `
# Comark + Nuxt UI

Comark Syntax automatically detects Nuxt UI and uses its components for rendering.

::callout{icon="i-lucide-square-play" color="neutral" to="/docs/getting-started/installation/nuxt"}
This is a \`callout\` with full **markdown** support.
::
`
</script>

<template>
  <Comark>{{ markdown }}</Comark>
</template>
