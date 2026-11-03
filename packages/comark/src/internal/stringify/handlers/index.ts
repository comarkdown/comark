import type { NodeHandler, State } from 'comark/render'
import type { ElementNode, HeadingIdsOption, Node } from 'comark'
import { indent, textContent } from '../../../utils/index.ts'
import { createHeadingIdTracker, nextHeadingId, reserveHeadingId, type HeadingIdTracker } from '../../heading-id.ts'
import { comarkAttributes, comarkYamlAttributes, userBlockAttrs } from '../attributes.ts'
import { pickFence } from '../fence.ts'
import { comment, html } from '../html-handlers.ts'

// All Markdown handlers live in one module: fewer module boundaries measurably
// speeds up rendering. `html` / `comment` stay in `../html-handlers.ts` so
// `comark/render/html` can load them without the Markdown serializers or YAML.

// --- a ---

// TODO: support title & attributes
async function a(node: ElementNode, state: State) {
  const [_, attrs] = node

  const { href, ...rest } = attrs
  const attrsString = Object.keys(rest).length > 0 ? comarkAttributes(rest) : ''
  const content = await state.flow(node, state)

  if (content === href && !attrsString) {
    return `<${href}>`
  }

  return `[${content}](${href})${attrsString}`
}

// --- blockquote ---

async function blockquote(node: ElementNode, state: State) {
  const children = node.slice(2) as Node[]

  let childResult = ''
  for (const child of children) {
    childResult += await state.one(child, state, node, childResult === '' || childResult.endsWith('\n'))
  }

  const userAttrs = userBlockAttrs('blockquote', node[1] as Record<string, unknown>)
  const attrs = comarkAttributes(userAttrs)
  const hasBlockChildren = children.some((c) => Array.isArray(c))

  // Multi-block content with attrs has no unambiguous inline form — round-trip
  // via `::blockquote{attrs}` so the attrs aren't visually attached to one
  // paragraph and parsers can recover the same AST.
  if (attrs && hasBlockChildren) {
    const content = childResult
      .trim()
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n')
    return `::blockquote${attrs}\n${content}\n::` + state.context.blockSeparator
  }

  if (attrs) childResult = `${childResult.replace(/[ \t]+$/, '')} ${attrs}`

  const content = childResult
    .trim()
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n')

  if (node[1].as) {
    return `> [!${String(node[1].as).toUpperCase()}]\n` + content + state.context.blockSeparator
  }

  return content + state.context.blockSeparator
}

// --- br ---

/** Space, tab, line feed, form feed or carriage return. */
function isSpaceCode(c: number): boolean {
  return c === 32 || c === 9 || c === 10 || c === 12 || c === 13
}

function isBr(node: Node | undefined) {
  return Array.isArray(node) && node[0] === 'br'
}

function br(node: ElementNode, state: State, parent?: ElementNode) {
  const index = parent ? parent.indexOf(node) : -1
  if (index < 2) return '  \n'

  const prev = index > 2 ? (parent![index - 1] as Node) : undefined
  const next = parent![index + 1] as Node | undefined
  const prevSpace = typeof prev === 'string' && isSpaceCode(prev.charCodeAt(prev.length - 1))
  const nextSpace = typeof next === 'string' && isSpaceCode(next.charCodeAt(0))

  // A trailing-space break drops adjacent whitespace and needs content on both sides
  const hardBreak = prev !== undefined && next !== undefined && !isBr(prev) && !isBr(next) && !prevSpace && !nextSpace
  if (hardBreak) return '  \n'

  if (state.context.format !== 'markdown/comark' || prev === undefined) return '<br>'

  // Empty `{}` delimits `:br` from content that would otherwise join it
  const open = prevSpace ? ':br' : ' :br'
  return nextSpace ? open : `${open} `
}

// --- code ---

function code(node: ElementNode, _state: State) {
  const [_, attributes] = node
  // Highlighters (shiki / rangi) take over the `class` of highlighted inline
  // code, so strip their portion back off instead of echoing `.shiki` / `.shj`
  // into the markdown.
  const attrs = userBlockAttrs('code', attributes as Record<string, unknown>)
  const attrsString = Object.keys(attrs).length > 0 ? comarkAttributes(attrs) : ''
  const content = textContent(node)
  const fence = content.includes('`') ? '``' : '`'

  return `${fence}${content}${fence}${attrsString}`
}

