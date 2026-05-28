<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { allFeaturesMarkdown } from '~/constants'

definePageMeta({ footer: false })

useSeoMeta({
  title: 'Compare - Comark',
  description: 'Compare multiple Comark documents side by side.',
})

interface Col {
  id: string
  content: string
}

const defaultCols: Col[] = [
  { id: '1', content: allFeaturesMarkdown },
  { id: '2', content: allFeaturesMarkdown },
]

const cols = useLocalStorage<Col[]>('comark:compare-cols', defaultCols, {
  serializer: {
    read: (v) => {
      try {
        const parsed = JSON.parse(v)
        return Array.isArray(parsed) && parsed.length >= 2 ? parsed : defaultCols
      } catch {
        return defaultCols
      }
    },
    write: (v) => JSON.stringify(v),
  },
})

// nextId must be higher than any existing id to avoid collisions after reload
let nextId = cols.value.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0) + 1

function addCol() {
  cols.value = [...cols.value, { id: String(nextId++), content: '' }]
}

function removeCol(id: string) {
  if (cols.value.length <= 2) return
  cols.value = cols.value.filter((c) => c.id !== id)
}
</script>

<template>
  <ClientOnly>
    <div class="flex h-[calc(100vh-64px)] overflow-hidden">
      <!-- Editor columns -->
      <div
        v-for="(col, i) in cols"
        :key="col.id"
        class="flex min-w-0 flex-1 flex-col border-l border-default first:border-l-0"
      >
        <div class="flex h-9 shrink-0 items-center gap-2 border-b border-default bg-elevated px-3">
          <span class="text-xs text-muted">Editor {{ i + 1 }}</span>
          <UButton
            v-if="cols.length > 2"
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="xs"
            class="ml-auto -mr-1"
            @click="removeCol(col.id)"
          />
        </div>
        <div class="min-h-0 flex-1">
          <Editor v-model="col.content" />
        </div>
      </div>

      <!-- Add column -->
      <div class="flex w-10 shrink-0 items-center justify-center border-l border-default bg-elevated">
        <UTooltip text="Add editor">
          <UButton
            icon="i-lucide-plus"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="addCol"
          />
        </UTooltip>
      </div>
    </div>

    <template #fallback>
      <div class="flex h-[calc(100vh-64px)] overflow-hidden">
        <div
          v-for="i in 2"
          :key="i"
          class="flex flex-1 flex-col border-l border-default first:border-l-0"
        >
          <div class="h-9 border-b border-default bg-elevated" />
          <div class="flex-1 p-4">
            <USkeleton class="h-full w-full" />
          </div>
        </div>
        <div class="w-10 shrink-0 border-l border-default bg-elevated" />
      </div>
    </template>
  </ClientOnly>
</template>
