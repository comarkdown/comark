import { resolveAttributes, type NodeHandler } from 'comark/render'
import { resolveIfWrapper, selectIfBranch, shouldRenderIf, type IfProps } from 'comark/plugins/binding'
import type { Node } from 'comark'
import { DIM, RESET } from '../utils/escape.ts'

export * from 'comark/plugins/binding'
export { default } from 'comark/plugins/binding'

/**
 * ANSI handler for `binding` nodes produced by the `binding` plugin.
 *
 * Renders the resolved value (looked up against the ambient render context via
 * the `:value` dot-path), falling back to `defaultValue` when the path does
 * not resolve. If neither is available, shows a dim placeholder of the raw
 * path so the gap is visible in terminal output.
 *
 * @example
 * ```ts
 * import binding, { Binding } from '@comark/ansi/plugins/binding'
 * import { renderAnsiFromDocument } from '@comark/ansi'
 *
 * const out = await renderAnsiFromDocument(document, {
 *   components: { binding: Binding },
 * })
 * ```
 */
export const Binding: NodeHandler = (node, state) => {
  const resolved = state.renderData.props as Record<string, unknown>
  const raw = (node[1] || {}) as Record<string, unknown>
  const value = resolved.value
  const defaultValue = raw.defaultValue

  if (value !== undefined && value !== null) return String(value)
  if (defaultValue !== undefined && defaultValue !== null) return String(defaultValue)

  const path = typeof raw[':value'] === 'string' ? String(raw[':value']) : ''
  if (!path) return ''
  return state.context.colors ? `${DIM}{{ ${path} }}${RESET}` : `{{ ${path} }}`
}

/** Render the default or else branch of an `::if` component. */
export const If: NodeHandler = async (node, state, parent) => {
  const props = resolveAttributes(state.renderData.props, state.renderData, { parseJson: true }) as IfProps
  const children = selectIfBranch(node.slice(2) as Node[], shouldRenderIf(props))
  if (!children) return ''

  // Validate `as` consistently with visual renderers, even though ANSI has no wrapper element.
  resolveIfWrapper(props.as)
  state.renderData = { ...state.renderData, props }
  return (await state.flow([node[0], node[1], ...children], state)) + (parent ? '' : state.context.blockSeparator)
}
