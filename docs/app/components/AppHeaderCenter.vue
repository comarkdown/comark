<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const links: NavigationMenuItem[] = [
  {
    label: 'Documentation',
    to: '/getting-started/introduction',
  },
  {
    label: 'Plugins',
    to: '/plugins',
  },
  {
    label: 'Examples',
    to: '/examples',
  },
]
</script>

<template>
  <UNavigationMenu
    :items="links"
    variant="link"
    :ui="{ list: 'gap-x-2' }"
  />
</template>
