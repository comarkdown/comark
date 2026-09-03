import type { ElementNode, Node } from 'comark'
import type { ProseContext } from './types.ts'

/** Type guard for element nodes (excludes text and comment nodes). */
export function isElement(node: Node | undefined): node is ElementNode {
  return Array.isArray(node) && typeof node[0] === 'string'
}

/** Attributes object of an element node, creating it when missing. */
export function attrsOf(node: ElementNode): Record<string, unknown> {
  return (node[1] ??= {})
}

/** Children of an element node (may be empty). */
export function childrenOf(node: ElementNode): Node[] {
  return node.slice(2) as Node[]
}

/**
 * Sets the class attribute from the given parts, preserving the author's class
 * through the context merge function. Empty results remove the attribute.
 */
export function setClass(ctx: ProseContext, attrs: Record<string, unknown>, theme: string): void {
  const merged = ctx.mergeClass(theme, attrs.class)
  if (merged) attrs.class = merged
  else delete attrs.class
}

/** Default class merge: plain concatenation. */
export function concatClass(theme: string, author: unknown): string {
  if (typeof author === 'string' && author) return theme ? `${theme} ${author}` : author
  return theme
}

/**
 * Reads a string attribute and removes it from the node (consumed by lowering).
 * Also accepts the bound form (`:name`), which the attributes syntax produces.
 */
export function takeAttr(attrs: Record<string, unknown>, name: string): string | undefined {
  for (const key of [name, `:${name}`]) {
    const value = attrs[key]
    if (value === undefined) continue
    delete attrs[key]
    if (typeof value === 'string' && value !== '') return value
    return undefined
  }
  return undefined
}

/** Reads a boolean-ish attribute (`{open}`, `{open=true}`, bound `:open`) and removes it. */
export function takeBoolAttr(attrs: Record<string, unknown>, name: string): boolean | undefined {
  for (const key of [name, `:${name}`]) {
    const value = attrs[key]
    if (value === undefined) continue
    delete attrs[key]
    return value === true || value === '' || value === 'true'
  }
  return undefined
}
