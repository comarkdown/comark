<script setup lang="ts">
import { createComarkContext, parse } from 'comark'
import { ComarkRenderer } from '@comark/vue'

// A driver installs a context on globalThis once; every <ComarkRenderer :id>
// then auto-subscribes. Here the buttons act as the driver — but it could just
// as well be HMR, a collab socket, an agent, or devtools.
const ctx = createComarkContext()
const tree = await parse(`# Live document

This paragraph is rendered from a **ComarkRenderer** wired to \`globalThis.comarkContext\`.

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
  doc.patch({ op: 'replace', path: [0], node: (await parse(`# Rewritten heading (${++counter})`)).nodes[0]! })
}

async function appendParagraph() {
  doc.patch({ op: 'insert', path: [99], node: (await parse(`A paragraph appended at ${++counter}.`)).nodes[0]! })
}

async function reset() {
  counter = 0
  doc.set(await parse('# Live document\n\nReset. Drive me again.'))
}

// @ts-expect-error - parse is defined in the global scope
globalThis.parse = parse
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

    <ComarkRenderer
      comark-key="demos"
      :tree="tree"
    />
  </div>
</template>
