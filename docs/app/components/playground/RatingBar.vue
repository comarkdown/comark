<script setup lang="ts">
const props = defineProps<{
  rating?: string
  reviews: string | number
}>()

const ratingNum = computed(() => Number.parseFloat(props.rating ?? '') || 0)
const fillPercent = computed(() => `${(ratingNum.value / 5) * 100}%`)
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
        <div
          class="flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary-100 dark:border-neutral-900 dark:bg-primary-900"
        >
          <UIcon
            name="i-lucide-user"
            class="size-4 text-primary"
          />
        </div>
      </div>
      <div class="min-w-0 [&>p]:m-0">
        <p class="text-sm font-semibold text-highlighted">
          <slot name="title" />
        </p>
        <p class="text-xs leading-snug text-muted">
          <slot name="description" />
        </p>
      </div>
    </div>

    <div class="h-10 w-px shrink-0 bg-muted" />

    <div class="shrink-0 text-center">
      <p class="text-xl font-bold text-highlighted">
        {{ ratingNum }}
      </p>
      <div class="relative mt-0.5 flex justify-center gap-0.5">
        <UIcon
          v-for="i in 5"
          :key="i"
          name="i-lucide-star"
          class="size-3 text-neutral-300 dark:text-neutral-600"
        />
        <div
          class="pointer-events-none absolute inset-0 flex gap-0.5 overflow-hidden"
          :style="{ width: fillPercent }"
        >
          <UIcon
            v-for="i in 5"
            :key="i"
            name="i-heroicons-star-20-solid"
            class="size-3 shrink-0 text-yellow-400"
          />
        </div>
      </div>
    </div>

    <div class="h-10 w-px shrink-0 bg-muted" />

    <div class="shrink-0 text-center">
      <p class="text-xl font-bold text-highlighted">
        {{ reviews }}
      </p>
      <p class="text-xs text-muted">Reviews</p>
    </div>
  </div>
</template>
