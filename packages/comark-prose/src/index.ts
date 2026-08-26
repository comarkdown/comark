import type { ElementNode, Node } from 'comark'
import { defineComarkPlugin } from 'comark'
import type { ProseComponentsOptions, ProseContext, ProseOptions } from './types.ts'
import { attrsOf, concatClass, isElement, setClass } from './utils.ts'
import { lowerCallout } from './lower/callout.ts'
import { lowerTabs } from './lower/tabs.ts'
import { lowerCodeGroup } from './lower/code-group.ts'
import { lowerAccordion } from './lower/accordion.ts'
import { lowerSteps } from './lower/steps.ts'
import { lowerPre } from './lower/copy.ts'
import { lowerHeading } from './lower/headings.ts'
import { lowerTable } from './lower/table.ts'

export type * from './types.ts'

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const CALLOUT_TAGS = new Set(['callout', 'note', 'tip', 'important', 'warning', 'caution', 'blockquote'])

function resolveCopy(components: false | ProseComponentsOptions): ProseContext['copy'] {
  if (components === false || components.copy === false) return false
  if (components.copy === undefined || components.copy === true) return {}
  return components.copy
}

/** True when `node` is already the lowered wrapper produced by a previous pass. */
function isWrapper(parent: ElementNode | undefined, tag: string, className: string): boolean {
  if (!parent || parent[0] !== tag) return false
  const cls = parent[1]?.class
  return typeof cls === 'string' && cls.split(' ').includes(className)
}

function transformNode(
  node: ElementNode,
  parent: ElementNode | undefined,
  ctx: ProseContext
): Node | false | undefined {
  const tag = node[0]

  const userTransform = ctx.transform?.[tag]
  if (userTransform) {
    const result = userTransform(node)
    if (result !== undefined) return result
  }

  const themeClass = ctx.classes?.[tag]
  if (themeClass) {
    const resolved = typeof themeClass === 'function' ? themeClass(node) : themeClass
    if (resolved) setClass(ctx, attrsOf(node), resolved)
  }

  const components = ctx.components
  if (components !== false) {
    if (CALLOUT_TAGS.has(tag) && components.callout !== false) {
      const lowered = lowerCallout(node, ctx)
      if (lowered) return lowered
    }
    if (tag === 'tabs' && components.tabs !== false) return lowerTabs(node, ctx)
    if (tag === 'code-group' && components.codeGroup !== false) return lowerCodeGroup(node, ctx)
    if (tag === 'steps' && components.steps !== false) return lowerSteps(node, ctx)
    if (tag === 'accordion' && components.accordion !== false) return lowerAccordion(node, ctx)
    // Guard against re-lowering on streaming re-parses, where already-lowered nodes are reused.
    if (tag === 'pre' && !isWrapper(parent, 'figure', 'prose-pre')) return lowerPre(node, ctx)
  }

  if (ctx.elements !== false) {
    if (tag === 'table') return lowerTable(node, parent, ctx)
    if (HEADING_TAGS.has(tag)) lowerHeading(node, ctx)
  }

  return undefined
}

function walk(node: Node, parent: ElementNode | undefined, ctx: ProseContext): Node | false {
  if (!isElement(node)) return node

  // Never descend into code blocks: highlighters own that subtree.
  // Forward order keeps generated ids in document order.
  if (node[0] !== 'pre') {
    for (let i = 2; i < node.length; i++) {
      const result = walk(node[i] as Node, node, ctx)
      if (result === false) node.splice(i--, 1)
      else node[i] = result
    }
  }

  return transformNode(node, parent, ctx) ?? node
}

/**
 * `prose` — framework-agnostic prose for Comark.
 *
 * Lowers component tags (`::callout`, `::tabs`, `::code-group`, `::steps`, `::accordion`,
 * GFM alerts) and structural elements (heading anchors, table scroll wrappers, code-block
 * copy buttons) into plain HTML at parse time. Every renderer benefits: Vue, React,
 * Svelte, Angular, and `@comark/html` string output.
 *
 * Styling is decoupled: use `@comark/prose/components.css` (token-driven, `:where()`
 * scoped), any prose stylesheet (Tailwind Typography, shadcn Typeset), or pass a
 * `classes` map for utility-class design systems. Interactivity is decoupled too: the
 * optional `@comark/prose/client` runtime (~2 kB) upgrades `<prose-tabs>` and
 * `<prose-copy>`; without it, tabs render stacked and copy buttons stay hidden.
 *
 * @example
 * ```ts
 * import { parseMarkdown } from 'comark'
 * import prose from '@comark/prose'
 *
 * const tree = await parseMarkdown(markdown, { plugins: [prose()] })
 * ```
 */
export default defineComarkPlugin((options: ProseOptions = {}) => {
  return {
    name: 'prose',
    post(state) {
      // Per-document id counters keep SSR markup deterministic.
      const counters: Record<string, number> = {}
      const ctx: ProseContext = {
        elements: options.elements ?? {},
        components: options.components ?? {},
        classes: options.classes,
        mergeClass: options.mergeClass ?? concatClass,
        transform: options.transform,
        copy: resolveCopy(options.components ?? {}),
        nextId: (kind) => `prose-${kind}-${(counters[kind] = (counters[kind] ?? 0) + 1)}`,
      }

      const nodes = state.tree.nodes
      for (let i = 0; i < nodes.length; i++) {
        const result = walk(nodes[i]!, undefined, ctx)
        if (result === false) nodes.splice(i--, 1)
        else nodes[i] = result
      }
    },
  }
})
