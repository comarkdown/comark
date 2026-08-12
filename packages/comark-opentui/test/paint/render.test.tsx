/** @jsxImportSource @opentui/react */
import type { CapturedFrame } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import type { ElementNode } from 'comark'
import math from 'comark/plugins/math'
import shiki from 'comark/plugins/shiki'
import python from 'shiki/dist/langs/python.mjs'
import { createRequire } from 'node:module'
import React, { act } from 'react'
import { describe, expect, it } from 'vitest'
import { Markdown, Prose } from '../../src/index.tsx'

/**
 * OpenTUI paints through native FFI, which Node only exposes from 26.1 behind
 * `--experimental-ffi`. Run these with `pnpm test:paint`; on an older Node — as
 * on any CI pinned below 26 — they skip rather than fail, and the runtime-
 * agnostic half of the suite still covers tag resolution and layout logic.
 */
const FFI_AVAILABLE = (() => {
  try {
    createRequire(import.meta.url)('node:ffi')
    return true
  } catch {
    return false
  }
})()

const paint = describe.skipIf(!FFI_AVAILABLE)

/**
 * Paint markdown into a headless terminal and return the resulting character
 * grid.
 *
 * Each pump is wrapped in `act` because parsing runs through `use()` behind
 * Suspense: `testRender` only wraps the initial mount, which commits the
 * fallback, so the resolved parse needs a further flush before anything reaches
 * the screen. Repeating then gives fenced code time to finish highlighting,
 * which is asynchronous.
 */
async function frameFor(
  source: string,
  options: {
    width?: number
    frames?: number
    components?: Record<string, any>
    plugins?: any[]
    streaming?: boolean
    caret?: boolean
  } = {}
) {
  const ui = await testRender(
    <Markdown
      components={options.components}
      plugins={options.plugins}
      streaming={options.streaming}
      caret={options.caret}
    >
      {source}
    </Markdown>,
    {
      width: options.width ?? 60,
      height: 24,
    }
  )

  const frames = options.frames ?? 8

  for (let i = 0; i < frames; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
    })

    await ui.renderOnce()
  }

  return ui.captureCharFrame() as string
}

paint('inline flow', () => {
  it('renders emphasis, strikethrough, inline code and links as text', async () => {
    const frame = await frameFor('plain **bold** _italic_ ~~struck~~ `code` [link](https://example.com)')

    expect(frame).toContain('plain')
    expect(frame).toContain('bold')
    expect(frame).toContain('italic')
    expect(frame).toContain('struck')
    expect(frame).toContain('code')
    expect(frame).toContain('link')
  })

  it('renders headings without markup', async () => {
    const frame = await frameFor('# Title\n\n## Subtitle')

    expect(frame).toContain('Title')
    expect(frame).toContain('Subtitle')
    expect(frame).not.toContain('#')
  })

  it('degrades images to alt text', async () => {
    const frame = await frameFor('![a diagram](diagram.png)')

    expect(frame).toContain('[a diagram]')
  })
})

paint('lists', () => {
  it('renders a tight list with bullets', async () => {
    const frame = await frameFor('- first\n- second')

    expect(frame).toContain('• first')
    expect(frame).toContain('• second')
  })

  it('numbers an ordered list', async () => {
    const frame = await frameFor('1. one\n2. two')

    expect(frame).toContain('1. one')
    expect(frame).toContain('2. two')
  })

  it('honours an ordered list start offset', async () => {
    const frame = await frameFor('4. four\n5. five')

    expect(frame).toContain('4. four')
    expect(frame).toContain('5. five')
  })

  it('renders a nested list', async () => {
    const frame = await frameFor('- outer\n  - inner')

    expect(frame).toContain('outer')
    expect(frame).toContain('inner')
  })

  /**
   * Comark emits GFM task items as an `input` node next to bare text. OpenTUI's
   * native `input` is an interactive field, so an unmapped tag would mount a
   * focusable widget mid-sentence instead of a checkbox.
   */
  it('renders task list checkboxes', async () => {
    const frame = await frameFor('- [x] done\n- [ ] todo')

    expect(frame).toContain('[x] done')
    expect(frame).toContain('[ ] todo')
  })
})

