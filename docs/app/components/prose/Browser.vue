<script setup lang="ts">
defineProps<{
  src: string
}>()
</script>

<template>
  <div class="border border-muted rounded-lg overflow-hidden my-6 not-prose">
    <div class="flex items-center gap-2 px-3 py-2 bg-elevated border-b border-muted">
      <div class="flex gap-1.5 mr-1">
        <span class="size-3 rounded-full bg-red-400/80" />
        <span class="size-3 rounded-full bg-yellow-400/80" />
        <span class="size-3 rounded-full bg-green-400/80" />
      </div>

      <div
        class="flex-1 flex items-center gap-1.5 bg-default rounded-md px-2 py-1.5 text-xs text-muted font-mono truncate border border-muted"
      >
        <UIcon
          name="i-lucide-lock"
          class="size-3.5 shrink-0 text-green-500 dark:text-green-400"
        />
        <span class="truncate select-all">{{ src }}</span>
      </div>

      <UButton
        icon="i-lucide-external-link"
        :to="src"
        target="_blank"
        size="xs"
        variant="ghost"
        color="neutral"
        aria-label="Open in new tab"
      />
    </div>

    <iframe
      :src="src"
      class="w-full border-0 bg-white aspect-9/16 sm:aspect-video"
      allow="clipboard-read; clipboard-write"
      loading="lazy"
    />
  </div>
</template>
