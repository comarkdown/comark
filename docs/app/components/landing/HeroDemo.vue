<script setup lang="ts">
const props = defineProps<{
  demoMarkdown: string
}>()

const sourceAsCode = computed(() => [
  '```md',
  props.demoMarkdown,
  '```'
].join('\n'))
</script>

<template>
  <div class="overflow-hidden border border-muted bg-default">
    <div class="flex items-center justify-between border-b border-muted bg-elevated/50 px-4 py-2.5">
      <div class="flex items-center gap-2">
        <div class="flex gap-1.5">
          <div class="size-2.5 rounded-full bg-accented" />
          <div class="size-2.5 rounded-full bg-accented" />
          <div class="size-2.5 rounded-full bg-accented" />
        </div>
        <span class="ml-3 font-mono text-xs text-muted">comark</span>
      </div>
      <UButton
        label="Open in playground"
        trailing-icon="i-lucide-arrow-right"
        variant="subtle"
        color="neutral"
        size="xs"
        to="/play/editor?example=all-features"
      />
    </div>

    <div class="grid md:grid-cols-2">
      <div class="min-w-0 border-b border-muted md:border-r md:border-b-0">
        <div class="border-b border-muted bg-elevated/50 px-4 py-2">
          <span class="font-mono text-xs text-muted">source.md</span>
        </div>
        <div class="shiki-source h-[280px] overflow-y-auto overflow-x-hidden p-4 md:h-[400px]">
          <ComarkDocs class="font-mono text-sm/6" :markdown="sourceAsCode" :components="{ ProsePre: 'pre'}" />
        </div>
      </div>

      <div class="min-w-0">
        <div class="border-b border-muted bg-elevated/50 px-4 py-2">
          <span class="font-mono text-xs text-muted">rendered output</span>
        </div>
        <div class="h-[280px] overflow-auto p-4 md:h-[400px]">
          <ComarkDocs
            v-if="demoMarkdown"
            class="text-sm"
            :markdown="demoMarkdown"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shiki-source :deep(pre) {
  margin: 0;
  background: transparent !important;
  white-space: pre-wrap;
  word-break: break-word;
}

.shiki-source :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.shiki-source :deep(.line) {
  display: inline;
}

.shiki-source :deep(span) {
  background-color: transparent !important;
}

html.dark .shiki-source :deep(span) {
  color: var(--shiki-dark) !important;
  font-style: var(--shiki-dark-font-style) !important;
}
</style>
