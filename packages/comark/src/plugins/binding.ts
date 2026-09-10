import type { PluginWithOptions, MarkdownExit } from 'markdown-exit'
import { defineComarkPlugin } from '../utils/helpers.ts'
import type { MarkdownItPlugin, NodeHandler, Node } from '../types'

export interface MdcInlineBindingOptions {
  /**
   * The tag name used to render a binding.
   *
   * @default 'binding'
   */
  tag?: string
}

export type IfComparisonOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'

export type IfWrapperTag = 'div' | 'span' | 'p' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav'

export interface IfProps {
  condition?: unknown
  value?: unknown
  eq?: unknown
  neq?: unknown
  gt?: unknown
  gte?: unknown
  lt?: unknown
  lte?: unknown
  as?: unknown
  [key: string]: unknown
}

const IF_WRAPPER_TAGS = new Set<IfWrapperTag>([
  'div',
  'span',
  'p',
  'section',
  'article',
  'aside',
  'header',
  'footer',
  'main',
  'nav',
])

const IF_COMPARISON_OPERATORS: readonly IfComparisonOperator[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte']

function compareIfValue(operator: IfComparisonOperator, value: unknown, expected: unknown): boolean {
  switch (operator) {
    case 'eq':
      return value === expected
    case 'neq':
      return value !== expected
    case 'gt':
      return (value as any) > (expected as any)
    case 'gte':
      return (value as any) >= (expected as any)
    case 'lt':
      return (value as any) < (expected as any)
    case 'lte':
      return (value as any) <= (expected as any)
  }
}

/** Evaluate the resolved props of an `::if` component. */
export function shouldRenderIf(props: IfProps): boolean {
  const hasCondition = Object.hasOwn(props, 'condition')
  if (hasCondition && !props.condition) return false

  let hasComparison = false
  for (const operator of IF_COMPARISON_OPERATORS) {
    if (!Object.hasOwn(props, operator)) continue
    hasComparison = true

    if (!Object.hasOwn(props, 'value') || props.value === undefined) return false
    const expected = props[operator]
    if (expected === undefined || !compareIfValue(operator, props.value, expected)) return false
  }

  return hasComparison || hasCondition || Boolean(props.value)
}

/** Select an `::if` branch from AST children without rendering inactive nodes. */
export function selectIfBranch(children: Node[], matches: boolean): Node[] | undefined {
  const regularChildren: Node[] = []
  let defaultSlot: Node[] | undefined
  let elseSlot: Node[] | undefined
  for (const child of children) {
    if (Array.isArray(child) && child[0] === 'template') {
      const attrs = child[1]
      const slotKey = Object.keys(attrs).find((key) => key.startsWith('#') || key.startsWith('v-slot:'))
      const name = attrs.name ?? (slotKey?.startsWith('#') ? slotKey.slice(1) : slotKey?.slice(7))
      if (name) {
        if (name === 'default') defaultSlot = child.slice(2) as Node[]
        if (name === 'else') elseSlot = child.slice(2) as Node[]
        continue
      }
    }
    regularChildren.push(child)
  }
  return matches ? (defaultSlot ?? regularChildren) : elseSlot
}

/** Validate and normalize the optional HTML wrapper used by an `::if` component. */
export function resolveIfWrapper(value: unknown): IfWrapperTag | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'string' && IF_WRAPPER_TAGS.has(value as IfWrapperTag)) return value as IfWrapperTag
  throw new Error(`Unsupported If wrapper tag: ${String(value)}`)
}

const markdownItInlineBinding: PluginWithOptions<MdcInlineBindingOptions> = (md, options = {}) => {
  const tag = options.tag || 'binding'

  md.inline.ruler.after('entity', 'mdc_inline_binding', (state, silent) => {
    const start = state.pos

    if (state.src[start] !== '{' || state.src[start + 1] !== '{') return false

    // Find the closing `}}`
    let end = start + 2
    while (end < state.posMax - 1) {
      if (state.src[end] === '}' && state.src[end + 1] === '}') break
      end += 1
    }

    if (end >= state.posMax - 1) return false

    const inner = state.src.slice(start + 2, end).trim()
    if (!inner) return false

    // Split on the first `||` to separate value and default
    const separator = inner.indexOf('||')
    const value = separator === -1 ? inner : inner.slice(0, separator).trim()
    const defaultValue = separator === -1 ? '' : inner.slice(separator + 2).trim()

    if (!value) return false

    state.pos = end + 2

    if (silent) return true

    const token = state.push('mdc_inline_component', tag, 0)
    token.attrSet(':value', value)
    if (defaultValue) token.attrSet('defaultValue', defaultValue)

    return true
  })
}

export default defineComarkPlugin((opts: MdcInlineBindingOptions = {}) => {
  return {
    name: 'binding',
    markdownItPlugins: [((md: MarkdownExit) => markdownItInlineBinding(md, opts)) as unknown as MarkdownItPlugin],
  }
})

/**
 * Markdown-format handler that renders a `binding` node back to the
 * `{{ path || default }}` source form.
 *
 * Wire it via `renderMarkdown(document, { components: { Binding } })`
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
