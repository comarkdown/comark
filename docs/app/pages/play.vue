<script setup lang="ts">
definePageMeta({
  footer: false,
})
const title = 'Playground - Comark'
const description = 'Try Comark live in the browser. Edit markdown with component syntax and see the rendered output in real-time.'
useSeoMeta({
  title,
  description,
})
defineOgImage('Docs', {
  headline: 'Playground',
  title,
  description,
})
</script>

<template>
  <Playground />
</template>