// --- strong / em / del ---

async function inlineContent(node: ElementNode, state: State): Promise<string> {
  let content = ''
  for (let i = 2; i < node.length; i++) {
    content += await state.one(node[i] as Node, state, node)
  }
  return content.trim()
}

function inlineAttrs(attrs: ElementNode[1]): string {
  return Object.keys(attrs).length > 0 ? comarkAttributes(attrs) : ''
}

async function strong(node: ElementNode, state: State) {
  return `**${await inlineContent(node, state)}**${inlineAttrs(node[1])}`
}

async function emphesis(node: ElementNode, state: State) {
  return `*${await inlineContent(node, state)}*${inlineAttrs(node[1])}`
}

async function del(node: ElementNode, state: State) {
  return `~~${await inlineContent(node, state)}~~${inlineAttrs(node[1])}`
}

// --- heading ---

// Replays the parser's id generation across one render so each heading's
// implicit id is known, keyed by render state (`null` when ids are disabled).
const trackers = new WeakMap<State, HeadingIdTracker | null>()

function autoHeadingId(node: ElementNode, level: number, state: State, id: unknown): string | undefined {
  let tracker = trackers.get(state)
  if (tracker === undefined) {
    tracker = createHeadingIdTracker(state.context.headingIds as HeadingIdsOption | undefined) ?? null
    trackers.set(state, tracker)
  }
  if (!tracker) return undefined
  const text = node
    .slice(2)
    .map((child) => textContent(child as ElementNode))
    .join('')
  const autoId = nextHeadingId(text, level, tracker)
  // Mirror the parser: an explicit id is reserved so later headings skip it.
  reserveHeadingId(tracker, id)
  return autoId
}

// h1, h2, h3, h4, h5, h6
async function heading(node: ElementNode, state: State) {
  const [tag] = node

  const level = Number(tag.slice(1))

  const content = await state.flow(node, state)

  // The auto-generated id is implicit in `# Heading` markdown — only echo a custom one.
  const { id, ...rest } = node[1] as Record<string, unknown>
  const autoId = autoHeadingId(node, level, state, id)
  const attrs = comarkAttributes(id === undefined || id === autoId ? rest : { id, ...rest })
  const suffix = attrs ? ` ${attrs}` : ''

  return '#'.repeat(level) + ' ' + content + suffix + state.context.blockSeparator
}

// --- hr ---

function hr(_n: ElementNode, state: State, parent?: ElementNode) {
  if (parent?.[0] === 'p') {
    return ':hr'
  }

  return '---' + state.context.blockSeparator
}

// --- img ---

function img(node: ElementNode, _state: State) {
  const [_, attrs] = node
  const { title, src, alt = '', ...rest } = attrs

  const attrsString = Object.keys(rest).length > 0 ? comarkAttributes(rest) : ''

  const link = title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
  return `${link}${attrsString}`
}

// --- li ---

// Block elements that need explicit indentation in list items.
// Note: ol/ul are handled by their own handlers which manage indentation via listIndent context.
const listBlockElements = new Set(['pre', 'blockquote', 'table'])