paint('blocks', () => {
  it('renders fenced code with its body', async () => {
    const frame = await frameFor('```ts\nconst answer = 42\n```')

    expect(frame).toContain('const answer = 42')
    expect(frame).not.toContain('```')
  })

  it('renders unlabelled fences', async () => {
    const frame = await frameFor('```\nplain text\n```')

    expect(frame).toContain('plain text')
  })

  it('renders a blockquote body', async () => {
    const frame = await frameFor('> quoted **text**')

    expect(frame).toContain('quoted')
    expect(frame).toContain('text')
  })

  it('renders a horizontal rule between paragraphs', async () => {
    const frame = await frameFor('above\n\n---\n\nbelow')

    expect(frame).toContain('above')
    expect(frame).toContain('below')
    expect(frame).toContain('─')
  })

  it('renders a fence nested in a list item', async () => {
    const frame = await frameFor('- run this:\n\n  ```bash\n  ls -la\n  ```')

    expect(frame).toContain('run this:')
    expect(frame).toContain('ls -la')
  })
})

paint('tables', () => {
  it('renders header and body cells', async () => {
    const frame = await frameFor('| name | size |\n| --- | --- |\n| alpha | 10 |\n| beta | 200 |')

    expect(frame).toContain('name')
    expect(frame).toContain('size')
    expect(frame).toContain('alpha')
    expect(frame).toContain('200')
  })

  it('aligns a column to its widest cell', async () => {
    const frame = await frameFor('| a | b |\n| --- | --- |\n| wiiiiiiiide | x |\n| s | y |')
    const rows = frame.split('\n')
    const wide = rows.find((row) => row.includes('wiiiiiiiide'))
    const narrow = rows.find((row) => row.trimEnd().startsWith('s '))

    expect(wide).toBeDefined()
    expect(narrow).toBeDefined()
    expect(narrow!.indexOf('y')).toBe(wide!.indexOf('x'))
  })
})

/**
 * Model output is not trusted markdown. Comark's html plugin is on by default,
 * so a stray tag becomes a node with that tag name — which reaches OpenTUI's
 * reconciler and throws `Unknown component type` unless the renderer resolves
 * it. These cover the crash, not the styling.
 */
paint('untrusted input', () => {
  it('renders a raw HTML block without throwing', async () => {
    const frame = await frameFor('<div class="x">inside a div</div>')

    expect(frame).toContain('inside a div')
  })

  it('renders raw inline HTML without throwing', async () => {
    const frame = await frameFor('before <mark>marked</mark> after')

    expect(frame).toContain('before')
    expect(frame).toContain('marked')
    expect(frame).toContain('after')
  })

  it('renders an unregistered component block without throwing', async () => {
    const frame = await frameFor('::alert\nheads up\n::')

    expect(frame).toContain('heads up')
  })
})

/**
 * The reason to reach for Comark in a streaming UI: the parser closes dangling
 * constructs, so a half-arrived `**bold` renders as bold text rather than
 * flashing its asterisks until the closer lands.
 */
paint('streaming', () => {
  it('auto-closes an unterminated emphasis run', async () => {
    const frame = await frameFor('here is **bo')

    expect(frame).toContain('here is')
    expect(frame).toContain('bo')
    expect(frame).not.toContain('**')
  })

  it('auto-closes an unterminated fence', async () => {
    const frame = await frameFor('```ts\nconst partial =')

    expect(frame).toContain('const partial =')
    expect(frame).not.toContain('```')
  })
})

/**
 * A component's body arrives in two shapes: `autoUnwrap` strips the paragraph
 * from a single-paragraph body, handing over bare strings, while a
 * multi-paragraph body hands over `p` elements. A host component that drops
 * `children` straight into a box throws on the first shape, which is why
 * `Prose` exists.
 */
