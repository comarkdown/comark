/** @jsxImportSource @opentui/react */
import { Markdown, Prose, defaultTheme, withNode, type MarkdownTheme } from '@comark/opentui'
import type { ScrollBoxRenderable } from '@opentui/core'
import { useKeyboard } from '@opentui/react'
import { createMarkdownParser, type ElementNode } from 'comark'
import math from 'comark/plugins/math'
import shiki from 'comark/plugins/shiki'
import python from 'shiki/dist/langs/python.mjs'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import React, { useEffect, useRef, useState } from 'react'

const here = dirname(fileURLToPath(import.meta.url))

export const SOURCE = readFileSync(join(here, 'gallery.md'), 'utf-8')

/**
 * Same plugin set as the ANSI demo, so both renderers are driven from an
 * identical parse. Declared at module scope because `Markdown` treats `plugins`
 * as a stable reference.
 *
 * Shiki is what produces the highlighting: it registers vue, tsx, svelte,
 * typescript, javascript, bash, json, yaml and astro by default, and does *not*
 * load languages on demand — an unregistered one is simply left as plain text.
 * Python is in this document, so its grammar is passed explicitly.
 */
export const PLUGINS = [math(), shiki({ languages: [python as never] })]

// Frontmatter never reaches the node tree, so the title is read from a parse of
// its own — the header bar showing it is the proof it was picked up.
const { frontmatter } = await createMarkdownParser({ plugins: PLUGINS })(SOURCE)

export const TITLE = typeof frontmatter?.title === 'string' ? frontmatter.title : 'untitled'

export const THEMES: { name: string; theme: Partial<MarkdownTheme> }[] = [
  { name: 'default', theme: defaultTheme },
  {
    name: 'warm',
    theme: {
      heading: ['#ffd7ba', '#ffb787', '#f0883e', '#d97706', '#a16207', '#a16207'],
      codeFg: '#ffd7ba',
      codeBg: '#2d1b0e',
      quoteBorder: '#f0883e',
      marker: '#f0883e',
      bullet: '▸',
      rule: '#5c3317',
      tableBorder: '#5c3317',
    },
  },
  {
    name: 'mono',
    theme: {
      heading: ['#ffffff', '#ffffff', '#e6e6e6', '#cccccc', '#b3b3b3', '#b3b3b3'],
      codeFg: '#ffffff',
      codeBg: '#1c1c1c',
      quoteBorder: '#666666',
      marker: '#999999',
      bullet: '-',
      muted: '#999999',
      rule: '#444444',
      tableBorder: '#444444',
    },
  },
]

/**
 * Host-supplied component, proving `::alert` reaches user code — including its
 * named slots. `#title` and `#footer` arrive as `slotTitle` / `slotFooter`;
 * `#default` arrives as `children`.
 *
 * `Prose` rather than a bare `{children}`: a one-paragraph body is auto-unwrapped
 * by the parser, so children can be loose strings, which cannot sit directly in
 * a box. `withNode` is what gets `__node` handed over.
 */
const Alert = withNode<{
  type?: string
  children?: React.ReactNode
  slotTitle?: React.ReactNode
  slotFooter?: React.ReactNode
  __node?: ElementNode
}>(({ type, children, slotTitle, slotFooter, __node }) => {
  const color = type === 'warning' ? '#f0883e' : '#58a6ff'

  return (
    <box
      border
      borderStyle="rounded"
      borderColor={color}
      paddingLeft={1}
      paddingRight={1}
      flexDirection="column"
    >
      <text fg={color}>{slotTitle ?? (type ?? 'note').toUpperCase()}</text>
      <Prose node={__node}>{children}</Prose>
      {slotFooter ? <text fg="#8b949e">{slotFooter}</text> : null}
    </box>
  )
})

const COMPONENTS = { alert: Alert }

/**
 * Where the streaming replay starts: just past the frontmatter.
 *
 * Frontmatter is document metadata, not streamed prose — a model emits the body.
 * Replaying from character zero also spends the first frames with `---` parsed as
 * a horizontal rule, which is correct for a partial document but paints a stray
 * line under the header and misrepresents what streaming looks like.
 */
