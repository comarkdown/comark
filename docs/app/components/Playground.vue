<script setup lang="ts">
import { parse } from 'comark'
import highlight from '@comark/nuxt/plugins/highlight'
import math from '@comark/nuxt/plugins/math'
import binding, { Binding } from '@comark/nuxt/plugins/binding'
import emoji from '@comark/nuxt/plugins/emoji'
import mermaid from '@comark/nuxt/plugins/mermaid'
import jsonRender from '@comark/nuxt/plugins/json-render'
import footnotes from '@comark/nuxt/plugins/footnotes'
import punctuation from '@comark/nuxt/plugins/punctuation'
import breaks from '@comark/nuxt/plugins/breaks'

import { renderMarkdown } from 'comark/render'
import { Splitpanes, Pane } from 'splitpanes'
import { playgroundExamples } from '~/constants'
import Gallery from '~/components/playground/Gallery.vue'
import RatingBar from '~/components/playground/RatingBar.vue'
import HostInfo from '~/components/playground/HostInfo.vue'
import Facility from '~/components/playground/Facility.vue'
import TwoColumn from '~/components/playground/TwoColumn.vue'
import BookingCard from '~/components/playground/BookingCard.vue'
import Ingredients from '~/components/playground/Ingredients.vue'
import ProseSteps from '@nuxt/ui/components/prose/Steps.vue'
import { useLocalStorage, watchDebounced } from '@vueuse/core'
import type { ComarkTree, ComarkPlugin } from 'comark'
import VueJsonPretty from 'vue-json-pretty'

const props = defineProps<{
  compact?: boolean
}>()

const router = useRouter()
const route = useRoute()
const knownExamples = playgroundExamples.map(e => e.value)
const selectedExample = computed({
  get: () => knownExamples.includes(route.query.example as string) ? (route.query.example as string) : knownExamples[0],
  set: (value: string) => {
    if (knownExamples.includes(value)) {
      router.push({ query: { example: value } })
    }
  },
})
const currentExample = computed(() =>
  playgroundExamples.find(e => e.value === selectedExample.value) ?? playgroundExamples[0]!,
)

const markdown = ref<string>(currentExample.value.content.trim())
const tree = ref<ComarkTree | null>(null)
const parseTime = ref<number>(0)
const nodeCount = ref<number>(0)
const error = ref<string | null>(null)
const parsing = ref<boolean>(false)

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const pluginToggles = useLocalStorage('comark-playground-plugins', {
  highlight: true,
  math: true,
  emoji: true,
  mermaid: true,
  jsonRender: true,
  footnotes: true,
  punctuation: false,
  breaks: false,
  binding: true,
}, { mergeDefaults: true })

const parseOptions = useLocalStorage('comark-playground-parse-options', {
  autoUnwrap: true,
  autoClose: true,
  html: true,
}, { mergeDefaults: true })

const pluginDefs = [
  {
    key: 'emoji',
    label: 'Emoji',
    icon: 'i-lucide-smile',
    factory: () => emoji(),
  },
  {
    key: 'highlight',
    label: 'Syntax Highlighting',
    icon: 'i-lucide-code',
    factory: () => highlight(),
  },
  {
    key: 'mermaid',
    label: 'Mermaid Diagrams',
    icon: 'i-simple-icons:mermaid',
    factory: () => mermaid(),
  },
  {
    key: 'math',
    label: 'Mathematics (KaTeX)',
    icon: 'i-lucide-calculator',
    factory: () => math(),
  },
  {
    key: 'jsonRender',
    label: 'JSON Render',
    icon: 'i-lucide-braces',
    factory: () => jsonRender(),
  },
  {
    key: 'footnotes',
    label: 'Footnotes',
    icon: 'i-lucide-footprints',
    factory: () => footnotes(),
  },
  {
    key: 'punctuation',
    label: 'Punctuation',
    icon: 'i-lucide-quote',
    factory: () => punctuation(),
  },
  {
    key: 'binding',
    label: 'Binding',
    icon: 'i-lucide-link',
    factory: () => binding(),
  },
  {
    key: 'breaks',
    label: 'Breaks',
    icon: 'i-lucide-corner-down-left',
    factory: () => breaks(),
  },
] as const

const parseOptionDefs = [
  {
    key: 'autoUnwrap',
    label: 'Auto Unwrap',
    icon: 'i-lucide-ungroup',
  },
  {
    key: 'autoClose',
    label: 'Auto Close',
    icon: 'i-lucide-shield-check',
  },
  {
    key: 'html',
    label: 'HTML Parsing',
    icon: 'i-lucide-file-code',
  },
] as const

