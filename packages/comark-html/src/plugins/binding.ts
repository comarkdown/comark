import { resolveAttributes, type NodeHandler } from 'comark/render'
import {
  resolveForIterations,
  selectForBranch,
  resolveIfWrapper,
  selectIfBranch,
  shouldRenderIf,
  type IfProps,
} from 'comark/plugins/binding'
import type { Node } from 'comark'
import { escapeHtml } from 'comark/utils'

export * from 'comark/plugins/binding'
export { default } from 'comark/plugins/binding'

/**
 * HTML handler for `binding` nodes produced by the `binding` plugin.
 *
 * Renders the resolved value (looked up against the ambient render context via
 * the `:value` dot-path), falling back to `defaultValue` when the path does
 * not resolve, and finally to an empty string. The output is escaped for
 * safe HTML embedding.
 *
 * @example
 * ```ts
 * import binding, { Binding } from '@comark/html/plugins/binding'
 * import { createHtmlRenderer } from '@comark/html'
 *
 * const renderHtml = createHtmlRenderer({
 *   plugins: [binding()],
 *   components: { Binding },
 * })
 * ```
 */
export const Binding: NodeHandler = (node, state) => {
  const resolved = state.renderData.props as Record<string, unknown>
  const raw = (node[1] || {}) as Record<string, unknown>
  const out = resolved.value ?? raw.defaultValue
  if (out === undefined || out === null) return ''
  return escapeHtml(String(out))
}

/** Render the default or else branch of an `::if` component. */
export const If: NodeHandler = async (node, state, parent) => {
  const props = resolveAttributes(state.renderData.props, state.renderData, { parseJson: true }) as IfProps
  const children = selectIfBranch(node.slice(2) as Node[], shouldRenderIf(props))
  if (!children) return ''

  const wrapper = resolveIfWrapper(props.as)
  state.renderData = { ...state.renderData, props }
  const html = await state.flow([node[0], node[1], ...children], state)
  const output = wrapper ? `<${wrapper}>${html}</${wrapper}>` : html
  return output + (parent ? '' : state.context.blockSeparator)
}

/** Repeat the default branch with a scoped item, or render the empty branch once. */
export const For: NodeHandler = async (node, state, parent) => {
  const previous = state.renderData
  const props = resolveAttributes(previous.props, previous, { parseJson: true })
  const iterations = resolveForIterations(props, previous)
  const children = selectForBranch(node.slice(2) as Node[], iterations.length === 0)
  let output = ''
  try {
    for (const iteration of iterations.length ? iterations : [{ renderData: previous }]) {
      state.renderData = iteration.renderData
      output += await state.flow([node[0], {}, ...children], state)
    }
  } finally {
    state.renderData = previous
  }
  return output + (output && !parent ? state.context.blockSeparator : '')
}
