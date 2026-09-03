import type { ElementNode, Node } from 'comark'
import type { ProseContext } from '../types.ts'
import { attrsOf, childrenOf, setClass, takeAttr } from '../utils.ts'

/**
 * Lowers `::steps{level}` into a wrapper the stylesheet numbers with CSS counters:
 * child headings of the given level become the step titles. No restructuring of the
 * children — headings keep their ids and anchor links.
 */
export function lowerSteps(node: ElementNode, ctx: ProseContext): Node | undefined {
  const attrs = attrsOf(node)
  const level = takeAttr(attrs, 'level') ?? '3'

  const rootAttrs: Record<string, unknown> = { ...attrs, 'data-level': level }
  setClass(ctx, rootAttrs, 'prose-steps')
  return ['div', rootAttrs, ...childrenOf(node)]
}
