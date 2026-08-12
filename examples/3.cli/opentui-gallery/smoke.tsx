/** @jsxImportSource @opentui/react */
/**
 * Headless render of the gallery, for checking it still paints without opening a
 * terminal. Prints the frame and fails if a construct went missing.
 *
 *   pnpm smoke
 */
import { createMockKeys } from '@opentui/core/testing'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { Gallery } from './app.tsx'

const EXPECTED = [
  // headings, inline marks, link, image alt
  'Comark OpenTUI Renderer',
  'Text Formatting',
  'strikethrough',
  'comark.dev',
  '[a diagram]',
  // fenced code: header (language + filename), body, second language, plain
  'typescript',
  'main.ts',
  'parseMarkdown',
  'def fib',
  'comark render README.md',
  // lists
  '• First item',
  '1. Step one',
  '7. Seven',
  '[x] Done',
  '[ ] Not done',
  'pnpm install',
  // blockquote and every GitHub alert kind
  'it is a way of life.',
  'NOTE',
  'TIP',
  'IMPORTANT',
  'WARNING',
  'CAUTION',
  // component slots, and the unregistered fallback
  'Hello from the title slot',
  'default',
  'Footer slot content here.',
  'Body of a component nobody mapped.',
  // math, inline and block
  'E = mc^2',
  '4ac',
  // table and raw html
  'measured columns',
  'A raw HTML block.',
  'html span',
  'mark tag',
]

async function pump(ui: { renderOnce: () => Promise<unknown> }, frames = 24) {
  for (let i = 0; i < frames; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 8))
    })
    await ui.renderOnce()
  }
}

const ui = await testRender(<Gallery />, { width: 96, height: 260 })

await pump(ui)

const frame = ui.captureCharFrame() as string

console.log(
  frame
    .split('\n')
    .map((row) => row.trimEnd())
    .join('\n')
)

const missing = EXPECTED.filter((needle) => !frame.includes(needle))

if (missing.length > 0) {
  console.error(`\n✗ missing from the frame:\n${missing.map((m) => `  - ${m}`).join('\n')}`)
  process.exit(1)
}

console.error(`\n✓ all ${EXPECTED.length} markers present`)

/**
 * The chrome must not move when the content does.
 *
 * A flex child will not shrink below its content height by default, so the full
 * document used to make the scroll region hold its ground and Yoga took the rows
 * out of the header instead — collapsing it to one row and drawing its bottom
 * border through the title. Toggling the streaming replay shrank the content,
 * released the pressure, and the header grew back, which read as the chrome
 * jumping. Measured at a realistic terminal height, where the pressure exists.
 */
const chrome = await testRender(<Gallery />, { width: 90, height: 40 })

function chromeRows(label: string) {
  const rows = (chrome.captureCharFrame() as string).split('\n')
  const title = rows[0] ?? ''
  const separator = rows.findIndex((row) => row.includes('────────'))
  const footer = rows.findIndex((row) => row.includes('pgup'))

  // Only the chrome is asserted. How far down the content starts is a property of
  // how much has been revealed, and is legitimately empty early in a replay.
  const problems = [
    separator === 1 ? null : `separator on row ${separator}, expected 1`,
    footer === 39 ? null : `footer on row ${footer}, expected 39`,
    // The symptom of the collapse: the header's bottom border drawn through the
    // title instead of on its own row.
    title.includes('─') ? `border bled into the title row: ${JSON.stringify(title.trim())}` : null,
    title.includes('Comark OpenTUI Demo') ? null : 'title missing from row 0',
  ].filter(Boolean)

  if (problems.length > 0) {
    console.error(`\n✗ chrome shifted (${label}):\n${problems.map((p) => `  - ${p}`).join('\n')}`)
    process.exit(1)
  }
}

/**
 * Body rows, excluding the chrome. Used to check what streaming actually shows.
 */
function bodyRows() {
  const rows = (chrome.captureCharFrame() as string).split('\n')

  return rows
    .slice(2, 39)
    .map((row) => row.trimEnd())
    .filter((row) => row !== '')
}

await pump(chrome, 12)
chromeRows('static')

const staticRows = bodyRows().length

const keys = createMockKeys((chrome as unknown as { renderer: never }).renderer)

// Wrapped because the handler sets React state.
await act(async () => {
  keys.pressKey('s')
})

/*
 * The first streamed frames are where two defects showed up:
 *
 *   - the previous document was held while the new parse ran, so pressing `s`
 *     left the whole document on screen for a frame before it restarted;
 *   - the replay began at character zero, and `---` of the frontmatter parses as
 *     a horizontal rule, painting a stray line right under the header's own.
 */
await pump(chrome, 2)

const firstStreamed = bodyRows()

if (firstStreamed.length >= staticRows) {
  console.error(`\n✗ streaming did not restart: ${firstStreamed.length} body rows, static had ${staticRows}`)
  process.exit(1)
}

if (firstStreamed[0]?.includes('────')) {
  console.error(`\n✗ frontmatter streamed as a horizontal rule: ${JSON.stringify(firstStreamed[0])}`)
  process.exit(1)
}

chromeRows('streaming 1')

for (const sample of ['streaming 2', 'streaming 3']) {
  await pump(chrome, 6)
  chromeRows(sample)
}

await act(async () => {
  keys.pressKey('r')
})

await pump(chrome, 8)
chromeRows('back to static')

console.error('✓ chrome holds position across a streaming toggle')
process.exit(0)
