import { Token } from 'markdown-exit/core'
import type { CommentNode, ElementNode, ElementNodeAttributes, HeadingIdsOption, Node } from 'comark'
import { extractAttributes, mergeAdjacentTextNodes, parseCodeblockInfo, processAttributes } from './tree-utils.ts'
import { createHeadingIdTracker, nextHeadingId, reserveHeadingId, type HeadingIdTracker } from '../heading-id.ts'
import { parseHtmlInline } from './utils.ts'
import { textContent } from 'comark/utils'

const inlineTags = new Set(['strong', 'em', 'del', 'code', 'a', 'span', 'sub', 'sup', 'kbd'])
// `::tag` components that should fold into a single same-tagged child.
const WRAPPER_TAGS = new Set(['ul', 'ol', 'table', 'blockquote', 'pre'])

type ProcessorResult = {
  nextIndex: number
  node?: Node
  /**
   * When true, `node` is a completed HTML sibling of whatever is still open on
   * `htmlStack` (e.g. `</div><div>` left free `div` + a new open frame). Emit it
   * at the current document level without nesting into the remaining stack —
   * matching how parse5 / hast-util-raw places sequential root children.
   */
  siblingOfHtmlStack?: boolean
}

export interface ProcessorOptions {
  preservePositions?: boolean
  headingIds?: HeadingIdsOption
  startLine?: number
}

type HtmlOpenFrame = {
  /** Element tag, or `null` for an HTML comment (`<!--` … `-->`). */
  tag: string | null
  attrs: Record<string, unknown>
  children: Node[]
  /** True once this frame has survived past the paragraph that opened it. */
  block: boolean
  /** Bare-inline nodes waiting to be flushed as a single <p> on a block frame. */
  pendingInline: Node[]
  afterText?: boolean
}

/** Shared mutable context for a whole document walk. */
interface ProcessState {
  preservePositions: boolean
  /** `undefined` when auto-generated heading ids are disabled */
  headingIds?: HeadingIdTracker
  startLine: number
  /** Unclosed HTML open tags, outer → inner. Lives across blocks like the heading id stack. */
  htmlStack: HtmlOpenFrame[]
  closers?: CloserIndex
}

type Processor = (tokens: Token[], start: number, state: ProcessState) => ProcessorResult

function makeHtmlAttrs(attrs: Record<string, unknown>, block: boolean): Record<string, unknown> {
  return {
    $: block ? { html: 1, block: 1 } : { html: 1, block: 0 },
    ...attrs,
  }
}

function pushNode(nodes: Node[], node: Node) {
  if (node[0] === 'fragment') nodes.push(...(node.slice(2) as Node[]))
  else nodes.push(node)
}

function isInlineish(node: Node): boolean {
  if (typeof node === 'string') return true
  if (!Array.isArray(node)) return false
  const tag = node[0]
  return tag === null || inlineTags.has(tag as string)
}

function isInlineHtml(node: Node): boolean {
  if (typeof node === 'string') return false
  const tag = node[0]
  if (tag === null || inlineTags.has(tag) || tag === 'img' || tag === 'br') return true
  return tag.includes('-') && node[1].$?.block === 0
}

function flushPendingInline(frame: HtmlOpenFrame) {
  if (frame.pendingInline.length === 0) return
  const pending = frame.pendingInline
  frame.pendingInline = []
  const only = pending.length === 1 ? pending[0] : undefined
  // A lone author-written element is a block of its own, not a paragraph.
  if (Array.isArray(only) && only[1].$?.html && !isInlineish(only)) {
    frame.children.push(only)
    return
  }
  frame.children.push(['p', {}, ...pending] as ElementNode)
}

/** Flatten nested nodes to text — used when emitting comment frames. */
function flattenText(nodes: Node[]): string {
  let out = ''
  for (const n of nodes) {
    if (typeof n === 'string') out += n
    else if (Array.isArray(n)) out += flattenText(n.slice(2) as Node[])
  }
  return out
}