paint('custom components', () => {
  function Card({ children, __node }: { children?: React.ReactNode; __node?: ElementNode }) {
    return (
      <box
        flexDirection="column"
        border
        borderStyle="single"
      >
        <Prose node={__node}>{children}</Prose>
      </box>
    )
  }
  Card.propTypes = { __node: null }

  it('renders an auto-unwrapped single-paragraph body', async () => {
    const frame = await frameFor('::card\none line with **bold**\n::', { components: { card: Card } })

    expect(frame).toContain('one line with')
    expect(frame).toContain('bold')
  })

  it('renders a multi-paragraph body', async () => {
    const frame = await frameFor('::card\nfirst para\n\nsecond para\n::', {
      components: { card: Card },
    })

    expect(frame).toContain('first para')
    expect(frame).toContain('second para')
  })

  it('renders a body mixing inline text and a list', async () => {
    const frame = await frameFor('::card\nintro text\n\n- item one\n- item two\n::', {
      components: { card: Card },
    })

    expect(frame).toContain('intro text')
    expect(frame).toContain('• item one')
  })
})

/**
 * Markdown soft-wraps: a single newline inside a paragraph is a space. OpenTUI
 * honours `\n` as a hard break, so without collapsing them a model's 80-column
 * output would stay 80 columns wide in a 200-column terminal.
 */
paint('soft line breaks', () => {
  it('reflows source newlines to the terminal width', async () => {
    const frame = await frameFor('one two three\nfour five six\nseven eight nine', { width: 70 })
    const firstRow = frame.split('\n')[0]!

    expect(firstRow).toContain('one two three four five six seven eight nine')
  })

  it('keeps an explicit hard break', async () => {
    const frame = await frameFor('before  \nafter', { width: 70 })
    const rows = frame.split('\n').map((row) => row.trim())

    expect(rows[0]).toBe('before')
    expect(rows[1]).toBe('after')
  })
})

/**
 * GitHub alerts parse to a blockquote carrying `as: "<kind>"`, and Comark's
 * walker resolves components from `as` — so these bypass the blockquote
 * component entirely and are only styled if registered under the kind names.
 */
paint('github alerts', () => {
  const KINDS = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']

  for (const kind of KINDS) {
    it(`renders a ${kind} alert with its label and body`, async () => {
      const frame = await frameFor(`> [!${kind}]\n> Body of the ${kind} alert.`)

      expect(frame).toContain(kind)
      expect(frame).toContain(`Body of the ${kind} alert.`)
    })
  }

  it('keeps a plain blockquote free of an alert label', async () => {
    const frame = await frameFor('> just a quote')

    expect(frame).toContain('just a quote')
    expect(frame).not.toContain('NOTE')
  })
})

paint('fence header', () => {
  it('shows the language and the filename', async () => {
    const frame = await frameFor('```typescript [main.ts]\nconst a = 1\n```')

    expect(frame).toContain('typescript')
    expect(frame).toContain('main.ts')
    expect(frame).toContain('const a = 1')
  })

  it('shows the language alone when there is no filename', async () => {
    const frame = await frameFor('```python\nx = 1\n```')

    expect(frame).toContain('python')
    expect(frame).toContain('x = 1')
  })

  it('adds no header to an unlabelled fence', async () => {
    const frame = await frameFor('```\nbare body\n```')
    const rows = frame
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)

    expect(rows[0]).toBe('bare body')
  })
})

/**
 * Math nodes carry no `$.block` meta, so without a component of their own the
 * generic fallback treats inline math as block — a box inside a paragraph's text
 * node. This is the crash case, not a styling preference.
 */
