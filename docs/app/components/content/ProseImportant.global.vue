<template>
  <ProseCallout
    icon="i-lucide-message-square-warning"
    class="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-violet-300 [&_a]:text-violet-700 dark:[&_a]:text-violet-300"
    :ui="{ icon: 'text-violet-700 dark:text-violet-300' }"
  >
    <slot />
  </ProseCallout>
</template>