function frameToNode(frame: HtmlOpenFrame): ElementNode | CommentNode {
  flushPendingInline(frame)
  // Comments (`tag === null`): flatten children to a body string.
  // Blank lines between the source paragraphs become `\n\n` between chunks.
  if (frame.tag === null) {
    const chunks = frame.children.map((c) =>
      typeof c === 'string' ? c : flattenText(Array.isArray(c) && c[0] === 'p' ? (c.slice(2) as Node[]) : [c])
    )
    // Spanned comments always had a blank line after `<!--` and before `-->`
    const body = chunks.length > 0 ? `\n\n${chunks.join('\n\n')}\n\n` : ''
    return [null, {}, body] as CommentNode
  }
  return [frame.tag as string, makeHtmlAttrs(frame.attrs, frame.block), ...frame.children]
}

/** Nest a finished block node into the open HTML frame, or return it free. */
function deliverBlock(state: ProcessState, node: Node | undefined): Node | undefined {
  if (node === undefined) return undefined
  if (state.htmlStack.length === 0) return node
  const top = state.htmlStack[state.htmlStack.length - 1]
  flushPendingInline(top)
  top.children.push(node)
  return undefined
}

/** Nest an inline/finished node into the open HTML frame during processInline. */
function deliverInline(state: ProcessState, node: Node | undefined, inline?: boolean): Node | undefined {
  if (node === undefined) return undefined
  if (state.htmlStack.length === 0) return node
  const top = state.htmlStack[state.htmlStack.length - 1]
  if (top.block && (inline ?? isInlineish(node))) {
    top.pendingInline.push(node)
  } else {
    flushPendingInline(top)
    top.children.push(node)
  }
  return undefined
}

/**
 * `<!--` / `-->` are just HTML open/close with `tag === null`.
 * When blank lines split them into plain text tokens, map those tokens onto the
 * same push/pop path html_inline uses for elements.
 */
function tryCommentTag(content: string, state: ProcessState): ProcessorResult | null {
  const top = state.htmlStack[state.htmlStack.length - 1]

  // Close comment
  if (top?.tag === null && content.includes('-->')) {
    const i = content.indexOf('-->')
    if (i > 0) deliverInline(state, content.slice(0, i))
    const frame = state.htmlStack.pop()!
    return { nextIndex: -1, node: frameToNode(frame) } // nextIndex filled by caller
  }

  // Open comment (no close in this chunk)
  if (content.startsWith('<!--') && !content.includes('-->')) {
    const body = content.slice(4)
    state.htmlStack.push({ tag: null, attrs: {}, children: body ? [body] : [], block: true, pendingInline: [] })
    return { nextIndex: -1, node: undefined }
  }

  // Complete comment in one chunk
  if (content.startsWith('<!--') && content.includes('-->')) {
    const end = content.indexOf('-->')
    return { nextIndex: -1, node: [null, {}, content.slice(4, end)] as CommentNode }
  }

  return null
}

function closeFramesTo(state: ProcessState, idx: number): Node | undefined {
  let closed: Node | undefined
  while (state.htmlStack.length > idx) {
    const node = frameToNode(state.htmlStack.pop()!)
    if (state.htmlStack.length > idx) deliverInline(state, node)
    else closed = node
  }
  return closed
}

// Elements that stop a `<p>` from being closed by a following `<p>` (HTML "button scope").
const P_SCOPE_BOUNDARY = new Set(['table', 'td', 'th', 'caption', 'button', 'template', 'object', 'marquee', 'applet'])

function closeImpliedParagraph(token: Token, state: ProcessState): Node | undefined {
  if (!/^<p[\s/>]/i.test(token.content)) return undefined
  const parsed = parseHtmlInline(token.content)
  if (parsed.kind !== 'open' || parsed.tag !== 'p' || parsed.selfClosing) return undefined
  for (let idx = state.htmlStack.length - 1; idx >= 0; idx--) {
    const tag = state.htmlStack[idx].tag
    if (tag === 'p') return closeFramesTo(state, idx)
    if (tag !== null && P_SCOPE_BOUNDARY.has(tag)) return undefined
  }
  return undefined
}