paint('math', () => {
  it('renders inline math inside its paragraph', async () => {
    const frame = await frameFor('energy $E = mc^2$ matters', { plugins: [math()] })
    const row = frame.split('\n').find((line) => line.includes('energy'))

    expect(row).toContain('E = mc^2')
    expect(row).toContain('matters')
  })

  it('renders block math on its own', async () => {
    const frame = await frameFor('$$\n\\frac{a}{b}\n$$', { plugins: [math()] })

    expect(frame).toContain('\\frac{a}{b}')
  })
})

paint('component slots', () => {
  function Panel({
    children,
    slotTitle,
    slotFooter,
    __node,
  }: {
    children?: React.ReactNode
    slotTitle?: React.ReactNode
    slotFooter?: React.ReactNode
    __node?: ElementNode
  }) {
    return (
      <box flexDirection="column">
        <text>{slotTitle}</text>
        <Prose node={__node}>{children}</Prose>
        <text>{slotFooter}</text>
      </box>
    )
  }
  Panel.propTypes = { __node: null }

  it('passes named slots as slot props and the default slot as children', async () => {
    const frame = await frameFor('::panel\n#title\nThe title\n\n#default\nThe **body**.\n\n#footer\nThe footer\n::', {
      components: { panel: Panel },
    })

    expect(frame).toContain('The title')
    expect(frame).toContain('The')
    expect(frame).toContain('body')
    expect(frame).toContain('The footer')
  })

  it('renders a block default slot as blocks, not one flattened line', async () => {
    const frame = await frameFor('::panel\n#default\nintro\n\n- one\n- two\n::', {
      components: { panel: Panel },
    })

    expect(frame).toContain('intro')
    expect(frame).toContain('• one')
    expect(frame).toContain('• two')
  })
})

/**
 * With the Shiki plugin on, the code node is rewritten into per-token spans.
 * This renderer highlights with tree-sitter instead, reading the body back out
 * of the node — so the fence has to survive that rewrite intact.
 */
paint('shiki plugin interop', () => {
  it('renders a Shiki-tokenised fence as clean source', async () => {
    const frame = await frameFor('```ts [x.ts]\nconst answer = 42\n```', { plugins: [shiki()] })

    expect(frame).toContain('const answer = 42')
    expect(frame).toContain('x.ts')
    expect(frame).not.toContain('shiki')
    expect(frame).not.toContain('--shiki-dark')
  })
})

/** Distinct foreground colours on the painted line containing `needle`. */
async function lineColorsFor(source: string, needle: string, options: Parameters<typeof frameFor>[1] = {}) {
  const captured = await captureFor(source, options)
  const line = captured.lines.find((row) =>
    row.spans
      .map((span) => span.text)
      .join('')
      .includes(needle)
  )

  if (!line) {
    throw new Error(`no painted line contains ${JSON.stringify(needle)}`)
  }

  const colors = new Set<string>()

  for (const span of line.spans) {
    if (span.text.trim() !== '' && span.fg) {
      colors.add(span.fg.toString())
    }
  }

  return colors
}

/** Distinct foreground colours present in a painted frame. */
async function captureFor(source: string, options: Parameters<typeof frameFor>[1] = {}): Promise<CapturedFrame> {
  const ui = await testRender(
    <Markdown
      components={options.components}
      plugins={options.plugins}
    >
      {source}
    </Markdown>,
    { width: options.width ?? 60, height: 24 }
  )

  for (let i = 0; i < (options.frames ?? 8); i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
    })
    await ui.renderOnce()
  }

  return ui.captureSpans()
}

async function colorsFor(source: string, options: Parameters<typeof frameFor>[1] = {}) {
  const captured = await captureFor(source, options)
  const colors = new Set<string>()

  for (const line of captured.lines) {
    for (const span of line.spans) {
      if (span.text.trim() === '' || !span.fg) {
        continue
      }

      colors.add(span.fg.toString())
    }
  }

  return colors
}