async function li(node: ElementNode, state: State) {
  const children = node.slice(2) as Node[]

  const order = state.context.order
  let prefix = order ? `${order}. ` : '- '

  const className =
    (node[1].className as string) && Array.isArray(node[1].className)
      ? node[1].className.join(' ')
      : String(node[1].className || node[1].class)

  const taskList = className.includes('task-list-item')

  if (taskList) {
    const input = children.shift() as ElementNode
    prefix += input[1].checked || input[1][':checked'] ? '[x] ' : '[ ] '
  }

  const prefixWidth = prefix.length

  // Direct text children render sibling components inline.
  const hasInlineContent = children.some((child) => typeof child === 'string')

  let result = ''

  for (const child of children) {
    if (Array.isArray(child)) {
      const tag = child[0] as string

      if (result && listBlockElements.has(tag)) {
        const indented = indent(await state.one(child, state, node), { width: prefixWidth })
        result = result.trimEnd() + '\n' + indented.trimEnd() + '\n'
        continue
      }

      if (result && (tag === 'p' || (tag === null && !hasInlineContent))) {
        const indented = indent(await state.one(child, state, node), { width: prefixWidth })
        result = result.trimEnd() + '\n\n' + indented.trimEnd() + '\n'
        continue
      }

      // No parent → mdc skips its own nesting indentation, so li owns it here.
      if (!hasInlineContent && !(tag in state.handlers)) {
        const indented = indent(await state.one(child, state), { width: prefixWidth, ignoreFirstLine: !result })
        result = result ? result.trimEnd() + '\n' + indented.trimEnd() + '\n' : indented.trimEnd() + '\n'
        continue
      }
    }
    result += await state.one(child, state, node, result === '' || result.endsWith('\n'))
  }
  result = result.trim()

  const attrs = comarkAttributes(userBlockAttrs('li', node[1] as Record<string, unknown>))
  const suffix = attrs ? ` ${attrs}` : ''

  if (order) {
    state.applyContext({ order: order + 1 })
  }

  return `${prefix}${result}${suffix}\n`
}

// --- math ---

function math(node: ElementNode, state: State, parent?: ElementNode): string {
  const content = textContent(node)
  const className = node[1].class
  const classes = typeof className === 'string' ? className.split(' ') : []
  const hasInlineClass = classes.includes('inline')
  const hasBlockClass = classes.includes('block')
  const hasInlineSiblings = parent?.some((child, index) => index > 1 && typeof child === 'string') ?? false
  const isInline = hasInlineClass || (!hasBlockClass && hasInlineSiblings)
  const markup = node[1].$?.markup

  if (isInline) {
    if (markup === '\\(') return `\\(${content}\\)`
    if (markup === '\\[') return `\\[${content}\\]`
    return `$${content}$`
  }

  if (markup === '\\[') return `\\[\n${content}\n\\]${state.context.blockSeparator}`
  return `$$\n${content}\n$$${state.context.blockSeparator}`
}

// --- mdc ---

// HTML elements that always create an inline context for their children
const INLINE_HTML_ELEMENTS = new Set(['a', 'strong', 'em', 'span'])

async function mdc(node: ElementNode, state: State, parent?: ElementNode) {
  const [tag, attr, ...children] = node
  const { $: _, ...attributes } = attr

  if (tag === 'table') {
    return html(node, state)
  }

  const attributeEntries = Object.entries(attributes)
  const hasObjectAttributes = attributeEntries.some(([, value]) => typeof value === 'object')

  // Component is inline if it has text siblings in parent,
  // is inside an inline HTML element or an inline-rendering ancestor
  const hasTextSiblings = parent?.some((child, index) => index > 1 && typeof child === 'string') ?? false
  const insideInlineElement = parent !== undefined && INLINE_HTML_ELEMENTS.has(String(parent[0]))
  let inline = hasTextSiblings || insideInlineElement || state.context.inline === true

  // if component has object attributes, it cannot be inline
  if (hasObjectAttributes) {
    inline = false
  }

  // Block fences inside `:name[…]` content cannot be parsed back — keep children inline
  const revert = inline ? state.applyContext({ inline: true }) : undefined

  let content = ''
  const childState = { ...state, nodeDepthInTree: (state.nodeDepthInTree || 0) + 1 }
  for (const child of children as Node[]) {
    content += await state.one(child, childState, node)
  }
  content = content.trimEnd()

  if (revert) {
    state.applyContext(revert)
  }

  let attrs = attributeEntries.length > 0 ? comarkAttributes(attributes) : ''

  if (tag === 'span') {
    if (!attrs && parent?.[0] == 'a') {
      // Add empty attributes syntax to end of spans inside Anchor links
      // This will force Comark to parse them as span and prevent conflict
      attrs ||= '{}'
    }
    return `[${content}]${attrs}` + (inline ? '' : state.context.blockSeparator)
  }

  const fence = ':'.repeat((state.nodeDepthInTree || 0) + 2)

  let result = `:${tag}${content && `[${content}]`}${attrs}` + (!parent ? state.context.blockSeparator : '')

  if (!inline) {
    const maxInlineAttributes = state.context.maxInlineAttributes ?? 3
    const useYaml = hasObjectAttributes || maxInlineAttributes === 0 || attributeEntries.length > maxInlineAttributes
    if (useYaml) {
      const yamlAttrs = comarkYamlAttributes(attributes, state.context.blockAttributesStyle)
      result = `${fence}${tag}\n${yamlAttrs}${content ? `\n${content}` : ''}\n${fence}` + state.context.blockSeparator
    } else {
      result = `${fence}${tag}${attrs}${content ? `\n${content}` : ''}\n${fence}` + state.context.blockSeparator
    }
  }

  // Indented after a list, the component would continue the last list item
  const prev = parent?.[parent.indexOf(node) - 1]
  const afterList = Array.isArray(prev) && (prev[0] === 'ul' || prev[0] === 'ol')

  return inline ? result : indent(result, { level: parent && !afterList ? 1 : 0 })
}

