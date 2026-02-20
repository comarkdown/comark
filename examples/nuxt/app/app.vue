<script setup lang="ts">
const markdown = `
# Comark + Nuxt

Comark Syntax automatically detects Components in \`~/components/prose/\` directory and uses them for rendering.
`
</script>

<template>
  <Comark>{{ markdown }}</Comark>
</template>