const firstProse = new WeakMap<Token[], number>()

function followsText(tokens: Token[], start: number): boolean {
  let first = firstProse.get(tokens)
  if (first === undefined) {
    first = tokens.findIndex(
      ({ type, content }) => !(type === 'softbreak' || type === 'html_inline' || (type === 'text' && !content.trim()))
    )
    if (first < 0) first = tokens.length
    firstProse.set(tokens, first)
  }
  return first < start
}

/** Where each `</tag>` sits, so "is it closed later?" is a lookup and not a scan of the rest of the document. */
interface CloserIndex {
  /** Token indexes of the paragraphs holding a close tag, by `tag|level`. */
  at: Map<string, number[]>
  /** First later token with a lower level, i.e. where the container of token `i` ends. */
  end: number[]
}

function buildCloserIndex(tokens: Token[]): CloserIndex {
  const at = new Map<string, number[]>()
  const end: number[] = new Array(tokens.length).fill(tokens.length)
  const open: number[] = []
  for (let i = 0; i < tokens.length; i++) {
    while (open.length > 0 && tokens[open[open.length - 1]].level > tokens[i].level) end[open.pop()!] = i
    open.push(i)
    for (const child of tokens[i].type === 'inline' ? (tokens[i].children ?? []) : []) {
      if (child.type !== 'html_inline' || child.content.charCodeAt(1) !== 0x2f /* / */) continue
      const parsed = parseHtmlInline(child.content)
      if (parsed.kind !== 'close') continue
      const key = `${parsed.tag}|${tokens[i].level}`
      const list = at.get(key)
      if (list && list[list.length - 1] !== i) list.push(i)
      else if (!list) at.set(key, [i])
    }
  }
  return { at, end }
}

/**
 * True when a later paragraph of the same container holds `</tag>`. A close tag inside a
 * nested container, or past the end of this one, cannot pair with an opener out here.
 */
function hasCloserAhead(tokens: Token[], state: ProcessState, paragraph: number, from: number, tag: string): boolean {
  const index = (state.closers ??= buildCloserIndex(tokens))
  const list = index.at.get(`${tag}|${tokens[paragraph].level + 1}`)
  if (!list) return false
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] < from) lo = mid + 1
    else hi = mid
  }
  return lo < list.length && list[lo] < index.end[paragraph]
}

function processToken(tokens: Token[], i: number, state: ProcessState): ProcessorResult | undefined {
  return processors[tokens[i].type]?.(tokens, i, state)
}

/**
 * Walk inline tokens. HTML open/close tags drive `state.htmlStack`.
 * @param nestHtml When true (free paragraph / top-level), free nodes nest into
 *   the open HTML stack. When false (nested markdown containers like strong/li),
 *   free nodes return to the parent container — the container itself later lands
 *   on the HTML stack as a whole unit via deliverBlock. Tags opened within
 *   the run always receive the nodes up to their close tag.
 */
function processInline(inlineTokens: Token[], state: ProcessState, nestHtml = true): Node[] {
  const nodes: Node[] = []
  const depth = state.htmlStack.length
  let i = 0

  while (i < inlineTokens.length) {
    const fromHtml = inlineTokens[i].type === 'html_inline'
    if (nestHtml && fromHtml) {
      const closed = closeImpliedParagraph(inlineTokens[i], state)
      if (closed !== undefined) {
        const free = deliverInline(state, closed)
        if (free !== undefined) pushNode(nodes, free)
      }
    }
    const result = processToken(inlineTokens, i, state)
    if (!result) {
      i += 1
      continue
    }
    const node =
      nestHtml || state.htmlStack.length > depth
        ? deliverInline(state, result.node, !fromHtml || (result.node !== undefined && isInlineHtml(result.node)))
        : result.node
    if (node !== undefined) pushNode(nodes, node)
    i = result.nextIndex
  }

  return nodes
}

