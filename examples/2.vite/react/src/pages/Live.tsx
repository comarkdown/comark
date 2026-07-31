import { createComarkContext, parse, type ComarkTree } from 'comark'
import { MarkdownLive } from '@comark/react'
import { useEffect, useState } from 'react'

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

let counter = 0
const btn = 'rounded border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm'

async function appendParagraph() {
  ctx
    .get('demo')
    .patch({ op: 'insert', path: [99], node: (await parse(`A paragraph appended at ${++counter}.`)).nodes[0]! })
}

async function rewriteHeading() {
  ctx
    .get('demo')
    .patch({ op: 'replace', path: [0], node: (await parse(`# Rewritten heading (${++counter})`)).nodes[0]! })
}

async function reset() {
  counter = 0
  ctx.get('demo').set(await parse('# Live document\n\nReset. Drive me again.'))
}

export default function Live() {
  const [tree, setTree] = useState<ComarkTree | null>(null)

  useEffect(() => {
    parse(INITIAL).then((t) => {
      ctx.get('demo', t) // seed the context so patches have a base tree
      setTree(t)
    })
  }, [])

  if (!tree) return null

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          className={btn}
          onClick={appendParagraph}
        >
          Append paragraph
        </button>
        <button
          className={btn}
          onClick={rewriteHeading}
        >
          Rewrite heading
        </button>
        <button
          className={btn}
          onClick={reset}
        >
          Reset
        </button>
      </div>

      <MarkdownLive
        comarkKey="demo"
        value={tree}
      />
    </div>
  )
}
