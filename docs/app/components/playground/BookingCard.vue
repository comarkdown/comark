<script setup lang="ts">
defineProps<{
  title: string
  cta: string
}>()
</script>

<template>
  <div class="not-prose rounded-xl border border-muted p-5 shadow-lg">
    <p class="mb-4 text-base font-semibold text-highlighted">
      {{ title }}
    </p>

    <div class="mb-3 overflow-hidden rounded-lg border border-muted">
      <div class="grid grid-cols-2 divide-x divide-muted">
        <div class="p-3">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Check-in
          </p>
          <p class="text-sm text-dimmed">
            Add date
          </p>
        </div>
        <div class="p-3">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Checkout
          </p>
          <p class="text-sm text-dimmed">
            Add date
          </p>
        </div>
      </div>
      <div class="flex items-center justify-between border-t border-muted p-3">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Guests
          </p>
          <p class="text-sm text-highlighted">
            1 guest
          </p>
        </div>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-4 text-muted"
        />
      </div>
    </div>

    <UButton
      block
      color="primary"
      :label="cta"
    />

    <p class="mt-3 text-center text-xs text-muted">
      You won't be charged yet
    </p>
  </div>
</template>