// --- mermaid ---

function mermaid(node: ElementNode, state: State) {
  const [_, attributes] = node

  const { content, ...rest } = attributes

  const attrs = comarkAttributes(rest)
  // Parsed fence bodies keep one trailing newline — drop it so serialization
  // doesn't grow a blank line on every round trip.
  const body = String(content ?? '').replace(/\n$/, '')
  const fence = pickFence(body)

  return `${fence}mermaid${attrs ? ` ${attrs}` : ''}\n${body}\n${fence}${state.context.blockSeparator}`
}

// --- ul / ol ---

async function list(
  tag: 'ul' | 'ol',
  node: ElementNode,
  state: State,
  context: Record<string, unknown>
): Promise<string> {
  const revert = state.applyContext({ list: true, ...context })

  let result = ''
  for (let i = 2; i < node.length; i++) {
    result += await state.one(node[i] as Node, state)
  }
  result = result.trim()

  state.applyContext(revert)

  // A list with user attrs round-trips via `::ul{attrs}\n- …\n::` — the native
  // markdown list syntax has no slot for list-level attrs.
  const attrs = comarkAttributes(userBlockAttrs(tag, node[1] as Record<string, unknown>))
  if (attrs) {
    if (revert.list) {
      return '\n' + indent(`::${tag}${attrs}\n${result}\n::`, { width: (revert.listIndent as number) || 2 })
    }
    return `::${tag}${attrs}\n${result}\n::` + state.context.blockSeparator
  }

  if (revert.list) {
    return '\n' + indent(result, { width: (revert.listIndent as number) || 2 })
  }
  return result + state.context.blockSeparator
}

function ul(node: ElementNode, state: State) {
  return list('ul', node, state, { order: false, listIndent: 2 })
}

function ol(node: ElementNode, state: State) {
  // `start` is carried by the native numbering; IMPLICIT_ATTRS drops it from user attrs.
  const start = Number((node[1] as Record<string, unknown>).start)
  const order = Number.isInteger(start) && start >= 1 ? start : 1
  return list('ol', node, state, { order, listIndent: 3 })
}

// --- p ---

async function p(node: ElementNode, state: State, parent?: ElementNode) {
  let result = ''
  for (let i = 2; i < node.length; i++) {
    result += await state.one(node[i] as Node, state, node, result === '' || result.endsWith('\n'))
  }

  const attrs = comarkAttributes(node[1])
  if (attrs) result = `${result.replace(/[ \t]+$/, '')} ${attrs}`

  if (parent?.[0] === 'li') {
    return result
  }
  return result + state.context.blockSeparator
}

// --- pre ---

function pre(node: ElementNode, state: State) {
  const [_, attributes, ...children] = node

  const codeClasses = (children[0]?.[1] as Record<string, string>)?.class

  const language =
    attributes.language ||
    codeClasses
      ?.split(' ')
      .find((cls) => cls.startsWith('language-'))
      ?.slice(9) ||
    ''

  // Escape ] in filename
  const filename = attributes.filename ? ' [' + String(attributes.filename).split(']').join('\\\\]') + ']' : ''

  const highlights = attributes.highlights ? ' {' + formatHighlights(attributes.highlights as number[]) + '}' : ''

  // Meta always has a leading space
  const meta = attributes.meta ? ' ' + attributes.meta : ''

  const code = String(node[1]?.code || textContent(node)).trimEnd()
  const fence = pickFence(code)

  const fenceBlock = fence + language + filename + highlights + meta + '\n' + code + '\n' + fence
  // Extra user attrs that can't ride on the fence info string round-trip via
  // `::pre{attrs}\n```…```\n::` — mirrors the wrapper form for ul/ol/table/blockquote.
  const attrs = comarkAttributes(userBlockAttrs('pre', attributes as Record<string, unknown>))
  if (attrs) {
    return `::pre${attrs}\n${fenceBlock}\n::` + state.context.blockSeparator
  }

  return fenceBlock + state.context.blockSeparator
}

