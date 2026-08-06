/** @jsxImportSource @opentui/react */
import type { ElementNode } from 'comark'
import React from 'react'
import { childNodes, isBlockNode } from '../utils.ts'

/**
 * Split a container's rendered children into box-level groups, wrapping every
 * run of inline children in a `text`.
 *
 * OpenTUI enforces this: strings and span-likes throw unless their parent is a
 * text node, so a `li` holding `"a"` and a `li` holding `[p, ul]` cannot use the
 * same container. Markdown mixes the two freely — a task-list item is an `input`
 * span followed by bare text, a loose list item is a paragraph plus a nested
 * list — so containers group rather than pick one shape.
 *
 * Comark hands components rendered React children with no trace of their source
 * flow, hence the paired walk over the original node's children.
 */
/** A newline plus the indentation around it, inside a run of inline text. */
const SOFT_BREAK = /\s*\n\s*/g

/** Host elements OpenTUI only accepts inside a text node. */
const INLINE_HOSTS = new Set(['span', 'b', 'strong', 'i', 'em', 'u', 'a', 'br'])

function isInlineChild(child: React.ReactNode): boolean {
  if (typeof child === 'string' || typeof child === 'number') {
    return true
  }

  return React.isValidElement(child) && typeof child.type === 'string' && INLINE_HOSTS.has(child.type)
}

/**
 * Group inline children into text hosts without consulting the source AST,
 * deciding from the rendered elements alone.
 *
 * Needed where there is no node to pair against — the document root. Comark
 * appends the streaming caret to the last top-level node holding a string, and
 * when that node has none (an `hr`, or the `---` of frontmatter part-way through
 * a stream) it pushes the caret as a top-level node instead. That is a bare
 * `span`, which throws if it lands straight in a box.
 */
export function groupInlineRuns(children: React.ReactNode): React.ReactNode[] {
  const rendered = React.Children.toArray(children)
  const groups: React.ReactNode[] = []
  let run: React.ReactNode[] = []

  const flushRun = () => {
    if (run.length > 0) {
      groups.push(<text key={`inline-${groups.length}`}>{reflowInline(run)}</text>)
      run = []
    }
  }

  for (const child of rendered) {
    if (isInlineChild(child)) {
      run.push(child)
      continue
    }

    flushRun()
    groups.push(child)
  }

  flushRun()

  return groups
}

/**
 * Collapse soft line breaks so the terminal can reflow inline text to its own
 * width.
 *
 * Markdown treats a single newline inside a paragraph as a space, but OpenTUI's
 * text renderer honours `\n` as a hard break — so source wrapped at 80 columns
 * would stay wrapped at 80 in a 200-column terminal. Genuine hard breaks are
 * `br` nodes and pass through untouched, as does fenced code, which never
 * reaches here.
 *
 * Recurses into elements because the newline can fall inside an emphasis run.
 */
export function reflowInline(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return child.replace(SOFT_BREAK, ' ')
    }

    if (!React.isValidElement(child)) {
      return child
    }

    const nested = (child.props as { children?: React.ReactNode }).children

    if (nested === undefined) {
      return child
    }

    return React.cloneElement(child, undefined, reflowInline(nested))
  })
}

export function groupChildrenByFlow(node: ElementNode | undefined, children: React.ReactNode): React.ReactNode[] {
  const rendered = React.Children.toArray(children)
  const nodes = childNodes(node)

  // Pairing only holds when the walker emitted one React child per surviving
  // source child. If anything shifted — a plugin injecting nodes, a shape this
  // renderer has not met — treat the lot as inline: a flattened paragraph reads
  // worse than proper blocks but still renders, where a mispaired block child
  // would throw inside the reconciler.
  if (nodes.length !== rendered.length) {
    return rendered.length > 0 ? [<text key="flow-0">{reflowInline(rendered)}</text>] : []
  }

  const groups: React.ReactNode[] = []
  let run: React.ReactNode[] = []

  const flushRun = () => {
    if (run.length > 0) {
      groups.push(<text key={`flow-${groups.length}`}>{reflowInline(run)}</text>)
      run = []
    }
  }

  nodes.forEach((child, index) => {
    if (isBlockNode(child)) {
      flushRun()
      groups.push(rendered[index])
      return
    }

    run.push(rendered[index])
  })

  flushRun()

  return groups
}