const BODY_START = SOURCE.indexOf('\n---\n', 3) + '\n---\n'.length
const BODY_LENGTH = SOURCE.length - BODY_START

/** Characters appended per tick when replaying the document as a stream. */
const STREAM_CHUNK = 4
const STREAM_INTERVAL_MS = 16

export interface GalleryProps {
  onQuit?: () => void
  /** Start on a given theme — used by the smoke test. */
  initialThemeIndex?: number
}

export function Gallery({ onQuit, initialThemeIndex = 0 }: GalleryProps) {
  const [themeIndex, setThemeIndex] = useState(initialThemeIndex)
  const [streaming, setStreaming] = useState(false)
  // Counts body characters, so 0 means "frontmatter only".
  const [revealed, setRevealed] = useState(BODY_LENGTH)
  const scroller = useRef<ScrollBoxRenderable | null>(null)

  // Replay the document as if it were arriving from a model — this is what
  // exercises auto-close: half-written `**bold` and unterminated fences.
  useEffect(() => {
    if (!streaming) {
      return
    }

    const id = setInterval(() => {
      setRevealed((count) => {
        if (count >= BODY_LENGTH) {
          clearInterval(id)
          return count
        }

        return Math.min(count + STREAM_CHUNK, BODY_LENGTH)
      })
    }, STREAM_INTERVAL_MS)

    return () => clearInterval(id)
  }, [streaming])

  useKeyboard((key) => {
    switch (key.name) {
      case 'q':
      case 'escape':
        onQuit?.()
        break
      case 't':
        setThemeIndex((index) => (index + 1) % THEMES.length)
        break
      case 's':
        setStreaming((on) => !on)
        setRevealed((count) => (count >= BODY_LENGTH ? 0 : count))
        break
      case 'r':
        setStreaming(false)
        setRevealed(BODY_LENGTH)
        break
      case 'down':
        scroller.current?.scrollBy(2)
        break
      case 'up':
        scroller.current?.scrollBy(-2)
        break
      case 'pagedown':
      case 'space':
        scroller.current?.scrollBy(20)
        break
      case 'pageup':
        scroller.current?.scrollBy(-20)
        break
      case 'home':
        scroller.current?.scrollTo(0)
        break
    }
  })

  const active = THEMES[themeIndex]!
  const source = streaming ? SOURCE.slice(0, BODY_START + revealed) : SOURCE
  const progress = streaming ? ` ${Math.round((revealed / BODY_LENGTH) * 100)}%` : ''

  return (
    <box
      flexDirection="column"
      flexGrow={1}
    >
      {/*
       * `flexShrink={0}` on the chrome and `minHeight={0}` on the scroll region:
       * a flex child will not shrink below its content height by default, so a
       * long document made the scrollbox hold its ground and Yoga took the rows
       * out of the header instead — collapsing it to one row and drawing its
       * bottom border straight through the title. Shorter content, as in the
       * first frames of a streaming replay, released the pressure and the header
       * grew back, which read as the chrome jumping.
       */}
      <box
        border={['bottom']}
        borderStyle="single"
        borderColor="#30363d"
        paddingLeft={1}
        paddingRight={1}
        flexShrink={0}
      >
        <text fg="#8b949e">
          {`${TITLE}  ·  theme: ${active.name}  ·  ${streaming ? `streaming${progress}` : 'static'}`}
        </text>
      </box>

      <scrollbox
        ref={scroller}
        flexGrow={1}
        flexShrink={1}
        minHeight={0}
        paddingLeft={1}
        paddingRight={1}
      >
        <Markdown
          streaming={streaming}
          caret={streaming}
          theme={active.theme}
          components={COMPONENTS}
          plugins={PLUGINS}
        >
          {source}
        </Markdown>
      </scrollbox>

      <box
        border={['top']}
        borderStyle="single"
        borderColor="#30363d"
        paddingLeft={1}
        paddingRight={1}
        flexShrink={0}
      >
        <text fg="#8b949e">↑↓ pgup/pgdn scroll · s stream · r reset · t theme · q quit</text>
      </box>
    </box>
  )
}