function formatHighlights(highlights: number[]): string {
  if (highlights.length === 0) return ''

  const sorted = [...highlights].sort((a, b) => a - b)
  const ranges: string[] = []
  let start = sorted[0]
  let end = sorted[0]

  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      // Add the current range
      if (start === end) {
        ranges.push(String(start))
      } else {
        ranges.push(start + '-' + end)
      }
      // Start a new range
      if (i < sorted.length) {
        start = sorted[i]
        end = sorted[i]
      }
    }
  }

  return ranges.join(',')
}

// --- table ---

type Alignment = 'left' | 'center' | 'right' | null

// Helper function to extract alignment from style attribute
function getAlignment(attributes: Record<string, unknown>): Alignment {
  const style = attributes.style
  if (typeof style !== 'string') {
    return null
  }

  // Parse text-align from style attribute - normalize and check
  const normalized = style.toLowerCase().split(' ').join('').split('\t').join('')

  if (normalized.includes('text-align:left')) {
    return 'left'
  }
  if (normalized.includes('text-align:center')) {
    return 'center'
  }
  if (normalized.includes('text-align:right')) {
    return 'right'
  }

  return null
}

// Helper function to extract text content from a cell
async function getCellContent(cell: Node, state: State): Promise<string> {
  if (typeof cell === 'string') {
    return escapePipes(cell)
  }

  const [, , ...children] = cell
  let content = ''
  for (const child of children) {
    if (typeof child === 'string') {
      content += child
    } else {
      content += await state.one(child, state, cell as unknown as ElementNode)
    }
  }

  // The parser trims U+00A0 from cell edges
  const trimmed = content.replace(/^[ \t\n]+|[ \t\n]+$/g, '')
  return escapePipes(trimmed.replace(/^\u00a0+|\u00a0+$/g, (nbsp) => '&nbsp;'.repeat(nbsp.length)))
}

// Helper function to escape pipe characters and handle newlines
function escapePipes(text: string): string {
  // Replace newlines with spaces (tables don't support multi-line cells)
  // Then escape pipe characters
  return text.split('\n').join(' ').split('|').join('\\|')
}

// Helper function to get all rows from thead/tbody
function getRows(element: Node): ElementNode[] {
  if (typeof element === 'string') {
    return []
  }

  const [tag, , ...children] = element

  // If it's a tr, return it directly
  if (tag === 'tr') {
    return [element]
  }

  // If it's thead/tbody, extract tr elements
  if (tag === 'thead' || tag === 'tbody') {
    return children.filter((child) => typeof child !== 'string' && child[0] === 'tr') as ElementNode[]
  }

  return []
}

// Helper function to get cells from a row
function getCells(row: ElementNode): ElementNode[] {
  const [, , ...children] = row
  return children.filter(
    (child) => typeof child !== 'string' && (child[0] === 'th' || child[0] === 'td')
  ) as ElementNode[]
}

