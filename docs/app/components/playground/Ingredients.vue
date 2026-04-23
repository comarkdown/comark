<script setup lang="ts">
const props = defineProps<{
  title?: string
  servings?: number
  items?: Array<{ image: string; quantity: string; name: string }>
}>()

const count = ref(props.servings ?? 4)
</script>

<template>
  <div class="not-prose my-6">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold [&>p]:m-0">
        <slot name="title">
          {{ title }}
        </slot>
      </h2>
      <div class="flex items-center gap-2 text-sm">
        <button
          class="flex size-7 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
          @click="count = Math.max(1, count - 1)"
        >
          −
        </button>
        <span class="min-w-24 text-center font-medium">{{ count }} servings</span>
        <button
          class="flex size-7 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
          @click="count++"
        >
          +
        </button>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
      <div
        v-for="item in items"
        :key="item.name"
        class="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 p-2.5 text-center dark:border-neutral-700"
      >
        <img
          :src="item.image"
          :alt="item.name"
          class="size-16 rounded-lg object-cover"
        />
        <p class="text-xs font-semibold leading-tight">
          {{ item.quantity }}
        </p>
        <p class="text-xs leading-tight text-neutral-500 dark:text-neutral-400">
          {{ item.name }}
        </p>
      </div>
    </div>
  </div>
</template>
