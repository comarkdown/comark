<script setup lang="ts">
definePageMeta({
  footer: false,
})
useSeoMeta({
  title: 'Playground - Comark',
  description: 'Try Comark live in the browser. Edit markdown with component syntax and see the rendered output in real-time.',
})
defineOgImageComponent('Docs', {
  headline: 'Playground',
})
</script>

<template>
  <Playground />
</template>
