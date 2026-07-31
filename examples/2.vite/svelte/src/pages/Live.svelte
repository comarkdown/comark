<script lang="ts">
  import { createComarkContext, parse, type MarkdownTree } from 'comark'
  import { MarkdownParsed } from '@comark/svelte'

  // A driver installs a context on globalThis once; every <MarkdownParsed comarkKey>
  // then auto-subscribes. The buttons act as the driver here — but it could just as
  // well be HMR, a collab socket, an agent, or devtools.
  const ctx = createComarkContext()

  const INITIAL = `# Live document

This paragraph is rendered from a **MarkdownParsed** wired to \`globalThis.comarkContext\`.

Use the buttons to push updates by key — no re-mount.

Open the browser console and try:

\`\`\`
const ctx = globalThis.comarkContext.get('demo')
ctx.patch({ op: 'replace', path: [0, 0], node: 'Live document update' })
\`\`\`
`

  const btn = 'rounded border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm'

  let tree = $state<MarkdownTree | null>(null)
  let counter = 0

  parse(INITIAL).then((t) => {
    ctx.get('demo', t) // seed the context so patches have a base tree
    tree = t
  })

  async function appendParagraph() {
    ctx.get('demo').patch({ op: 'insert', path: [99], node: (await parse(`A paragraph appended at ${++counter}.`)).nodes[0]! })
  }

  async function rewriteHeading() {
    ctx.get('demo').patch({ op: 'replace', path: [0], node: (await parse(`# Rewritten heading (${++counter})`)).nodes[0]! })
  }

  async function reset() {
    counter = 0
    ctx.get('demo').set(await parse('# Live document\n\nReset. Drive me again.'))
  }
</script>

{#if tree}
  <div class="flex gap-2 mb-6">
    <button class={btn} onclick={appendParagraph}>Append paragraph</button>
    <button class={btn} onclick={rewriteHeading}>Rewrite heading</button>
    <button class={btn} onclick={reset}>Reset</button>
  </div>

  <MarkdownParsed comarkKey="demo" value={tree} />
{/if}
