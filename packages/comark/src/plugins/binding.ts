import type { PluginWithOptions, MarkdownExit } from 'markdown-exit'
import { defineComarkPlugin } from '../utils/helpers.ts'
import type { MarkdownItPlugin, NodeHandler } from '../types'

export interface MdcInlineBindingOptions {
  /**
   * The tag name used to render a binding.
   *
   * @default 'binding'
   */
  tag?: string
}

const markdownItInlineBinding: PluginWithOptions<MdcInlineBindingOptions> = (md, options = {}) => {
  const tag = options.tag || 'binding'

  md.inline.ruler.after('entity', 'mdc_inline_binding', (state, silent) => {
    const start = state.pos

    if (state.src[start] !== '{' || state.src[start + 1] !== '{')
      return false

    // Find the closing `}}`
    let end = start + 2
    while (end < state.posMax - 1) {
      if (state.src[end] === '}' && state.src[end + 1] === '}')
        break
      end += 1
    }

    if (end >= state.posMax - 1)
      return false

    const inner = state.src.slice(start + 2, end).trim()
    if (!inner)
      return false

    // Split on the first `||` to separate value and default
    const separator = inner.indexOf('||')
    const value = separator === -1 ? inner : inner.slice(0, separator).trim()
    const defaultValue = separator === -1 ? '' : inner.slice(separator + 2).trim()

    if (!value)
      return false

    state.pos = end + 2

    if (silent)
      return true

    const token = state.push('mdc_inline_component', tag, 0)
    token.attrSet(':value', value)
    if (defaultValue)
      token.attrSet('defaultValue', defaultValue)

    return true
  })
}

export default defineComarkPlugin((opts: MdcInlineBindingOptions = {}) => {
  return {
    name: 'binding',
    markdownItPlugins: [
      ((md: MarkdownExit) => markdownItInlineBinding(md, opts)) as unknown as MarkdownItPlugin,
    ],
  }
})

/**
 * Markdown-format handler that renders a `binding` node back to the
 * `{{ path || default }}` source form.
 *
 * Wire it via `renderMarkdown(tree, { components: { Binding } })`
 * to round-trip faithfully to the authored shorthand instead of the generic
 * `:binding{:value="..."}` component form.
 */
export const Binding: NodeHandler = (node) => {
  const attrs = (node[1] || {}) as Record<string, unknown>
  const path = attrs[':value']
  if (typeof path !== 'string' || !path) return ''
  const defaultValue = attrs.defaultValue
  return typeof defaultValue === 'string' && defaultValue.length > 0
    ? `{{ ${path} || ${defaultValue} }}`
    : `{{ ${path} }}`
}
