import { handlers as defaultHandlers } from './handlers/index.ts'
import type { NodeRenderData, State, Context } from 'comark/render'
import type { ElementNode, Node, MarkdownDocument, ConditionalNodeHandler, CreateContext, NodeHandler } from 'comark'
import { pascalCase } from '../../utils/index.ts'
import { resolveAttributes } from './attributes.ts'

function findHandler(ctx: Context, node: ElementNode): NodeHandler | undefined {
  const name = node[0] as string
  // Own-property lookups only — the handler maps are plain objects, so a node
  // named `constructor`/`__proto__`/… would otherwise resolve through the
  // prototype chain (XSS / render crash from untrusted markdown).
  const userHandler =
    (Object.hasOwn(ctx.handlers, name) ? ctx.handlers[name] : undefined) ||
    (Object.hasOwn(ctx.handlers, pascalCase(name)) ? ctx.handlers[pascalCase(name)] : undefined)

  if (typeof userHandler === 'function') {
    return userHandler
  }

  for (const handler of ctx.conditionalHandlers) {
    if (handler?.match(node)) {
      return handler.handler
    }
  }

  return userHandler
}

/**
 * Render a single node
 * @param node - The node to render
 * @param state - The state of the renderer
 * @param parent - The parent node
 * @param atLineStart - Whether a string node begins a line, so leading block markers are escaped
 * @returns The rendered node
 */
export async function one(node: Node, state: State, parent?: ElementNode, atLineStart = false): Promise<string> {
  if (typeof node === 'string') {
    if (state.context.html) {
      return escapeHtml(node)
    }
    // The content of a raw HTML block is copied verbatim on parse, so markdown
    // syntax inside it must not be escaped (inline HTML, `$.block === 0`, has
    // its markdown parsed into children and is escaped normally).
    if (parent?.[1].$?.html === 1 && parent[1].$?.block === 1) {
      return node
    }
    return escapeTextNode(node, atLineStart)
  }

  if (node[0] === null) {
    return await state.handlers.comment(node as unknown as ElementNode, state)
  }

  // Scope `renderData.props` to the current element's resolved attributes so
  // nested bindings like `:prop="props.x"` resolve against the enclosing
  // element's values, regardless of which handler (html / ansi / user) runs.
  // Elements with no attributes (e.g. an auto-generated `<p>` wrapper) must
  // NOT shadow the parent's scope, otherwise `{{ props.* }}` inside them would
  // resolve to nothing.
  const prevRenderData = state.renderData
  if (state.renderData && node[1]) {
    const resolved = resolveAttributes(node[1] as Record<string, unknown>, prevRenderData)
    if (Object.keys(resolved).length > 0) {
      state.renderData = { ...prevRenderData, props: resolved }
    }
  }

  try {
    const userHandler = findHandler(state.context, node)
    if (userHandler) {
      return await userHandler(node, state, parent)
    }

    if (state.context.html || node[1].$?.html === 1) {
      return await state.handlers.html(node, state, parent)
    }

    // fallback to default handlers (own-property lookup — see findHandler)
    const nodeName = node[0] as string
    const nodeHandler = Object.hasOwn(state.handlers, nodeName) ? state.handlers[nodeName] : undefined
    if (nodeHandler) {
      return await nodeHandler(node, state, parent)
    }

    return state.context.format === 'markdown/comark'
      ? await state.handlers.mdc(node, state, parent)
      : await state.handlers.html(node, state, parent)
  } finally {
    state.renderData = prevRenderData
  }
}

export async function flow(node: ElementNode, state: State, parent?: ElementNode): Promise<string> {
  const children = node.slice(2) as ElementNode[]
  let result = ''
  for (const child of children) {
    result += await one(child, state, parent || node)
  }
  return result
}

export function createState(ctx: Partial<CreateContext> = {}): State {
  const conditionalHandlers: ConditionalNodeHandler[] = []
  const handlers = {} as Record<string, NodeHandler>

  for (const [key, value] of Object.entries(ctx.handlers || {})) {
    if (typeof value === 'function') {
      handlers[key] = value
    } else {
      conditionalHandlers.push(value)
    }
  }

  const context = {
    ...ctx,
    blockSeparator: ctx.blockSeparator || '\n\n',
    format: ctx.format || 'markdown/comark',
    handlers, // user defined node handlers
    conditionalHandlers,
    blockAttributesStyle: ctx.blockAttributesStyle || 'codeblock',
    // Enable html mode for text/html format
    html: ctx.format === 'text/html',
  } as Context

  const tree = ctx.tree as MarkdownDocument | undefined
  const renderData: NodeRenderData = {
    frontmatter: (tree?.frontmatter || {}) as Record<string, unknown>,
    meta: (tree?.meta || {}) as Record<string, unknown>,
    data: (ctx.data || {}) as Record<string, unknown>,
    props: {} as Record<string, unknown>,
  }
  const state = {
    handlers: defaultHandlers,
    context,
    one,
    flow,
    data: ctx.data || {},
    renderData,
    render: async (input: Node[] | ElementNode) => {
      if (Array.isArray(input) && typeof input[0] === 'string' && input.length > 1) {
        return state.one(input as ElementNode, state)
      }

      let result = ''
      for (const child of input as Node[]) {
        result += await state.one(child, state, undefined, result === '' || result.endsWith('\n'))
      }
      return result
    },
    applyContext: (edit: Record<string, unknown>) => {
      const revert = {} as Record<string, unknown>

      for (const [key, value] of Object.entries(edit)) {
        revert[key] = context[key]
        context[key] = value
      }

      return revert
    },
  }

  return state
}