async function table(node: ElementNode, state: State) {
  const [, , ...children] = node

  // Extract thead and tbody
  let headerRows: ElementNode[] = []
  let bodyRows: ElementNode[] = []

  for (const child of children) {
    if (typeof child === 'string') continue

    const [tag] = child
    if (tag === 'thead') {
      headerRows = getRows(child)
    } else if (tag === 'tbody') {
      bodyRows = getRows(child)
    } else if (tag === 'tr') {
      // Direct tr children (no thead/tbody wrapper)
      const cells = getCells(child)
      if (cells.length > 0 && cells[0][0] === 'th') {
        headerRows.push(child)
      } else {
        bodyRows.push(child)
      }
    }
  }

  // If no header rows, create a default header based on the first body row
  if (headerRows.length === 0 && bodyRows.length > 0) {
    const firstRow = bodyRows[0]
    const cells = getCells(firstRow)
    const headerCells: ElementNode[] = cells.map((_, i) => ['th', {}, `Column ${i + 1}`] as ElementNode)
    headerRows = [['tr', {}, ...headerCells] as ElementNode]
  }

  if (headerRows.length === 0) {
    return ''
  }

  // Process header row (use the first header row)
  const headerRow = headerRows[0]
  const headerCells = getCells(headerRow)
  const headerContent: string[] = []
  for (const cell of headerCells) {
    headerContent.push(await getCellContent(cell, state))
  }

  // Extract alignment from header cells
  const alignments = headerCells.map((cell) => {
    const [, attributes] = cell
    return getAlignment(attributes)
  })

  // Calculate column widths (minimum 3 characters per column)
  const columnWidths = headerContent.map((content) => Math.max(3, content.length))

  // Update column widths based on body content
  for (const row of bodyRows) {
    const cells = getCells(row)
    for (let i = 0; i < cells.length; i++) {
      if (i < columnWidths.length) {
        const content = await getCellContent(cells[i], state)
        columnWidths[i] = Math.max(columnWidths[i], content.length)
      }
    }
  }

  // Build the markdown table
  let result = '| '
  result += headerContent.map((content, i) => content.padEnd(columnWidths[i])).join(' | ')
  result += ' |\n'

  // Add separator row with alignment
  result += '| '
  result += columnWidths
    .map((width, i) => {
      const alignment = alignments[i]
      if (alignment === 'left') {
        return ':' + '-'.repeat(width - 1)
      } else if (alignment === 'center') {
        return ':' + '-'.repeat(width - 2) + ':'
      } else if (alignment === 'right') {
        return '-'.repeat(width - 1) + ':'
      }
      return '-'.repeat(width)
    })
    .join(' | ')
  result += ' |\n'

  // Add body rows
  for (const row of bodyRows) {
    const cells = getCells(row)
    const cellContents: string[] = []
    for (let i = 0; i < cells.length; i++) {
      const content = await getCellContent(cells[i], state)
      cellContents.push(content.padEnd(columnWidths[i] || 0))
    }

    // Fill missing columns with empty cells
    while (cellContents.length < columnWidths.length) {
      cellContents.push(''.padEnd(columnWidths[cellContents.length]))
    }

    result += '| ' + cellContents.join(' | ') + ' |\n'
  }

  // result already ends with \n, so we only need to add one more \n
  // table with user attrs round-trips via `::table{attrs}\n<table>\n::` —
  // GFM table syntax has no slot for table-level attrs.
  const attrs = comarkAttributes(userBlockAttrs('table', node[1] as Record<string, unknown>))
  if (attrs) {
    return `::table${attrs}\n${result.trimEnd()}\n::\n\n`
  }

  return result + '\n'
}

// thead / tbody / tr / th / td are rendered by the table handler
function tablePart(_node: ElementNode, _state: State) {
  return ''
}

// --- template ---

// slot template
async function template(node: ElementNode, state: State, parent?: ElementNode) {
  const [_, attrs] = node

  const content = (await state.flow(node, state)).trimEnd()

  // Omit #default marker if this is the only slot
  if (attrs.name === 'default') {
    const siblings = parent ? (parent.slice(2) as Node[]) : []
    const templateCount = siblings.filter(
      (child) => Array.isArray(child) && (child as ElementNode)[0] === 'template'
    ).length
    if (templateCount === 1) {
      return content + state.context.blockSeparator
    }
  }

  const { name: _name, $: _$, ...rest } = attrs
  const extraAttrs = comarkAttributes(rest)

  return `#${attrs.name}${extraAttrs}\n${content}` + state.context.blockSeparator
}

export const handlers: Record<string, NodeHandler> = {
  code,
  pre,
  hr,
  br,
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  p,
  a,
  ul,
  ol,
  li,
  html,
  strong,
  em: emphesis,
  blockquote,
  img,
  del,
  mdc,
  template,
  table,
  thead: tablePart,
  tbody: tablePart,
  tr: tablePart,
  th: tablePart,
  td: tablePart,
  comment,
  math,
  mermaid,
}
