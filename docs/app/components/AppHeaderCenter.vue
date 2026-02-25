<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const links = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Documentation',
    to: '/getting-started/introduction',
    active: ['getting-started', 'syntax', 'rendering', 'api', 'integrations'].includes(route.path?.split('/')[1] || ''),
  },
  {
    label: 'Plugins',
    to: '/plugins',
    active: route.path.startsWith('/plugins'),
  },
  {
    label: 'Examples',
    to: '/examples',
    active: route.path.startsWith('/examples'),
  },
])
</script>

<template>
  <UNavigationMenu
    :items="links"
    variant="link"
    :ui="{ list: 'gap-x-2' }"
  />
</template>
