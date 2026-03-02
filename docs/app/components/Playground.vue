<script setup lang="ts">
import { parse } from 'comark'
import { ComarkRenderer } from 'comark/vue'
import { Splitpanes, Pane } from 'splitpanes'
import { defaultMarkdown } from '~/constants'
import { watchDebounced } from '@vueuse/core'
import type { ComarkTree } from 'comark/ast'
import { ProseCallout, ProseNote, ProseTip, ProseWarning, ProseCaution } from '#components'

defineProps<{
  compact?: boolean
}>()

const components = {
  callout: ProseCallout,
  note: ProseNote,
  tip: ProseTip,
  warning: ProseWarning,
  caution: ProseCaution,
}

const markdown = ref<string>(defaultMarkdown.trim())
const tree = ref<ComarkTree | null>(null)
const parseTime = ref<number>(0)
const nodeCount = ref<number>(0)
const error = ref<string | null>(null)
const parsing = ref<boolean>(false)

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
      autoClose: true,
      autoUnwrap: true,
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

parseMarkdown()

function resetComark(): void {
  markdown.value = defaultMarkdown.trim()
}
</script>

<template>
  <!-- ── Simplified mode (landing page playground block) ── -->
  <div
    v-if="compact"
    class="rounded-xl border border-default overflow-hidden bg-elevated shadow-lg"
  >
    <div class="flex h-[420px]">
      <!-- Left: textarea editor -->
      <div class="flex-1 flex flex-col min-w-0 border-r border-default">
        <div class="flex items-center gap-1.5 px-3 h-9 border-b border-default bg-default">
          <UIcon
            name="i-lucide-pencil"
            class="size-3.5 text-muted"
          />
          <span class="text-xs font-semibold uppercase tracking-wide text-muted">Markdown</span>
        </div>
        <textarea
          v-model="markdown"
          class="flex-1 w-full p-3 font-mono text-xs leading-relaxed resize-none outline-none bg-transparent text-default"
          spellcheck="false"
          placeholder="Type your markdown here…"
        />
      </div>

      <!-- Right: rendered preview -->
      <div class="flex-1 flex flex-col min-w-0">
        <div class="flex items-center gap-1.5 px-3 h-9 border-b border-default bg-default">
          <UIcon
            name="i-lucide-eye"
            class="size-3.5 text-muted"
          />
          <span class="text-xs font-semibold uppercase tracking-wide text-muted">Preview</span>
        </div>

        <div
          v-if="parsing && !tree"
          class="flex flex-1 items-center justify-center text-muted"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-5 animate-spin text-primary"
          />
        </div>
        <div
          v-else-if="!tree && !error"
          class="flex flex-1 items-center justify-center text-muted"
        >
          <UIcon
            name="i-lucide-eye-off"
            class="size-6 opacity-40"
          />
        </div>
        <UScrollArea
          v-else
          class="h-full"
          :ui="{ viewport: 'p-3' }"
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
            class="prose prose-sm dark:prose-invert max-w-none"
          >
            <Suspense>
              <ComarkRenderer
                :tree="tree"
                :components="components"
              />
            </Suspense>
          </div>
        </UScrollArea>
      </div>
    </div>
  </div>

  <!-- ── Full mode (devtools / play page) ── -->
  <div
    v-else
    class="h-[calc(100vh-64px)] flex flex-col overflow-hidden"
  >
    <Splitpanes class="flex-1 min-h-0">
      <!-- Pane 1: Markdown Input -->
      <Pane
        :size="50"
        :min-size="20"
      >
        <UCard
          variant="soft"
          class="h-full min-w-0"
          :ui="{
            root: 'rounded-none border-0 ring-0 flex flex-col h-full shadow-none',
            header: 'py-0 px-4 sm:px-4',
            body: 'flex-1 min-h-0 p-0 sm:p-0',
          }"
        >
          <template #header>
            <div class="flex items-center justify-between h-10">
              <div class="flex items-center gap-1.5">
                <UIcon
                  name="i-lucide-pencil"
                  class="size-4 text-muted"
                />
                <span class="text-xs font-semibold uppercase tracking-wide text-muted">Markdown Input</span>
              </div>
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
          </template>

          <Editor v-model="markdown" />
        </UCard>
      </Pane>

      <!-- Pane 2: Rendered Preview -->
      <Pane
        :size="50"
        :min-size="20"
      >
        <UCard
          variant="soft"
          class="h-full min-w-0"
          :ui="{
            root: 'rounded-none border-0 ring-0 flex flex-col h-full shadow-none',
            header: 'py-0 px-4 sm:px-4',
            body: 'flex-1 flex flex-col min-h-0 p-0 sm:p-0',
          }"
        >
          <template #header>
            <div class="flex items-center justify-between gap-2 h-10">
              <div class="flex items-center gap-1.5">
                <UIcon
                  name="i-lucide-eye"
                  class="size-4 text-muted"
                />
                <span class="text-xs font-semibold uppercase tracking-wide text-muted">Preview</span>
              </div>
              <div class="flex items-center gap-2">
                <UTooltip text="Nodes in AST">
                  <UBadge
                    color="neutral"
                    variant="soft"
                    size="xs"
                  >
                    <UIcon
                      name="i-lucide-git-branch"
                      class="size-3"
                    />
                    {{ nodeCount }} nodes
                  </UBadge>
                </UTooltip>
                <UTooltip text="Parse duration">
                  <UBadge
                    color="neutral"
                    variant="soft"
                    size="xs"
                  >
                    <UIcon
                      name="i-lucide-timer"
                      class="size-3"
                    />
                    {{ parseTime }}ms
                  </UBadge>
                </UTooltip>
              </div>
            </div>
          </template>

          <div
            v-if="parsing && !tree"
            class="flex flex-1 flex-col items-center justify-center gap-3 text-muted"
          >
            <UIcon
              name="i-lucide-loader-circle"
              class="size-6 animate-spin text-primary"
            />
            <span class="text-sm">Rendering preview...</span>
          </div>
          <div
            v-else-if="!tree && !error"
            class="flex flex-1 flex-col items-center justify-center gap-3 text-muted"
          >
            <UIcon
              name="i-lucide-eye-off"
              class="size-8 opacity-40"
            />
            <div class="text-center">
              <p class="text-sm font-medium">
                Nothing to preview
              </p>
              <p class="text-xs opacity-70">
                Type some markdown to see the rendered output
              </p>
            </div>
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
              class="prose prose-sm dark:prose-invert max-w-none"
            >
              <Suspense>
                <ComarkRenderer
                  :tree="tree"
                  :components="components"
                />
              </Suspense>
            </div>
          </UScrollArea>
        </UCard>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style lang="scss">
@import 'splitpanes/dist/splitpanes.css';

.splitpanes--vertical > .splitpanes__splitter {
  background: var(--background-color-border);
}
</style>
