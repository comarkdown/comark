<script setup lang="ts">
import { parse } from 'comark'
import math from '@comark/math'
import { Math } from '@comark/math/vue'
import mermaid from '@comark/mermaid'
import { Mermaid } from '@comark/mermaid/vue'
import { ref } from 'vue'

const markdown = ref(`
## Linear Algebra and Calculus

In linear algebra, a system of equations can be written compactly as $$A\\mathbf{x} = \\mathbf{b}$$, where $$A \\in \\mathbb{R}^{m \\times n}$$ is a matrix and $$\\mathbf{x} \\in \\mathbb{R}^n$$ is a vector of unknowns.

The determinant $$\\det(A)$$ tells us whether the system has a unique solution: if $$\\det(A) \\neq 0$$, then $$A^{-1}$$ exists and $$\\mathbf{x} = A^{-1}\\mathbf{b}$$.

## Block Math

The gradient of a scalar-valued function $$f(x, y)$$ is given by:

$$
\\nabla f =
\\begin{bmatrix}
\\frac{\\partial f}{\\partial x} \\\\
\\frac{\\partial f}{\\partial y}
\\end{bmatrix}
$$

## Series and Limits

A geometric series converges when $$|r| < 1$$:

$$
\\sum_{k=0}^{\\infty} ar^k = \\frac{a}{1 - r}
$$

The definition of a limit uses $$\\varepsilon$$–$$\\delta$$ notation:

$$
\\lim_{x \\to c} f(x) = L \\quad \\text{if for every } \\varepsilon > 0 \\text{ there exists } \\delta > 0
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
</script>

<template>
  <div
    class="grid grid-cols-2 grid-rows-2 gap-1 bg-neutral-100 dark:bg-neutral-800"
    style="height: calc(100vh - 64px)"
  >
    <div class="w-full h-full flex flex-col overflow-y-auto bg-white dark:bg-neutral-900">
      <textarea
        v-model="markdown"
        class="w-full h-full p-4 resize-none outline-none"
        placeholder="Enter markdown here..."
      />
    </div>

    <div class="w-full h-full row-span-2 overflow-y-auto p-4 bg-white dark:bg-neutral-900">
      <ComarkDocs :components="{ math: Math, mermaid: Mermaid }">
        {{ markdown }}
      </ComarkDocs>
    </div>

    <pre class="w-full h-full overflow-y-auto p-4 rounded font-mono text-sm max-w-none bg-white dark:bg-neutral-900">{{ JSON.stringify(data, null, 2) }}</pre>
  </div>
</template>