function preserveLineNumber(tokens: Token[], node: Node, start: number, nextIndex: number, state: ProcessState) {
  let endLine = state.startLine
  if (!Array.isArray(node)) return

  for (let j = start; j < nextIndex; j++) {
    if (tokens[j].map && tokens[j].map?.[1]) {
      endLine = (tokens[j].map?.[1] as number) + state.startLine + (tokens[j].type?.endsWith('_close') ? 1 : 0)
    }
  }
  if (!(node[1] as Record<string, unknown>).$) {
    ;(node[1] as Record<string, unknown>).$ = {}
  }
  ;((node[1] as Record<string, unknown>).$ as Record<string, unknown>).line = endLine
}

/** Walk children of an open/close pair until `closeType`. */
function processChildren(
  tokens: Token[],
  start: number,
  closeType: string,
  state: ProcessState,
  nestHtml = false
): { children: Node[]; nextIndex: number } {
  const children: Node[] = []
  const depth = state.htmlStack.length
  let i = start + 1

  while (i < tokens.length) {
    const token = tokens[i]
    if (token.type === closeType) {
      if (!nestHtml) closeHtmlFrames(state, children, depth, false)
      return { children, nextIndex: i + 1 }
    }

    if (token.type === 'inline') {
      children.push(...processInline(token.children ?? [], state, nestHtml))
      i += 1
      continue
    }

    const result = processToken(tokens, i, state)
    if (result) {
      // Same nesting rule as processInline: free nodes join the open HTML
      // frame when nestHtml is on (e.g. block children under bare HTML).
      const node =
        (nestHtml || state.htmlStack.length > depth) && !result.siblingOfHtmlStack
          ? deliverInline(state, result.node)
          : result.node
      if (node !== undefined) pushNode(children, node)
      i = result.nextIndex
    } else {
      i += 1
    }
  }

  return { children, nextIndex: i }
}

function processPossibleAttributesSyntax(tokens: Token[], value: { nextIndex: number; node: Node }) {
  const extractedAttributes = extractAttributes(tokens, value.nextIndex)
  if (value.nextIndex < extractedAttributes.nextIndex) {
    ;(value.node as ElementNode)[1] = Object.assign(value.node[1], extractedAttributes.attrs)
    value.nextIndex = extractedAttributes.nextIndex
  }

  return value
}

function processBlockChildrenWithSlots(
  tokens: Token[],
  start: number,
  closeType: string,
  state: ProcessState
): { children: Node[]; nextIndex: number } {
  const nodes: Node[] = []
  let i = start + 1
  let currentSlot: { tag: string; attrs: Record<string, unknown>; children: Node[] } | null = null

  const flushSlot = () => {
    closeHtmlFrames(state, currentSlot ? currentSlot.children : nodes)
    if (!currentSlot) return
    nodes.push([currentSlot.tag, currentSlot.attrs, ...mergeAdjacentTextNodes(currentSlot.children)] as ElementNode)
    currentSlot = null
  }

  const pushChild = (node: Node | undefined) => {
    if (node === undefined) return

    pushNode(currentSlot ? currentSlot.children : nodes, node)
  }

  while (i < tokens.length) {
    const token = tokens[i]

    if (token.type === closeType) {
      flushSlot()
      return { children: nodes, nextIndex: i + 1 }
    }

    if (token.type === 'mdc_block_slot_open') {
      flushSlot()
      currentSlot = {
        tag: token.tag || 'template',
        attrs: processAttributes(token.attrs),
        children: [],
      }
      i += 1
      continue
    }

    if (token.type === 'mdc_block_slot_close') {
      i += 1
      continue
    }

    if (token.type === 'inline') {
      const free = processInline(token.children ?? [], state)
      if (currentSlot) currentSlot.children.push(...free)
      else nodes.push(...free)
      i += 1
      continue
    }

    const result = processToken(tokens, i, state)
    if (result) {
      pushChild(result.node)
      i = result.nextIndex
    } else {
      i += 1
    }
  }

  flushSlot()
  return { children: nodes, nextIndex: i }
}

