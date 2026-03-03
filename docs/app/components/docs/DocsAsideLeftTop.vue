<script setup lang="ts">
const route = useRoute()

const links = computed(() => [
  {
    label: 'Documentation',
    icon: 'i-lucide-book-open',
    to: '/getting-started/introduction',
    active: ['getting-started', 'syntax', 'rendering', 'api', 'integrations'].includes(route.path?.split('/')[1] || ''),
  },
  {
    label: 'Plugins',
    icon: 'i-lucide-plug',
    to: '/plugins',
    active: route.path.startsWith('/plugins'),
  },
  {
    label: 'Examples',
    icon: 'i-lucide-layout-panel-left',
    to: '/examples',
    active: route.path.startsWith('/examples'),
  },
])
</script>

<template>
  <div class="mb-2">
    <UPageAnchors :links="links" />
    <USeparator
      type="dashed"
      class="my-4"
    />
  </div>
</template>