/**
 * Highlighting comes from the Shiki plugin's own token colours when it is
 * registered. The tree-sitter path needs grammars the host has to install
 * (`addDefaultParsers`; OpenTUI ships none), so without this a fence paints in
 * one flat colour.
 */
const PY_FENCE = '```python\ndef fib(n: int) -> int:\n    return n\n```'

paint('syntax highlighting', () => {
  it('paints a Shiki-highlighted fence in several colours', async () => {
    const colors = await colorsFor('```ts\nconst answer = 42\n```', { plugins: [shiki()] })

    expect(colors.size).toBeGreaterThan(2)
  })

  /**
   * Shiki registers a fixed language set — vue, tsx, svelte, typescript,
   * javascript, bash, json, yaml, astro — and does not load on demand, so a
   * language outside it needs its grammar passed in. Asserted on the code line
   * rather than the whole frame, because the fence header alone would otherwise
   * supply a second colour and hide the difference.
   */
  it('leaves a language outside the default set unhighlighted', async () => {
    const colors = await lineColorsFor(PY_FENCE, 'def fib', { plugins: [shiki()] })

    expect(colors.size).toBe(1)
  })

  it('highlights that language once its grammar is registered', async () => {
    const colors = await lineColorsFor(PY_FENCE, 'def fib', {
      plugins: [shiki({ languages: [python as never] })],
    })

    expect(colors.size).toBeGreaterThan(1)
  })

  it('paints more colours with the plugin than without it', async () => {
    const fence = '```ts\nconst answer = 42\nfunction go() { return answer }\n```'
    const highlighted = await colorsFor(fence, { plugins: [shiki()] })
    const plain = await colorsFor(fence)

    expect(highlighted.size).toBeGreaterThan(plain.size)
  })

  it('still renders the body verbatim when highlighted', async () => {
    const frame = await frameFor('```ts\nconst answer = 42\n```', { plugins: [shiki()] })

    expect(frame).toContain('const answer = 42')
  })

  it('preserves blank lines inside a highlighted fence', async () => {
    const frame = await frameFor('```ts\nconst a = 1\n\nconst b = 2\n```', { plugins: [shiki()] })
    const rows = frame.split('\n').map((row) => row.trimEnd())
    const first = rows.indexOf('const a = 1')
    const second = rows.indexOf('const b = 2')

    expect(first).toBeGreaterThan(-1)
    expect(second).toBe(first + 2)
  })
})

/**
 * Comark looks for somewhere to attach the streaming caret only in the *last*
 * top-level node, and pushes it as a top-level node when that one holds no text
 * (`MarkdownDocument.tsx`). The caret is a bare `span`, so an `hr` — which is
 * also what the `---` of frontmatter looks like part-way through a stream —
 * would otherwise put it straight into the root box and throw.
 */
paint('streaming caret', () => {
  it('renders a caret after a trailing rule', async () => {
    const frame = await frameFor('text above\n\n---', { streaming: true, caret: true })

    expect(frame).toContain('text above')
  })

  it('renders a bare rule with a caret', async () => {
    const frame = await frameFor('---', { streaming: true, caret: true })

    expect(frame).toContain('─')
  })

  it('renders opening frontmatter fence with a caret', async () => {
    const frame = await frameFor('---\ntitle: Demo', { streaming: true, caret: true })

    expect(frame).toBeTypeOf('string')
  })

  it('renders a caret mid-paragraph', async () => {
    const frame = await frameFor('a streamed sentence', { streaming: true, caret: true })

    expect(frame).toContain('a streamed sentence')
  })

  it('survives every prefix of a document that mixes blocks', async () => {
    const source = 'para one\n\n---\n\n- item\n\n```ts\nconst a = 1\n```\n\n> quote'

    for (let length = 1; length <= source.length; length += 3) {
      const frame = await frameFor(source.slice(0, length), {
        streaming: true,
        caret: true,
        frames: 2,
      })

      expect(frame, `threw or blanked at prefix length ${length}`).toBeTypeOf('string')
    }
  })
})
