<script setup lang="ts">
import type { ComarkTree } from 'comark'
import { ComarkRenderer } from '@comark/vue'
import CodeIcon from '@nuxt/ui/components/prose/CodeIcon.vue'

interface CodeExplorerTreeItem {
  filename: string
  path: string
  children?: CodeExplorerTreeItem[]
  defaultExpanded?: boolean
}

interface CodeExplorerData {
  tree: CodeExplorerTreeItem[]
  files: Record<string, ComarkTree>
}

const props = withDefaults(
  defineProps<{
    org: string
    repo: string
    path: string
    branch?: string
    defaultValue?: string
  }>(),
  {
    branch: 'main',
  }
)

const repoSegment = computed(() => {
  if (props.branch === 'main') return props.repo
  return `${props.repo}@${props.branch.replaceAll('/', '~')}`
})

const apiUrl = computed(() => `/api/code-explorer/${props.org}/${repoSegment.value}/${props.path}.json`)

prerenderRoutes([apiUrl.value])
const nuxtApp = useNuxtApp()
const { data } = await useFetch<CodeExplorerData>(apiUrl, {
  getCachedData: (key) => nuxtApp.payload.data[key],
})

const selected = ref(
  props.defaultValue ? findFile(props.defaultValue, data.value?.tree) : findFirstFile(data.value?.tree)
)
const selectedFile = computed(() => (selected.value ? data.value?.files[selected.value.path] : undefined))

expandDefaultSelected(data.value?.tree)

function findFirstFile(items: CodeExplorerTreeItem[] = []): CodeExplorerTreeItem | undefined {
  for (const item of items) {
    if (!item.children) return item
    const found = findFirstFile(item.children)
    if (found) return found
  }
}

function findFile(path: string, items: CodeExplorerTreeItem[] = []): CodeExplorerTreeItem | undefined {
  for (const item of items) {
    if (item.path === path) return item
    if (item.children) {
      const found = findFile(path, item.children)
      if (found) return found
    }
  }
}

function expandDefaultSelected(items: CodeExplorerTreeItem[] = []) {
  for (const item of items) {
    if (item.children && selected.value?.path.startsWith(item.path + '/')) {
      item.defaultExpanded = true
      expandDefaultSelected(item.children)
    }
  }
}

function onSelect(e: Event, item: CodeExplorerTreeItem) {
  if (item?.children || item.path === selected.value?.path) {
    e.preventDefault()
  }
}
</script>

<template>
  <div
    v-if="data"
    class="relative border border-muted rounded-lg overflow-hidden not-prose"
  >
    <div class="grid lg:grid-cols-3 lg:h-[450px]">
      <div class="p-2 border-b lg:border-b-0 lg:border-r border-muted overflow-y-auto">
        <UTree
          v-model="selected"
          :items="data.tree"
          color="neutral"
          :get-key="(item) => item.path"
          label-key="filename"
          :ui="{ linkLeadingIcon: 'size-4' }"
          @select="onSelect"
        >
          <template #item-leading="{ item, ui }">
            <CodeIcon
              v-if="!item.children?.length"
              :filename="item.filename"
              :class="ui.linkLeadingIcon({ class: 'size-4' })"
            />
          </template>
        </UTree>
      </div>

      <div class="lg:col-span-2 overflow-auto flex flex-col">
        <div
          v-if="selected"
          class="flex items-center gap-1.5 border-b border-muted bg-muted/50 px-4 py-2"
        >
          <CodeIcon :filename="selected.filename" />
          <span class="font-mono text-xs text-muted truncate">{{ selected.filename }}</span>
        </div>

        <div
          v-if="selectedFile"
          class="code-explorer-content flex-1 flex-col"
        >
          <UTheme :ui="{ prose: { pre: { root: 'my-0 h-full' } } }">
            <ComarkRenderer
              :tree="selectedFile"
              class="h-full"
            />
          </UTheme>
        </div>

        <div
          v-else
          class="flex items-center justify-center h-full p-8 text-sm text-muted"
        >
          Select a file to view its contents
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-explorer-content :deep(pre) {
  margin: 0;
  border: 0;
  border-radius: 0;
  height: 100%;
}
</style>

<style>
.dark .shiki span {
  color: var(--shiki-dark) !important;
}
</style>
