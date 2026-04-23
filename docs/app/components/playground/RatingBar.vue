<script setup lang="ts">
defineProps<{
  rating: string
  reviews: string | number
}>()
</script>

<template>
  <div class="not-prose my-4 flex items-center gap-5 rounded-xl border border-muted px-5 py-4">
    <div class="flex min-w-0 flex-1 items-start gap-3">
      <div class="flex shrink-0 -space-x-2">
        <div class="flex size-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
          <UIcon
            name="i-lucide-user"
            class="size-4 text-primary"
          />
        </div>
        <div class="flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary-100 dark:border-neutral-900 dark:bg-primary-900">
          <UIcon
            name="i-lucide-user"
            class="size-4 text-primary"
          />
        </div>
      </div>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-highlighted">
          Guest favorite
        </p>
        <p class="text-xs leading-snug text-muted">
          One of the most loved homes on Airbnb, according to guests
        </p>
      </div>
    </div>

    <div class="h-10 w-px shrink-0 bg-muted" />

    <div class="shrink-0 text-center">
      <p class="text-xl font-bold text-highlighted">
        {{ rating }}
      </p>
      <div class="mt-0.5 flex justify-center gap-0.5">
        <UIcon
          v-for="i in 5"
          :key="i"
          name="i-lucide-star"
          class="size-3 text-primary"
        />
      </div>
    </div>

    <div class="h-10 w-px shrink-0 bg-muted" />

    <div class="shrink-0 text-center">
      <p class="text-xl font-bold text-highlighted">
        {{ reviews }}
      </p>
      <p class="text-xs text-muted">
        Reviews
      </p>
    </div>
  </div>
</template>
