<script setup lang="ts">
import { parse } from 'comark'
import highlight from 'comark/plugins/highlight'
import { renderMarkdown } from 'comark/string'
import { ComarkRenderer } from '@comark/vue'
import { Splitpanes, Pane } from 'splitpanes'
import { defaultMarkdown } from '~/constants'
import { watchDebounced } from '@vueuse/core'
import type { ComarkTree } from 'comark/ast'
import { ProseCallout, ProseNote, ProseTip, ProseWarning, ProseCaution } from '#components'
import ProsePre from './landing/ProsePre.vue'
import VueJsonPretty from 'vue-json-pretty'

const props = defineProps<{
  compact?: boolean
}>()

const components = {
  callout: ProseCallout,
  note: ProseNote,
  tip: ProseTip,
  warning: ProseWarning,
  caution: ProseCaution,
  pre: ProsePre,
}

const markdown = ref<string>(defaultMarkdown.trim())
const tree = ref<ComarkTree | null>(null)
const parseTime = ref<number>(0)
const nodeCount = ref<number>(0)
const error = ref<string | null>(null)
const parsing = ref<boolean>(false)

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const activeTab = ref('preview')
const tabs = [
  { label: 'Preview', value: 'preview', icon: 'i-lucide-eye' },
  { label: 'AST', value: 'ast', icon: 'i-lucide-git-branch' },
  { label: 'Formatted', value: 'formatted', icon: 'i-lucide-code' },
]

// In compact mode the tab is always locked to preview
const currentTab = computed(() => props.compact ? 'preview' : activeTab.value)

function countNodes(nodes: unknown[]): number {
  let count = 0
  for (const node of nodes) {
    count++
    if (Array.isArray(node) && node.length > 2) {
      for (let i = 2; i < node.length; i++) {
        if (Array.isArray(node[i])) {
          count += countNodes([node[i]])
        }
        else if (typeof node[i] === 'string') {
          count++
        }
      }
    }
  }
  return count
}

async function parseMarkdown(): Promise<void> {
  if (!markdown.value.trim()) {
    tree.value = null
    parseTime.value = 0
    nodeCount.value = 0
    error.value = null
    return
  }
  parsing.value = true
  const plugins = [highlight()]
  const start = performance.now()
  try {
    const result = await parse(markdown.value, {
      plugins,
    })
    tree.value = result
    parseTime.value = Math.round((performance.now() - start) * 10) / 10
    nodeCount.value = countNodes(result.nodes)
    error.value = null
  }
  catch (err: any) {
    error.value = err.message || 'Failed to parse markdown'
  }
  finally {
    parsing.value = false
  }
}

watchDebounced(markdown, parseMarkdown, { debounce: 300 })
onMounted(() => {
  nextTick(() => parseMarkdown())
})

function resetComark(): void {
  markdown.value = defaultMarkdown.trim()
}

const formattedOutput = computed<string>(() =>
  tree.value ? renderMarkdown(tree.value as ComarkTree) : '',
)

const formattedOutputModel = computed({
  get: () => formattedOutput.value,
  set: () => {},
})

const isMatch = computed(() =>
  !!formattedOutput.value && formattedOutput.value.trim() === markdown.value.trim(),
)
</script>

