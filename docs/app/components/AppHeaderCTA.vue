<template>
  <UButton
    v-if="$route.path === '/'"
    label="Get Started"
    to="/getting-started/introduction"
    size="xs"
    color="neutral"
    variant="solid"
    trailing-icon="i-lucide-arrow-right"
    class="hidden lg:flex"
  />
  <UContentSearchButton class="hidden lg:inline-flex" />
</template>
