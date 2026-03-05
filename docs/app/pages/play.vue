<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { parse } from 'comark'
import math from '@comark/math'
import { Math } from '@comark/math/vue'
import mermaid from '@comark/mermaid'
import { Mermaid } from '@comark/mermaid/vue'
import { ref } from 'vue'
import { renderMarkdown } from 'comark/string'

definePageMeta({
  footer: false,
})

const markdown = ref(`
## Linear Algebra and Calculus

In linear algebra, a system of equations can be written compactly as $$A\\mathbf{x} = \\mathbf{b}$$, where $$A \\in \\mathbb{R}^{m \\times n}$$ is a matrix and $$\\mathbf{x} \\in \\mathbb{R}^n$$ is a vector of unknowns.

> [!NOTE]
> The determinant $$\\det(A)$$ tells us whether the system has a unique solution: if $$\\det(A) \\neq 0$$, then $$A^{-1}$$ exists and $$\\mathbf{x} = A^{-1}\\mathbf{b}$$.

## Block Math

The gradient of a scalar-valued function $$f(x, y)$$ is given by:

$$
\\nabla f =
\\begin{bmatrix}
\\frac{\\partial f}{\\partial x} \\\\
\\frac{\\partial f}{\\partial y}
\\end{bmatrix}
$$

\`\`\`mermaid
graph TD
  A[Comark Markdown] -->|parses| B[Components]
  A -->|parses| C[Markdown]
  B --> D[Vue]
  B --> E[React]
  C --> F[HTML]
  D --> G[Apps]
  E --> G
\`\`\`
`)

const { data } = useAsyncData('ast', () => parse(markdown.value, { plugins: [math(), mermaid()] }), {
  watch: [markdown],
})

const generatedMarkdown = computed(() => data.value ? renderMarkdown(data.value) : '')
</script>

<template>
  <div
    class="w-screen text-green9 font-semibold text-sm"
    style="height: calc(100vh - 64px)"
  >
    <SplitterGroup
      id="splitter-group-1"
      direction="horizontal"
    >
      <SplitterPanel
        id="splitter-group-1-panel-1"
        :min-size="20"
      >
        <SplitterGroup
          id="splitter-group-2"
          direction="vertical"
        >
          <SplitterPanel
            id="splitter-group-2-panel-1"
            :min-size="20"
          >
            <textarea
              v-model="markdown"
              class="w-full h-full p-4 resize-none outline-none"
              placeholder="Enter markdown here..."
            />
          </SplitterPanel>
          <SplitterResizeHandle
            id="splitter-group-2-resize-handle-1"
            class="h-2 bg-neutral-100 dark:bg-neutral-800"
          />
          <SplitterPanel
            id="splitter-group-2-panel-2"
            :min-size="20"
          >
            <pre class="w-full h-full overflow-y-auto p-4 rounded font-mono text-sm max-w-none bg-white dark:bg-neutral-900">{{ JSON.stringify(data, null, 2) }}</pre>
          </SplitterPanel>
        </SplitterGroup>
      </SplitterPanel>
      <SplitterResizeHandle
        id="splitter-group-1-resize-handle-1"
        class="w-2 bg-neutral-100 dark:bg-neutral-800"
      />
      <SplitterPanel
        id="splitter-group-1-panel-2"
        :min-size="20"
      >
        <SplitterGroup
          id="splitter-group-2"
          direction="vertical"
        >
          <SplitterPanel
            id="splitter-group-2-panel-1"
            :min-size="20"
          >
            <ComarkDocs
              class="overflow-y-auto h-full p-4"
              :components="{ math: Math, mermaid: Mermaid }"
            >
              {{ markdown }}
            </ComarkDocs>
          </SplitterPanel>
          <SplitterResizeHandle
            id="splitter-group-2-resize-handle-1"
            class="h-2 bg-neutral-100 dark:bg-neutral-800"
          />
          <SplitterPanel
            id="splitter-group-2-panel-2"
            :min-size="20"
          >
            <pre class="w-full h-full overflow-y-auto p-4 rounded font-mono text-sm max-w-none bg-white dark:bg-neutral-900">{{ generatedMarkdown }}</pre>
          </SplitterPanel>
        </SplitterGroup>
      </SplitterPanel>
    </SplitterGroup>
  </div>
</template>

<style scoped>
textarea {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace
}
</style>
