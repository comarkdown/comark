<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

interface Item {
  name?: string
  perGuest?: number
  unit?: string
}

const props = defineProps<{ guests?: number; items?: Item[] }>()

// Model values are untrusted: keep only positive, finite numbers.
const positive = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined

// After the user changes the count, new `guests` props from the stream don't override it.
const edited = ref<number>()
const count = computed(() => edited.value ?? positive(props.guests) ?? 4)

function format(item: Item): string {
  const total = item.perGuest! * count.value
  if (item.unit === 'g' && total >= 1000) return `${(total / 1000).toFixed(1)} kg`
  return `${Math.ceil(total)}${item.unit ? ` ${item.unit}` : ''}`
}

const rows = computed(() =>
  (props.items ?? [])
    .filter((item) => item.name && positive(item.perGuest))
    .map((item) => ({ name: item.name!, quantity: format(item) }))
)

const { copy, copied } = useClipboard({ copiedDuring: 1500 })

function copyList() {
  copy(rows.value.map((row) => `- ${row.name}: ${row.quantity}`).join('\n'))
}
</script>

<template>
  <div class="not-prose my-4 rounded-xl border border-default">
    <div class="flex flex-col items-center gap-1 border-b border-default px-5 py-4">
      <p class="text-xs font-medium tracking-wide text-muted uppercase">Number of people</p>
      <div class="flex items-center gap-6">
        <UButton
          icon="i-lucide-minus"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full"
          aria-label="Fewer people"
          :disabled="count <= 1"
          @click="edited = count - 1"
        />
        <div class="min-w-16 text-center">
          <p class="text-2xl font-semibold text-highlighted tabular-nums">
            {{ count }}
          </p>
          <p class="text-xs text-muted">People</p>
        </div>
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full"
          aria-label="More people"
          :disabled="count >= 20"
          @click="edited = count + 1"
        />
      </div>
    </div>

    <div class="px-5 py-4">
      <p class="mb-2 text-sm font-semibold text-highlighted">Your shopping quantities</p>
      <ul class="divide-y divide-default text-sm">
        <li
          v-for="row in rows"
          :key="row.name"
          class="flex justify-between gap-4 py-2"
        >
          <span>{{ row.name }}</span>
          <span class="font-semibold text-highlighted tabular-nums">{{ row.quantity }}</span>
        </li>
      </ul>
      <div class="mt-2 text-xs text-muted [&_p]:m-0">
        <slot />
      </div>
      <UButton
        :label="copied ? 'Copied' : 'Copy shopping list'"
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        color="neutral"
        variant="outline"
        size="sm"
        class="mt-3 rounded-full"
        :disabled="!rows.length"
        @click="copyList"
      />
    </div>
  </div>
</template>
