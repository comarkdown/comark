<script setup lang="ts">
const props = defineProps<{
  value: string
}>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    /* clipboard API may fail silently */
  }
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <button
    class="group inline-flex items-center gap-2 rounded-lg border border-accented bg-default px-2.5 py-2 font-mono text-sm text-default shadow-xs transition-all hover:border-inverted/20 hover:shadow-md"
    @click="copy"
  >
    <span class="select-all">{{ value }}</span>
    <span class="relative size-4 shrink-0">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <UIcon
          v-if="copied"
          name="i-lucide-check"
          class="absolute inset-0 text-success"
        />
        <UIcon
          v-else
          name="i-lucide-copy"
          class="absolute inset-0 text-dimmed group-hover:text-muted"
        />
      </Transition>
    </span>
  </button>
</template>
