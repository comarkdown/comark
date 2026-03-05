<template>
  <pre :class="['shiki-container']"><slot /></pre>
</template>

<style scoped>
.shiki-container :deep(span.line) {
  display: inline-block;
}
html.dark .shiki-container:not(.shiki-stream) :deep(span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
