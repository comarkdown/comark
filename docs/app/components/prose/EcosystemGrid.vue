<script setup lang="ts">
// Plain CSS grid, no card-group defaults: ecosystem cards need a tighter gap than prose card-group.
// MDC `{cols="2"}` attribute syntax always yields a string, so accept both and coerce.
const props = withDefaults(
  defineProps<{
    cols?: 2 | 3 | '2' | '3'
  }>(),
  {
    cols: 3,
  }
)

const twoCol = computed(() => Number(props.cols) === 2)
</script>

<template>
  <div
    class="my-6 grid grid-cols-1 gap-4"
    :class="twoCol ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'"
  >
    <slot />
  </div>
</template>
