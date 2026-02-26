<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'info' | 'warning' | 'success' | 'danger'
}>(), {
  type: 'info',
})
</script>

<template>
  <div
    :class="['alert', `alert-${props.type}`]"
    role="alert"
  >
    <slot />
  </div>
</template>

<style scoped>
.alert {
  margin: 16px 0;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid;
  font-size: 14px;
  line-height: 1.6;
}

.alert-info {
  background-color: var(--vp-custom-block-info-bg);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-custom-block-info-text);
}

.alert-success {
  background-color: var(--vp-custom-block-tip-bg);
  border-color: var(--vp-c-green-1);
  color: var(--vp-custom-block-tip-text);
}

.alert-warning {
  background-color: var(--vp-custom-block-warning-bg);
  border-color: var(--vp-c-yellow-1);
  color: var(--vp-custom-block-warning-text);
}

.alert-danger {
  background-color: var(--vp-custom-block-danger-bg);
  border-color: var(--vp-c-red-1);
  color: var(--vp-custom-block-danger-text);
}
</style>
