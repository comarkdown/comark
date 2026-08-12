import type React from 'react'
import {
  Alert,
  Blockquote,
  Checkbox,
  Heading,
  Image,
  ListItem,
  OrderedList,
  Paragraph,
  Rule,
  UnknownTag,
  UnorderedList,
} from './block.tsx'
import { InlineCode, Strikethrough } from './inline.tsx'
import { Math } from './math.tsx'
import { CodeBlock } from './pre.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './table.tsx'

export * from './block.tsx'
export * from './inline.tsx'
export * from './math.tsx'
export * from './pre.tsx'
export * from './table.tsx'
export { groupChildrenByFlow } from './flow.tsx'

/**
 * Tag → renderable map for OpenTUI.
 *
 * `strong`, `em`, `b`, `i`, `u`, `a`, `br` and `span` are deliberately absent:
 * OpenTUI registers all of them as native text-node hosts, so Comark's walker
 * falling through to the tag name already produces the right renderable —
 * including OSC 8 hyperlinks for `a`.
 *
 * Everything else has to be here. An unmapped tag reaches
 * `createInstance` and throws `Unknown component type`, and two of the
 * collisions are silent traps: native `code` is a block-level highlighted panel
 * rather than an inline chip, and native `input` is an interactive field rather
 * than a task-list checkbox.
 */
export const components: Record<string, React.ComponentType<any>> = {
  p: Paragraph,
  h1: Heading,
  h2: Heading,
  h3: Heading,
  h4: Heading,
  h5: Heading,
  h6: Heading,
  blockquote: Blockquote,
  // GitHub alerts. Comark emits these as a blockquote carrying `as: "<kind>"`,
  // and its walker resolves components from `as`, so they must be registered
  // under the kind names rather than under `blockquote`.
  note: Alert,
  tip: Alert,
  important: Alert,
  warning: Alert,
  caution: Alert,
  math: Math,
  hr: Rule,
  img: Image,
  input: Checkbox,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  pre: CodeBlock,
  code: InlineCode,
  del: Strikethrough,
  s: Strikethrough,
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: TableHeaderCell,
  td: TableCell,
}

/**
 * Tags OpenTUI already registers as native text-node hosts. The manifest has to
 * decline these: Comark consults it for anything absent from
 * {@link components}, so answering every tag would shadow the native
 * renderables and flatten bold, italic and links into plain spans.
 */
export const NATIVE_TAGS = new Set(['strong', 'em', 'b', 'i', 'u', 'a', 'br', 'span'])

/**
 * Resolver for every tag outside {@link components} and {@link NATIVE_TAGS} —
 * raw HTML nodes from the html plugin, unregistered `::components`, tags a
 * future Comark version adds. Without it those reach the reconciler and throw,
 * so a terminal fed by a model could be taken down by a stray `<div>`.
 *
 * Returning `undefined` is what lets a tag fall through to its native host.
 */
export function componentsManifest(name: string): React.ComponentType<any> | undefined {
  if (NATIVE_TAGS.has(name)) {
    return undefined
  }

  return UnknownTag
}