const activePlugins = computed<ComarkPlugin[]>(() =>
  pluginDefs
    .filter(p => pluginToggles.value[p.key as keyof typeof pluginToggles.value])
    .map(p => p.factory()),
)

const enabledPluginCount = computed<number>(() => Object.values(pluginToggles.value).filter(Boolean).length)

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
  const start = performance.now()
  try {
    const result = await parse(markdown.value, {
      plugins: activePlugins.value,
      autoUnwrap: parseOptions.value.autoUnwrap,
      autoClose: parseOptions.value.autoClose,
      html: parseOptions.value.html,
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
watchDebounced([activePlugins, parseOptions], parseMarkdown, { deep: true, debounce: 300 })
onMounted(() => {
  nextTick(() => parseMarkdown())
})

watch(selectedExample, () => {
  markdown.value = currentExample.value.content.trim()
})

function resetComark(): void {
  markdown.value = currentExample.value.content.trim()
}

const formattedOutput = ref<string>('')

watchEffect(async () => {
  formattedOutput.value = tree.value ? await renderMarkdown(tree.value as any) : ''
})

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
            <USelect
              v-if="!compact"
              v-model="selectedExample"
              :items="playgroundExamples"
              size="xs"
              color="neutral"
              variant="ghost"
              class="w-32"
            />
            <UTooltip
              v-if="markdown !== currentExample.content.trim()"
              text="Reset to example"
            >
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-rotate-ccw"
                label="Reset"
                @click="resetComark"
              />
            </UTooltip>

            <div class="flex-1" />

            <!-- Settings popover -->
            <UPopover
              v-if="!compact"
              :ui="{ content: 'p-0' }"
            >
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-settings-2"
              >
                <template #trailing>
                  <UBadge
                    size="xs"
                    color="neutral"
                    variant="subtle"
                    :label="`${enabledPluginCount}/${pluginDefs.length}`"
                  />
                </template>
              </UButton>

              <template #content>
                <div class="w-72">
                  <!-- Plugins section -->
                  <div class="px-3 pt-3 pb-1.5">
                    <p class="text-xs font-semibold text-muted uppercase tracking-wider">
                      Plugins
                    </p>
                  </div>
                  <div class="px-1 pb-1.5">
                    <button
                      v-for="plugin in pluginDefs"
                      :key="plugin.key"
                      class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm hover:bg-elevated transition-colors"
                      @click="pluginToggles[plugin.key] = !pluginToggles[plugin.key]"
                    >
                      <UIcon
                        :name="plugin.icon"
                        class="size-4 text-muted shrink-0"
                      />
                      <span class="flex-1 text-left truncate">{{ plugin.label }}</span>
                      <USwitch
                        :model-value="pluginToggles[plugin.key]"
                        size="xs"
                        tabindex="-1"
                        @click.stop
                        @update:model-value="(pluginToggles[plugin.key] as any) = $event"
                      />
                    </button>
                  </div>

                  <!-- Divider -->
                  <div class="border-t border-default" />

                  <!-- Parse options section -->
                  <div class="px-3 pt-2.5 pb-1.5">
                    <p class="text-xs font-semibold text-muted uppercase tracking-wider">
                      Parse Options
                    </p>
                  </div>
                  <div class="px-1 pb-2">
                    <button
                      v-for="opt in parseOptionDefs"
                      :key="opt.key"
                      class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm hover:bg-elevated transition-colors"
                      @click="parseOptions[opt.key] = !parseOptions[opt.key]"
                    >
                      <UIcon
                        :name="opt.icon"
                        class="size-4 text-muted shrink-0"
                      />
                      <span class="flex-1 text-left">{{ opt.label }}</span>
                      <USwitch
                        :model-value="parseOptions[opt.key]"
                        size="xs"
                        tabindex="-1"
                        @click.stop
                        @update:model-value="parseOptions[opt.key] = $event"
                      />
                    </button>
                  </div>
                </div>
              </template>
            </UPopover>
            <UButton
              :to="`/play/${selectedExample}`"
              icon="i-lucide-minimize"
              color="neutral"
              variant="ghost"
              size="xs"
            />
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
                class="max-w-none"
              >
                <ComarkDocsRenderer
                  :tree="tree"
                  :components="{ Binding, Gallery, RatingBar, HostInfo, Facility, TwoColumn, BookingCard, Ingredients, steps: ProseSteps }"
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
            <span class="flex items-center gap-1 text-xs text-muted">
              <UIcon
                name="i-lucide-puzzle"
                class="size-3"
              />
              {{ enabledPluginCount }} plugins
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