<template>
  <div
    class="overflow-hidden"
    :class="compact ? 'h-[420px] border-b border-default bg-elevated' : 'h-[calc(100vh-64px)]'"
  >
    <Splitpanes class="h-full">
      <!-- ── Left pane: Markdown editor ── -->
      <Pane
        :size="50"
        :min-size="20"
      >
        <div class="h-full flex flex-col">
          <div class="shrink-0 flex items-center gap-2 px-3 h-9 border-b border-default bg-default">
            <UTooltip text="Reset to default content">
              <UButton
                :disabled="markdown === defaultMarkdown.trim()"
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-rotate-ccw"
                label="Reset"
                @click="resetComark"
              />
            </UTooltip>
          </div>
          <div class="flex-1 min-h-0">
            <Editor
              v-model="markdown"
              :font-size="compact ? 12 : 14"
            />
          </div>
        </div>
      </Pane>

      <!-- ── Right pane: Output ── -->
      <Pane
        :size="50"
        :min-size="20"
      >
        <div class="h-full flex flex-col">
          <div class="shrink-0 flex items-center px-3 h-9 border-b border-default bg-default">
            <!-- Roundtrip match indicator (full mode only) -->
            <div
              v-if="!compact && tree && activeTab === 'formatted'"
              class="flex-1 flex items-center gap-1.5"
            >
              <UTooltip :text="isMatch ? 'Stringify output matches source' : 'Stringify output differs from source'">
                <span class="flex items-center gap-1.5 text-xs text-muted cursor-default">
                  <span
                    class="size-2 rounded-full"
                    :class="isMatch ? 'bg-success' : 'bg-error'"
                  />
                  {{ isMatch ? 'Roundtrip match' : 'Roundtrip mismatch' }}
                </span>
              </UTooltip>
            </div>
            <div
              v-else
              class="flex-1"
            />
            <UButton
              v-if="compact"
              to="/play"
              size="xs"
              color="neutral"
              variant="soft"
              trailing-icon="i-lucide-arrow-right"
              label="Try playground"
            />
            <UTabs
              v-else
              v-model="activeTab"
              :content="false"
              :items="tabs"
              color="neutral"
              variant="link"
              size="xs"
              class="h-full"
              :ui="{ list: 'h-full p-0 border-b-0' }"
            />
          </div>

          <!-- Preview -->
          <div
            v-if="currentTab === 'preview'"
            class="flex-1 min-h-0 relative overflow-hidden bg-white dark:bg-neutral-900"
          >
            <div
              v-if="parsing && !tree"
              class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted"
            >
              <UIcon
                name="i-lucide-loader-circle"
                class="size-6 animate-spin text-primary"
              />
              <span class="text-sm">Rendering preview...</span>
            </div>
            <div
              v-else-if="!tree && !error"
              class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted"
            >
              <UIcon
                name="i-lucide-eye-off"
                class="size-8 opacity-40"
              />
              <p class="text-sm font-medium">
                Nothing to preview
              </p>
            </div>
            <UScrollArea
              v-else
              class="h-full"
              :ui="{ viewport: 'p-4 sm:p-6' }"
            >
              <UAlert
                v-if="error"
                color="error"
                variant="soft"
                icon="i-lucide-circle-alert"
                :title="error"
              />
              <div
                v-else-if="tree"
                class="prose prose-sm dark:prose-invert max-w-none prose-headings:no-underline"
              >
                <ComarkRenderer
                  :tree="tree"
                  :components="components"
                />
              </div>
            </UScrollArea>
          </div>

          <!-- AST -->
          <UScrollArea
            v-else-if="currentTab === 'ast'"
            class="flex-1 min-h-0"
            :ui="{ viewport: 'p-4' }"
          >
            <VueJsonPretty
              v-if="tree"
              :data="(tree as any)"
              :theme="isDark ? 'dark' : 'light'"
              :deep="6"
              show-line
            />
          </UScrollArea>

          <!-- Formatted -->
          <div
            v-else-if="currentTab === 'formatted'"
            class="flex-1 min-h-0"
          >
            <Editor
              v-model="formattedOutputModel"
              language="mdc"
              :read-only="true"
              :font-size="compact ? 12 : 14"
            />
          </div>

          <!-- Status bar (full mode only) -->
          <div
            v-if="!compact"
            class="shrink-0 flex items-center gap-4 px-4 h-7 border-t border-default bg-default"
          >
            <span class="flex items-center gap-1 text-xs text-muted">
              <UIcon
                name="i-lucide-git-branch"
                class="size-3"
              />
              {{ nodeCount }} nodes
            </span>
            <span class="flex items-center gap-1 text-xs text-muted">
              <UIcon
                name="i-lucide-timer"
                class="size-3"
              />
              {{ parseTime }}ms
            </span>
          </div>
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style>
@import 'splitpanes/dist/splitpanes.css';
@import 'vue-json-pretty/lib/styles.css';

.splitpanes--vertical > .splitpanes__splitter {
  width: 1px !important;
  background: var(--ui-border);
  margin: 0 !important;
}

.vjs-value-string {
  color: var(--ui-primary) !important;
}

.vjs-tree-node.is-highlight,
.vjs-tree-node:hover {
  background-color: var(--color-primary-200) !important;
}

.vjs-tree-node.dark.is-highlight,
.vjs-tree-node.dark:hover {
  background-color: var(--color-primary-800) !important;
}

.vjs-tree-node .vjs-tree-node-actions,
.vjs-tree-node.dark .vjs-tree-node-actions {
  background-color: var(--color-primary-200) !important;
}

.vjs-tree-node .vjs-indent-unit.has-line {
  border-left-color: var(--ui-border);
}

.vjs-tree-node .vjs-tree-brackets:hover {
  color: var(--ui-primary);
}
</style>