function processMdcBlock(tokens: Token[], start: number, state: ProcessState): ProcessorResult {
  const open = tokens[start]
  // Own child paragraphs/inlines so an outer unclosed HTML tag (e.g. `<Hello>`)
  // doesn't steal `::component` body content off the stack.
  const { children, nextIndex } = withHtmlScope(state, () =>
    processBlockChildrenWithSlots(tokens, start, 'mdc_block_close', state)
  )
  const attrs = processAttributes(open.attrs)

  let node = [open.tag || 'div', attrs, ...mergeAdjacentTextNodes(children)] as ElementNode
  if (WRAPPER_TAGS.has(node[0])) {
    if (children.length === 1 && children[0][0] === node[0]) {
      node = node[2] as ElementNode
      node[1] = { ...node[1], ...attrs }
    }
  }
  return processPossibleAttributesSyntax(tokens, {
    nextIndex,
    node,
  })
}

function codeBlockProcessor(tokens: Token[], start: number, _state: ProcessState): ProcessorResult {
  const token = tokens[start]
  const content = token.content || ''
  const info = token.info || (token as Token & { params?: string }).params || ''

  const parsed = parseCodeblockInfo(info)

  const preAttrs: Record<string, unknown> = parsed
  const codeAttrs: Record<string, unknown> = {}
  if (parsed.language && parsed.language.trim()) {
    preAttrs.language = parsed.language
    codeAttrs['class'] = `language-${parsed.language}`
  }

  const codeContentWithoutLastNewline = content.endsWith('\n') ? content.slice(0, -1) : content
  return {
    nextIndex: start + 1,
    node: ['pre', preAttrs, ['code', codeAttrs, codeContentWithoutLastNewline]],
  }
}

// Stringify needs the delimiter to write `\(` and `\[` math back; `$` math keeps its old shape.
function mathAttributes(className: string, token: Token): ElementNodeAttributes {
  const attributes: ElementNodeAttributes = { class: className, content: token.content }
  if (token.markup.startsWith('\\')) attributes.$ = { markup: token.markup }
  return attributes
}

function singleToken(fn: (token: Token) => Node) {
  return (tokens: Token[], start: number): ProcessorResult =>
    processPossibleAttributesSyntax(tokens, { nextIndex: start + 1, node: fn(tokens[start]) })
}

/**
 * Run `fn` with a fresh HTML stack so tags opened inside a markdown container
 * (list item, blockquote, table cell…) are paired and closed within it, and
 * cannot capture the container's siblings. Frames still open when the
 * container ends are closed into its children, like EOF does at the root.
 */
function withHtmlScope(
  state: ProcessState,
  fn: () => { children: Node[]; nextIndex: number }
): { children: Node[]; nextIndex: number } {
  const outerStack = state.htmlStack
  state.htmlStack = []
  try {
    const result = fn()
    closeHtmlFrames(state, result.children)
    return result
  } finally {
    state.htmlStack = outerStack
  }
}

/** Close HTML frames above `depth`, innermost into its parent, outermost into `children`. */
function closeHtmlFrames(state: ProcessState, children: Node[], depth = 0, block = true) {
  while (state.htmlStack.length > depth) {
    const frame = state.htmlStack.pop()!
    if (block) frame.block = true
    const node = frameToNode(frame)
    if (state.htmlStack.length > depth) state.htmlStack[state.htmlStack.length - 1].children.push(node)
    else children.push(node)
  }
}

function openCloseToken(closeType: string, tag: string = '', nest = false) {
  return (tokens: Token[], start: number, state: ProcessState) => {
    const open = tokens[start]
    const { children, nextIndex } = nest
      ? withHtmlScope(state, () => processChildren(tokens, start, closeType, state, true))
      : processChildren(tokens, start, closeType, state)
    const attrs = processAttributes(open.attrs)
    return processPossibleAttributesSyntax(tokens, {
      nextIndex,
      node: [tag || open.tag, attrs, ...mergeAdjacentTextNodes(children)],
    })
  }
}

