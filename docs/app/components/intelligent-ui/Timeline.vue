<script setup lang="ts">
interface Step {
  time?: string
  title?: string
  detail?: string
}

const props = defineProps<{ title?: string; items?: Step[] }>()

// Ticked steps are user state, keyed by position so a growing `items` prop keeps them.
const done = ref(new Set<number>())
const steps = computed(() => (props.items ?? []).filter((step) => step.title))

function toggle(index: number) {
  const next = new Set(done.value)
  if (!next.delete(index)) next.add(index)
  done.value = next
}
</script>

<template>
  <div class="not-prose my-4 rounded-xl border border-default">
    <div class="flex items-center justify-between border-b border-default px-5 py-3">
      <p class="text-sm font-semibold text-highlighted">
        {{ title ?? 'Checklist' }}
      </p>
      <p class="text-xs text-muted tabular-nums">{{ done.size }} of {{ steps.length }}</p>
    </div>
    <ol class="divide-y divide-default">
      <li
        v-for="(step, index) in steps"
        :key="index"
      >
        <button
          type="button"
          class="flex w-full gap-3 px-5 py-3 text-left transition-colors hover:bg-elevated/50"
          :aria-pressed="done.has(index)"
          @click="toggle(index)"
        >
          <UIcon
            :name="done.has(index) ? 'i-lucide-circle-check' : 'i-lucide-circle'"
            class="mt-0.5 size-5 shrink-0"
            :class="done.has(index) ? 'text-primary' : 'text-dimmed'"
          />
          <span
            class="min-w-0"
            :class="done.has(index) ? 'text-dimmed line-through' : ''"
          >
            <span class="block text-xs text-muted">{{ step.time }}</span>
            <span
              class="block font-semibold"
              :class="done.has(index) ? '' : 'text-highlighted'"
              >{{ step.title }}</span
            >
            <span class="mt-0.5 block text-sm text-muted">{{ step.detail }}</span>
          </span>
        </button>
      </li>
    </ol>
  </div>
</template>
