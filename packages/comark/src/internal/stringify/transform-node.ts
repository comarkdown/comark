import type { ElementNode, NodeRenderData, NodeTransform } from '../../types.ts'

/**
 * Run the renderer's `transformNode` hooks for one element node.
 *
 * `props` are the node's attributes as the renderer resolved them. Returns
 * `undefined` when no hook changed anything, so callers keep their fast path.
 * Otherwise returns the final tag and props; `props` is the same object as
 * the input when only the tag changed. What a hook returns is used as-is:
 * hooks are trusted developer code, so their output is not sanitized.
 */
export function applyNodeTransforms(
  transforms: NodeTransform | readonly NodeTransform[] | undefined,
  node: ElementNode,
  props: Record<string, unknown>,
  renderData: NodeRenderData,
  parent?: ElementNode
): { tag: string; props: Record<string, unknown> } | undefined {
  if (!transforms) return undefined
  const list = typeof transforms === 'function' ? [transforms] : transforms
  if (list.length === 0) return undefined

  const tag = node[0]
  let nextTag = tag
  let nextProps = props
  for (const transform of list) {
    const result = transform({ tag: nextTag, props: nextProps, node, parent, renderData })
    if (!result) continue
    if (typeof result.tag === 'string' && result.tag) nextTag = result.tag
    if (result.props && typeof result.props === 'object') nextProps = result.props
  }

  if (nextTag === tag && nextProps === props) return undefined
  return { tag: nextTag, props: nextProps }
}

type Transforms = NodeTransform | readonly NodeTransform[]
const mergeCache = new WeakMap<Transforms, WeakMap<Transforms, readonly NodeTransform[]>>()

/**
 * Merge two `transformNode` values, such as a preconfigured component's and
 * an instance's, into one list where `first` runs first. Returns the same
 * list for the same inputs, so renderers that memoize on it stay stable.
 */
export function mergeNodeTransforms(
  first: Transforms | undefined,
  second: Transforms | undefined
): Transforms | undefined {
  if (!first || !second) return first ?? second
  let byFirst = mergeCache.get(first)
  if (!byFirst) mergeCache.set(first, (byFirst = new WeakMap()))
  let merged = byFirst.get(second)
  if (!merged) {
    merged = [first, second].flat() as NodeTransform[]
    byFirst.set(second, merged)
  }
  return merged
}