const processors: Record<string, Processor> = {
  // nest=true: containers that own child paragraphs/inlines (so free HTML stack
  // doesn't steal their content while a block-level HTML tag is open above them).
  mdc_block_slot_open: openCloseToken('mdc_block_slot_close'),
  mdc_inline_span_open: openCloseToken('mdc_inline_span_close'),
  mdc_block_shorthand_open: openCloseToken('mdc_block_shorthand_close'),
  mdc_inline_component_open: openCloseToken('mdc_inline_component_close'),
  blockquote_open: openCloseToken('blockquote_close', '', true),
  bullet_list_open: openCloseToken('bullet_list_close', '', true),
  ordered_list_open: openCloseToken('ordered_list_close', '', true),
  list_item_open: openCloseToken('list_item_close', '', true),
  strong_open: openCloseToken('strong_close'),
  link_open: openCloseToken('link_close'),
  em_open: openCloseToken('em_close'),
  table_open: openCloseToken('table_close', '', true),
  thead_open: openCloseToken('thead_close', '', true),
  tbody_open: openCloseToken('tbody_close', '', true),
  tr_open: openCloseToken('tr_close', '', true),
  th_open: openCloseToken('th_close', '', true),
  td_open: openCloseToken('td_close', '', true),
  sub_open: openCloseToken('sub_close'),
  sup_open: openCloseToken('sup_close'),
  s_open: openCloseToken('s_close', 'del'),
  mdc_block_open: processMdcBlock,
  code_inline: singleToken((t) => ['code', {}, t.content]),
  math_inline: singleToken((t) => ['math', mathAttributes('math inline', t), t.content]),
  math_block: singleToken((t) => ['math', mathAttributes('math block', t), t.content]),
  emoji: singleToken((t) => t.content),
  hr: singleToken(() => ['hr', {}]),
  hardbreak: singleToken(() => ['br', {}]),
  reference: (_, s) => ({ node: undefined, nextIndex: s + 1 }),
  // Softbreaks inside open HTML are paragraph separators, not text content
  softbreak: (tokens, start, state) => ({
    nextIndex: start + 1,
    node: state.htmlStack.length > 0 || tokens[start - 1].type === 'html_inline' ? undefined : '\n',
  }),
  code_block: codeBlockProcessor,
  fenced_code_block: codeBlockProcessor,
  fence: codeBlockProcessor,
  mdc_block_shorthand: singleToken((t) => [t.tag, processAttributes(t.attrs)]),
  heading_open(tokens, start, state) {
    const { nextIndex, node } = openCloseToken('heading_close')(tokens, start, state)
    if (node.length === 2) return { node: undefined, nextIndex }

    if (state.headingIds) {
      const level = Number.parseInt((tokens[start].tag || 'h1').replace('h', ''), 10) || 1
      const headingId = nextHeadingId(textContent(node), level, state.headingIds)
      // User-supplied `id` wins over the auto-generated one.
      reserveHeadingId(state.headingIds, (node[1] as Record<string, unknown>).id)
      if (headingId) {
        ;(node as ElementNode)[1] = { id: headingId, ...(node[1] as Record<string, unknown>) }
      }
    }

    return { nextIndex, node }
  },

  paragraph_open(tokens, start, state) {
    const inline = tokens[start + 1]
    const depthBefore = state.htmlStack.length
    const { children, nextIndex } = processChildren(tokens, start, 'paragraph_close', state, true)
    // `text <tag>` with no `</tag>` anywhere after is prose, not a container: it ends with its paragraph.
    const opened = state.htmlStack[depthBefore]
    if (opened?.afterText && opened.tag !== null && !hasCloserAhead(tokens, state, start, nextIndex, opened.tag)) {
      const free = deliverInline(state, closeFramesTo(state, depthBefore), true)
      if (free !== undefined) pushNode(children, free)
    }
    const asParagraph = (): ProcessorResult =>
      children.length === 0
        ? { nextIndex, node: undefined }
        : {
            nextIndex,
            node: ['p', processAttributes(tokens[start].attrs), ...mergeAdjacentTextNodes(children)],
          }
    /** Emit free siblings produced while an HTML frame stayed open (e.g. `</div><div>`). */
    const freeSiblings = (asSiblingOfStack: boolean): ProcessorResult => {
      if (children.length === 0) return { nextIndex, node: undefined }
      const node = children.length === 1 ? children[0] : (['fragment', {}, ...children] as ElementNode)
      return { nextIndex, node, siblingOfHtmlStack: asSiblingOfStack || undefined }
    }

    // Closed HTML root that started before this paragraph.
    if (depthBefore > 0 && state.htmlStack.length === 0) {
      if (children.length === 1 && Array.isArray(children[0])) {
        return { nextIndex, node: children[0] as ElementNode }
      }
      return asParagraph()
    }

    // Stack still open — free content already nested via deliverInline into the
    // current parent. The one remaining case is close-then-open at document
    // root (`</div><div>`): the closed node sits free in `children` while a new
    // frame is open, and must emit as a sibling of that frame (parse5-style),
    // not nest into it.
    if (state.htmlStack.length > 0) {
      for (const frame of state.htmlStack) flushPendingInline(frame)
      return freeSiblings(children.length > 0)
    }

    const empty = asParagraph()
    if (empty.node === undefined) return empty

    const result = processPossibleAttributesSyntax(tokens, { nextIndex, node: empty.node })
    const final = result.node
    const canUnwrap =
      Array.isArray(final) &&
      final.length === 3 &&
      // Only an element can replace the paragraph; a stray closer (`</div> text`)
      // leaves a bare string that must stay wrapped.
      Array.isArray(final[2]) &&
      inline?.type === 'inline' &&
      inline.children?.[0]?.type === 'html_inline' &&
      (!inlineTags.has((final[2] as ElementNode)?.[0] as string) ||
        Boolean((empty.node[2][1] as ElementNodeAttributes)?.$?.block))

    if (canUnwrap) {
      const unwrapped = final[2] as ElementNode
      if ((unwrapped[1] as ElementNodeAttributes).$) {
        ;(unwrapped[1] as ElementNodeAttributes).$!.block = 1
      }
      return { nextIndex: result.nextIndex, node: unwrapped }
    }

    if ((result.node as ElementNode).every((n, i) => i < 2 || (n?.[1] as ElementNodeAttributes)?.$?.html)) {
      ;(result.node as ElementNode)[0] = 'fragment'
    }

    return result
  },
  mdc_inline_component(tokens, start) {
    const token = tokens[start]
    const tokenAttrs = processAttributes(token.attrs)
    const { attrs, nextIndex } = extractAttributes(tokens, start + 1, false)
    return { node: [token.tag, { ...tokenAttrs, ...attrs }] as Node, nextIndex }
  },

  image(tokens, start) {
    const token = tokens[start]
    const attrs = processAttributes(token.attrs, { handleJSON: false, filterEmpty: true })
    if (token.content) {
      attrs.alt = token.content
    }
    return processPossibleAttributesSyntax(tokens, { node: ['img', attrs] as Node, nextIndex: start + 1 })
  },

  text(tokens, start, state) {
    const content = tokens[start].content
    if (content === '') return { nextIndex: start + 1, node: undefined }

    // `<!--` / `-->` are HTML open/close with tag null (may arrive as plain text
    // when blank lines split a multi-line comment).
    const comment = tokens[start].meta?.literal ? null : tryCommentTag(content, state)
    if (comment) return { nextIndex: start + 1, node: comment.node }

    return { nextIndex: start + 1, node: content }
  },
  // html_inline drives the document-wide HTML open stack — the same shape
  // hast-util-raw feeds parse5: open tags push, close tags pop (and auto-close
  // mismatched intermediates), void/self-closing emit immediately.
  // - self-closing / void → single element
  // - open → push frame (siblings / later blocks fill children)
  // - matching close → pop frame(s) and emit completed element
  html_inline(tokens, start, state) {
    const raw = tokens[start].content || ''
    const parsed = parseHtmlInline(raw)

    if (parsed.kind === 'comment') {
      return { nextIndex: start + 1, node: [null, {}, parsed.content] }
    }
    if (parsed.kind === 'other') {
      // Bare `<!--` / `-->` fragments use the same stack as elements.
      const comment = tryCommentTag(raw, state)
      if (comment) return { nextIndex: start + 1, node: comment.node }
      return { nextIndex: start + 1, node: [null, {}, raw] }
    }

    if (parsed.kind === 'close') {
      if (parsed.tag === 'br') return { nextIndex: start + 1, node: ['br', makeHtmlAttrs({}, false)] }
      // Find the matching open frame (case-insensitive), auto-closing any
      // nested frames above it the way a real HTML parser would.
      const closeTag = parsed.tag.toLowerCase()
      let idx = state.htmlStack.length - 1
      while (idx >= 0) {
        const frameTag = state.htmlStack[idx].tag
        if (frameTag !== null && frameTag.toLowerCase() === closeTag) break
        idx--
      }
      if (idx < 0) {
        // HTML parsers read a stray `</br>` as `<br>`
        const node: Node | undefined = closeTag === 'br' ? ['br', makeHtmlAttrs({}, false)] : undefined
        return { nextIndex: start + 1, node }
      }

      return { nextIndex: start + 1, node: closeFramesTo(state, idx) }
    }

    if (parsed.selfClosing) {
      return {
        nextIndex: start + 1,
        node: [parsed.tag, makeHtmlAttrs(parsed.attrs, false)],
      }
    }

    state.htmlStack.push({
      tag: parsed.tag,
      attrs: parsed.attrs,
      children: [],
      block: false,
      pendingInline: [],
      afterText: followsText(tokens, start),
    })
    return { nextIndex: start + 1, node: undefined }
  },
}

