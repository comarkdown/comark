/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import type { ElementNode } from 'comark'
import React, { createContext, useContext } from 'react'
import { useMarkdownTheme } from '../theme.ts'
import { contentNode, withNode } from '../utils.ts'
import { groupChildrenByFlow, reflowInline } from './flow.tsx'

interface ChildrenProps {
  children?: React.ReactNode
}

interface NodeProps extends ChildrenProps {
  __node?: ElementNode
}

export const Paragraph: React.FC<ChildrenProps> = ({ children }) => {
  return <text>{reflowInline(children)}</text>
}

/**
 * One component for `h1`–`h6`: the level is read off the source node rather
 * than passed per tag, so the map can point all six at this.
 *
 * No `#` prefix — weight and colour carry the hierarchy, matching how OpenTUI's
 * own markdown renderable presents headings.
 */
export const Heading = withNode<NodeProps>(({ children, __node }) => {
  const theme = useMarkdownTheme()
  const level = Number(__node?.[0]?.slice(1)) || 1
  const fg = theme.heading[Math.min(level, theme.heading.length) - 1]

  return (
    <text
      fg={fg}
      attributes={TextAttributes.BOLD}
    >
      {reflowInline(children)}
    </text>
  )
})

/**
 * Blockquote. The left bar is the box's own left border, so it spans the
 * quote's full height for free instead of needing a glyph per wrapped line.
 */
export const Blockquote = withNode<NodeProps>(({ children, __node }) => {
  const theme = useMarkdownTheme()

  return (
    <box
      flexDirection="column"
      gap={1}
      border={['left']}
      borderStyle="single"
      borderColor={theme.quoteBorder}
      paddingLeft={1}
    >
      {groupChildrenByFlow(__node, children)}
    </box>
  )
})

/**
 * GitHub alert (`> [!NOTE]`, `> [!WARNING]`, …).
 *
 * Comark parses these as `["blockquote", { as: "note" }, …]`, and its walker
 * resolves the component from `as` when present — so these never reach
 * {@link Blockquote} and have to be mapped under the alert names themselves.
 * The kind is read back off `as`, letting all five share one component.
 */
export const Alert = withNode<NodeProps>(({ children, __node }) => {
  const theme = useMarkdownTheme()
  const kind = String(__node?.[1]?.as ?? 'note').toLowerCase()
  const color = theme.alert[kind] ?? theme.quoteBorder

  return (
    <box
      flexDirection="column"
      border={['left']}
      borderStyle="single"
      borderColor={color}
      paddingLeft={1}
    >
      <text
        fg={color}
        attributes={TextAttributes.BOLD}
      >
        {kind.toUpperCase()}
      </text>
      <Prose node={__node}>{children}</Prose>
    </box>
  )
})

export const Rule: React.FC = () => {
  const theme = useMarkdownTheme()

  return (
    <box
      border={['top']}
      borderStyle="single"
      borderColor={theme.rule}
    />
  )
}

/**
 * Images degrade to their alt text. A terminal cannot show the bitmap and the
 * alt text is the only thing a reader can act on.
 */
export const Image: React.FC<{ alt?: string; src?: string }> = ({ alt, src }) => {
  const theme = useMarkdownTheme()

  return <span fg={theme.muted}>{`[${alt || src || 'image'}]`}</span>
}

/**
 * Task-list checkbox. Comark emits GFM task items as an `input` node, and
 * OpenTUI's native `input` is an interactive text field — mapping this is what
 * keeps `- [x] done` from mounting a focusable widget mid-sentence.
 */
export const Checkbox: React.FC<{ checked?: unknown }> = ({ checked }) => {
  const done = checked === true || checked === 'true'

  // No trailing space: Comark keeps the source's own separator on the text node
  // that follows, so adding one here doubles it.
  return <span>{done ? '[x]' : '[ ]'}</span>
}

interface ListItemContextValue {
  ordered: boolean
  /** 1-based ordinal, already offset by an `ol`'s `start`. */
  index: number
}

const ListItemContext = createContext<ListItemContextValue>({ ordered: false, index: 1 })

interface ListProps extends ChildrenProps {
  start?: number | string
}

function List({ children, ordered, start }: ListProps & { ordered: boolean }) {
  const base = ordered ? Number(start ?? 1) || 1 : 1
  let ordinal = 0

  const items = React.Children.map(children, (child) => {
    // A list's children are `li` elements; anything else is stray inline content
    // that still needs a text host to live in.
    if (!React.isValidElement(child)) {
      return <text>{child}</text>
    }

    const value: ListItemContextValue = { ordered, index: base + ordinal++ }

    return <ListItemContext.Provider value={value}>{child}</ListItemContext.Provider>
  })

  return <box flexDirection="column">{items}</box>
}

export const UnorderedList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    ordered={false}
  />
)

export const OrderedList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    ordered
  />
)

/**
 * List item. Marker and body are siblings in a row so the body owns the
 * remaining width and wrapped lines hang under the first character rather than
 * under the bullet — Yoga does what the ANSI renderer has to do by padding
 * strings.
 */
export const ListItem = withNode<NodeProps>(({ children, __node }) => {
  const theme = useMarkdownTheme()
  const { ordered, index } = useContext(ListItemContext)
  const marker = ordered ? `${index}. ` : `${theme.bullet} `

  return (
    <box flexDirection="row">
      <text fg={theme.marker}>{marker}</text>
      <box
        flexDirection="column"
        flexGrow={1}
      >
        {groupChildrenByFlow(__node, children)}
      </box>
    </box>
  )
})

/**
 * Container for markdown children of unknown shape. Use this in custom
 * `::component` implementations instead of dropping `children` straight into a
 * `box`.
 *
 * A component's body arrives in one of two shapes and the difference is not
 * visible from `children` alone: Comark's `autoUnwrap` strips the paragraph off
 * a single-paragraph body, so `::alert` with one line hands over bare strings
 * and inline nodes, while a multi-paragraph body hands over `p` elements. Bare
 * strings inside a `box` make OpenTUI throw `Text must be created inside of a
 * text node`, so the two cannot share a container.
 *
 * Pass the `__node` a component receives via {@link withNode} so the children
 * can be matched against their source.
 *
 * @example
 * ```tsx
 * const Alert = withNode(({ children, __node }) => (
 *   <box border borderStyle="rounded" paddingLeft={1}>
 *     <Prose node={__node}>{children}</Prose>
 *   </box>
 * ))
 * ```
 */
export function Prose({ children, node, __node, gap = 1 }: NodeProps & { gap?: number; node?: ElementNode }) {
  return (
    <box
      flexDirection="column"
      gap={gap}
    >
      {groupChildrenByFlow(contentNode(node ?? __node), children)}
    </box>
  )
}

/**
 * Fallback for tags this renderer has no opinion on — most importantly the raw
 * HTML Comark's html plugin emits (`<div>` in a markdown source becomes a `div`
 * node). Unmapped, those reach OpenTUI's reconciler and throw
 * `Unknown component type`, which for an LLM-fed terminal means arbitrary model
 * output can take the UI down.
 *
 * Inline or block is read off the `$.block` meta the html plugin sets, because
 * the two need different containers and picking wrong throws either way: a box
 * inside a text node, or a span outside one. Tags with no meta (an unregistered
 * `::component`) are treated as block, matching MDC's block-by-default syntax.
 */
export const UnknownTag = withNode<NodeProps>(({ children, __node }) => {
  if (__node?.[1]?.$?.block === 0) {
    return <span>{children}</span>
  }

  return <Prose node={__node}>{children}</Prose>
})
