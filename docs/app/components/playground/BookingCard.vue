<script setup lang="ts">
interface DateValue {
  year: number
  month: number
  day: number
}
interface DateRange {
  start: DateValue
  end: DateValue
}

defineProps<{
  title: string
  cta: string
}>()

const dateRange = ref<DateRange | null>(null)
const guests = ref(1)

function formatDate(date: DateValue | undefined) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(date.year, date.month - 1, date.day)
  )
}

const checkIn = computed(() => formatDate(dateRange.value?.start))
const checkOut = computed(() => formatDate(dateRange.value?.end))
const guestLabel = computed(() => `${guests.value} guest${guests.value > 1 ? 's' : ''}`)
</script>

<template>
  <div class="not-prose rounded-xl border border-muted p-5 shadow-lg">
    <p class="mb-4 text-base font-semibold text-highlighted">
      {{ title }}
    </p>

    <div class="mb-3 overflow-hidden rounded-lg border border-muted">
      <UPopover :ui="{ content: 'p-0' }">
        <div class="grid cursor-pointer grid-cols-2 divide-x divide-muted transition-colors hover:bg-muted/30">
          <div class="p-3">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-muted">Check-in</p>
            <p
              class="text-sm"
              :class="checkIn ? 'text-highlighted' : 'text-dimmed'"
            >
              {{ checkIn ?? 'Add date' }}
            </p>
          </div>
          <div class="p-3">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-muted">Checkout</p>
            <p
              class="text-sm"
              :class="checkOut ? 'text-highlighted' : 'text-dimmed'"
            >
              {{ checkOut ?? 'Add date' }}
            </p>
          </div>
        </div>
        <template #content>
          <UCalendar
            v-model="dateRange"
            range
            class="p-3"
          />
        </template>
      </UPopover>

      <UPopover :ui="{ content: 'p-4 w-64' }">
        <div
          class="flex cursor-pointer items-center justify-between border-t border-muted p-3 transition-colors hover:bg-muted/30"
        >
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-wider text-muted">Guests</p>
            <p class="text-sm text-highlighted">
              {{ guestLabel }}
            </p>
          </div>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 text-muted"
          />
        </div>
        <template #content>
          <p class="mb-3 text-sm font-semibold text-highlighted">Guests</p>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Number of guests</span>
            <div class="flex items-center gap-3">
              <button
                class="flex size-7 items-center justify-center rounded-full border border-muted text-muted transition-colors hover:border-highlighted hover:text-highlighted disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="guests <= 1"
                @click="guests = Math.max(1, guests - 1)"
              >
                −
              </button>
              <span class="w-4 text-center text-sm font-medium text-highlighted">{{ guests }}</span>
              <button
                class="flex size-7 items-center justify-center rounded-full border border-muted text-muted transition-colors hover:border-highlighted hover:text-highlighted disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="guests >= 4"
                @click="guests = Math.min(4, guests + 1)"
              >
                +
              </button>
            </div>
          </div>
        </template>
      </UPopover>
    </div>

    <UButton
      block
      color="primary"
      :label="cta"
    />

    <p class="mt-3 text-center text-xs text-muted">You won't be charged yet</p>
  </div>
</template>