export const state: State = {
  handlers: defaultHandlers,
  conditionalHandlers: [],
  data: {},
  renderData: { frontmatter: {}, meta: {}, data: {}, props: {} } as NodeRenderData,
  context: {
    blockSeparator: '\n\n',
    format: 'markdown/comark',
    handlers: {}, // user defined node handlers
    conditionalHandlers: [], // user defined conditional handlers
    blockAttributesStyle: 'codeblock',
  },
  flow,
  one,
  render: async (input: Node[] | ElementNode) => {
    if (typeof input === 'string') {
      return input
    }

    if (Array.isArray(input) && typeof input[0] === 'string') {
      return one(input as ElementNode, state)
    }

    let result = ''
    for (const child of input as Node[]) {
      result += await one(child, state, undefined, result === '' || result.endsWith('\n'))
    }
    return result
  },
  applyContext: (edit: Record<string, unknown>) => {
    const revert = {} as Record<string, unknown>

    for (const [key, value] of Object.entries(edit)) {
      revert[key] = state.context[key]
      state.context[key] = value
    }

    return revert
  },
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '&amp;': '&',
  }
  return text.replace(/[<>]/g, (char) => map[char])
}

// Characters that can start an inline markdown construct anywhere on a line:
// `\` (escape), `` ` `` (code span), `*`/`_` (emphasis), `<` (raw HTML /
// autolink), `&` (character reference), `~` (strikethrough) and `[`/`]`
// (link/image). `\` is included so a literal backslash is preserved instead of
// merging with a following escape.
const inlineSyntax = /[\\`*_<&~[\]]/g

/**
 * Escape characters in a markdown text node that would otherwise be
 * misinterpreted as markdown syntax on a subsequent parse, so the node
 * round-trips as literal text.
 *
 * Inline constructs are recognised anywhere, so their characters are escaped
 * wherever they appear. Block constructs (headings, blockquotes, lists,
 * thematic breaks, setext underlines) are only recognised at the start of a
 * line, so their markers are escaped on the first line only when the node
 * begins one (`atLineStart`) and on every line following an embedded newline.
 */
function escapeTextNode(text: string, atLineStart = false): string {
  const escaped = escapeInline(text)

  if (!atLineStart && !escaped.includes('\n')) {
    return escaped
  }

  return escaped
    .split('\n')
    .map((line, index) => (index > 0 || atLineStart ? escapeLeadingBlock(line) : line))
    .join('\n')
}

function isAlphaNumeric(char: string | undefined): boolean {
  return char !== undefined && /[a-zA-Z0-9]/.test(char)
}

/**
 * Escape inline syntax characters. `_`, `<` and `&` only start a construct in
 * specific positions, so they are left alone otherwise to avoid mangling
 * ordinary prose like `snake_case`, `a < b` or `AT&T`.
 */
function escapeInline(text: string): string {
  return text.replace(inlineSyntax, (char, offset: number, source: string) => {
    // `_` only opens emphasis at a word boundary — never between alphanumerics.
    if (char === '_' && isAlphaNumeric(source[offset - 1]) && isAlphaNumeric(source[offset + 1])) {
      return char
    }
    // `<` only starts raw HTML / an autolink when it looks like a tag, not when
    // used as a comparison (e.g. `a < b`).
    if (char === '<' && !/^<[a-zA-Z!?/][^>]*>/.test(source.slice(offset))) {
      return char
    }
    // `&` only starts a character reference when it forms an entity.
    if (char === '&' && !/^&#?[a-zA-Z0-9]+;/.test(source.slice(offset))) {
      return char
    }
    return `\\${char}`
  })
}

/**
 * Escape a leading block marker so a text node that begins a line doesn't
 * round-trip into a heading, blockquote, list, thematic break or setext
 * heading. `*`, `_` and `~` based markers are already handled by
 * {@link escapeInline}; only the block-exclusive markers remain here.
 */
function escapeLeadingBlock(line: string): string {
  // ATX heading: 1–6 `#` followed by a space/tab or the end of the line.
  if (/^#{1,6}([ \t]|$)/.test(line)) return `\\${line}`
  // Blockquote: `>` (a following space is optional).
  if (line[0] === '>') return `\\${line}`
  // Ordered list: digits then `.`/`)` followed by a space/tab or end of line.
  const ordered = /^(\d{1,9})[.)]([ \t]|$)/.exec(line)
  if (ordered) return `${ordered[1]}\\${line.slice(ordered[1].length)}`
  // Bullet, thematic break or setext underline made of `-`.
  if (/^-([ \t-]|$)/.test(line)) return `\\${line}`
  // Bullet with `+`.
  if (/^\+([ \t]|$)/.test(line)) return `\\${line}`
  // Setext underline made of `=`.
  if (/^=+[ \t]*$/.test(line)) return `\\${line}`
  return line
}
