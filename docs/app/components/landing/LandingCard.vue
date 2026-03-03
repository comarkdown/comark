<script setup lang="ts">
const props = defineProps<{
  icon?: string
  color?: 'primary' | 'purple' | 'green' | 'neutral' | 'red' | 'yellow' | 'blue' | 'orange' | 'pink' | 'teal' | 'cyan'
}>()

const colorMap = {
  primary: { bg: 'bg-primary-500/10', text: 'text-primary-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  green: { bg: 'bg-green-500/10', text: 'text-green-500' },
  neutral: { bg: 'bg-neutral-500/10', text: 'text-neutral-500' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-500' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
}

const colors = computed(() => colorMap[props.color ?? 'primary'])
</script>

<template>
  <UCard class="text-center">
    <div
      v-if="icon"
      class="mb-3 flex justify-center"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-lg"
        :class="colors.bg"
      >
        <UIcon
          :name="icon"
          class="h-6 w-6"
          :class="colors.text"
        />
      </div>
    </div>
    <h3 class="mb-2 font-semibold text-neutral-900 dark:text-white">
      <slot
        name="title"
        mdc-unwrap="p"
      />
    </h3>
    <p class="text-sm text-neutral-600 dark:text-neutral-400">
      <slot
        name="description"
        mdc-unwrap="p"
      />
    </p>
  </UCard>
</template>
