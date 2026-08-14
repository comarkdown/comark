<script setup lang="ts">
// Legacy URL: the editor now lives at /play. Preserve the ?example= query.
const route = useRoute()
const example = route.query.example === 'all-features' ? 'basic' : route.query.example
await navigateTo({ path: '/play', query: example ? { example } : undefined }, { redirectCode: 301 })
</script>

<template>
  <div />
</template>
