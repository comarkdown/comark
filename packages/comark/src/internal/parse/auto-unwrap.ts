import type { Node } from 'comark'

/**
 * Applies automatic unwrapping to container components.
 *
 * This utility removes unnecessary paragraph wrappers from container component children.
 * If a container has only a single paragraph child (and no other block elements),
 * the paragraph is unwrapped and its children are hoisted up to be direct children
 * of the container.
 *
 * @param node - The Comark element to process
 * @returns The node with auto-unwrapped children (if applicable)
 *
 * @example
 * // Before:
 * { tag: 'alert', children: [{ type: 'element', tag: 'p', children: [{ type: 'text', value: 'Text' }] }] }
 *
 * // After:
 * { tag: 'alert', children: [{ type: 'text', value: 'Text' }] }
 */
function isMarkdownParagraph(child: Node): child is [string, Record<string, unknown>, ...Node[]] {
  return Array.isArray(child) && child[0] === 'p' && !(child[1] as Record<string, unknown> | undefined)?.$
}

export function applyAutoUnwrap(node: Node): Node {
  if (typeof node === 'string' || node.length < 2) {
    return node
  }

  const [tag, props, ...children] = node

  // Recurse first so nested HTML wrappers (details → details → p) unwrap bottom-up.
  const unwrappedChildren = children.map((child: Node) => applyAutoUnwrap(child as Node))
  const nonEmptyChildren = unwrappedChildren.filter(
    (child: Node) => typeof child !== 'string' || (child && child.trim())
  )

  // Classic case: container has only a single markdown paragraph child.
  if (nonEmptyChildren.length === 1 && isMarkdownParagraph(nonEmptyChildren[0])) {
    // Lift the paragraph's attrs onto the parent so trailing `{attr}` survives the unwrap.
    // Parent attrs take precedence so explicit component props aren't overridden.
    const paragraphAttrs = nonEmptyChildren[0][1] as Record<string, unknown>
    const mergedProps =
      paragraphAttrs && Object.keys(paragraphAttrs).length > 0 ? { ...paragraphAttrs, ...props } : props
    return [tag, mergedProps, ...(nonEmptyChildren[0].slice(2) as Node[])] as Node
  }

  // HTML wrapper (e.g. nested <details>) may mix raw-HTML siblings (`summary`
  // with `$.html`) with a single markdown paragraph body. Unwrap that lone
  // markdown p only when every other non-empty sibling is itself HTML-originated
  // — so `p + ul` under an incomplete `<ai-thinking>` stays as-is.
  const htmlMeta = (props as Record<string, any>)?.$
  if (htmlMeta && typeof htmlMeta === 'object' && htmlMeta.html === 1) {
    const markdownParagraphs = nonEmptyChildren.filter(isMarkdownParagraph)
    const othersAreHtml = nonEmptyChildren.every(
      (c) => isMarkdownParagraph(c) || (Array.isArray(c) && (c[1] as Record<string, any>)?.$?.html === 1)
    )
    if (markdownParagraphs.length === 1 && othersAreHtml) {
      return [
        tag,
        props,
        ...unwrappedChildren.flatMap((child) => (isMarkdownParagraph(child) ? (child.slice(2) as Node[]) : [child])),
      ] as Node
    }
  }

  return [tag, props, ...unwrappedChildren] as Node
}
