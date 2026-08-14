<script setup lang="ts">
import { createComarkContext, parseMarkdown } from 'comark'
import { MarkdownDocument } from '@comark/vue'

// A driver installs a context on globalThis once; every <MarkdownDocument :id>
// then auto-subscribes. Here the buttons act as the driver — but it could just
// as well be HMR, a collab socket, an agent, or devtools.
const ctx = createComarkContext()
const tree = await parseMarkdown(`# Live document

This paragraph is rendered from a **MarkdownDocument** wired to \`globalThis.comarkContext\`.

Use the buttons to push updates by id — no re-mount.

Open browser console and try updaing the document:
\`\`\`
const doc = globalThis.comarkContext.get('demo')
doc.patch({ op: 'replace', path: [0, 0], node: 'Live document update' })
\`\`\`

`)
const doc = ctx.get('demo', tree) // seed the context so patches have a base tree

let counter = 0

async function rewriteHeading() {
  doc.patch({ op: 'replace', path: [0], node: (await parseMarkdown(`# Rewritten heading (${++counter})`)).nodes[0]! })
}

async function appendParagraph() {
  doc.patch({
    op: 'insert',
    path: [99],
    node: (await parseMarkdown(`A paragraph appended at ${++counter}.`)).nodes[0]!,
  })
}

async function reset() {
  counter = 0
  doc.set(await parseMarkdown('# Live document\n\nReset. Drive me again.'))
}

// @ts-expect-error - parseMarkdown is exposed for console demos
globalThis.parseMarkdown = parseMarkdown
</script>

<template>
  <div>
    <div class="flex gap-2 mb-6">
      <button
        class="rounded border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm"
        @click="appendParagraph"
      >
        Append paragraph
      </button>
      <button
        class="rounded border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm"
        @click="rewriteHeading"
      >
        Rewrite heading
      </button>
      <button
        class="rounded border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm"
        @click="reset"
      >
        Reset
      </button>
    </div>

    <MarkdownDocument
      document-key="demos"
      :value="tree"
    />
  </div>
</template>