export function tokenListToTree(tokens: Token[], options: ProcessorOptions = {}): Node[] {
  const state: ProcessState = {
    preservePositions: options.preservePositions ?? false,
    headingIds: createHeadingIdTracker(options.headingIds ?? true),
    startLine: options.startLine ?? 0,
    htmlStack: [],
  }
  const nodes: Node[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    if (token.type === 'inline') {
      const free = processInline(token.children ?? [], state)
      // Free inline at block level (rare) — if stack open, nest; else emit
      if (state.htmlStack.length > 0) {
        for (const n of free) state.htmlStack[state.htmlStack.length - 1].children.push(n)
      } else {
        nodes.push(...free)
      }
      i += 1
      continue
    }

    const result = processToken(tokens, i, state)
    if (result) {
      // Remaining open frames span past this block.
      for (const frame of state.htmlStack) frame.block = true

      if (result.node !== undefined) {
        if (state.preservePositions) {
          preserveLineNumber(tokens, result.node, i, result.nextIndex, state)
        }
        // Sibling free nodes from close-then-open (`</div><div>`) sit beside the
        // remaining open stack, not inside it — same as parse5 root children.
        if (result.siblingOfHtmlStack) {
          pushNode(nodes, result.node)
        } else {
          const free = deliverBlock(state, result.node)
          if (free !== undefined) pushNode(nodes, free)
        }
      }
      i = result.nextIndex
    } else {
      nodes.push([token.tag || 'component', processAttributes(token.attrs, { handleJSON: false })])
      i += 1
    }
  }

  // EOF — close remaining unclosed HTML tags (outermost last).
  // Incomplete openers with only text leaves stay block: 0 (inline-like).
  // Anything with element children (markdown, nested HTML, lists) is block: 1.
  while (state.htmlStack.length > 0) {
    const frame = state.htmlStack.pop()!
    frame.block = true
    const node = frameToNode(frame)
    if (state.htmlStack.length > 0) {
      state.htmlStack[state.htmlStack.length - 1].children.push(node)
    } else {
      nodes.push(node)
    }
  }

  return nodes
}
