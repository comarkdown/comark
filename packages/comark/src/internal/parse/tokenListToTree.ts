import { Token } from 'markdown-exit'
import type { CommentNode, ElementNode, ElementNodeAttributes, Node } from 'comark'
import {
  extractAttributes,
  mergeAdjacentTextNodes,
  parseCodeblockInfo,
  processAttributes,
  slugify,
} from './token-processor-utils.ts'
import { parseHtmlInline } from './html/utils.ts'
import { textContent } from 'comark/utils'

const inlineTags = new Set(['strong', 'em', 'del', 'code', 'a', 'span', 'sub', 'sup'])
// `::tag` components that should fold into a single same-tagged child.
const WRAPPER_TAGS = new Set(['ul', 'ol', 'table', 'blockquote', 'pre'])

type ProcessorResult = {
  nextIndex: number
  node?: Node
}

export interface ProcessorOptions {
  preservePositions?: boolean
  headingIds?: boolean
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
}

/** Shared mutable context for a whole document walk. */
interface ProcessState {
  preservePositions: boolean
  headingIds: boolean
  startLine: number
  headingSlugCounts: Map<string, number>
  headingStack: Array<{ level: number; id: string }>
  /** Unclosed HTML open tags, outer → inner. Lives across blocks like headingStack. */
  htmlStack: HtmlOpenFrame[]
  /**
   * > 0 while building a nested markdown container (list, blockquote, table…).
   * Free paragraphs inside those containers keep ownership of their children
   * instead of nesting into the HTML stack; the finished container lands on the
   * stack as a whole unit via deliverBlock.
   */
  insideMarkdownContainer: number
}

type Processor = (tokens: Token[], start: number, state: ProcessState) => ProcessorResult

function makeHtmlAttrs(attrs: Record<string, unknown>, block: boolean): Record<string, unknown> {
  return {
    $: block ? { html: 1, block: 1 } : { html: 1, block: 0 },
    ...attrs,
  }
}

function isInlineish(node: Node): boolean {
  if (typeof node === 'string') return true
  if (!Array.isArray(node)) return false
  const tag = node[0]
  return tag === null || inlineTags.has(tag as string)
}

function flushPendingInline(frame: HtmlOpenFrame) {
  if (frame.pendingInline.length === 0) return
  const pending = frame.pendingInline
  frame.pendingInline = []
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
function deliverInline(state: ProcessState, node: Node | undefined): Node | undefined {
  if (node === undefined) return undefined
  if (state.htmlStack.length === 0) return node
  const top = state.htmlStack[state.htmlStack.length - 1]
  if (top.block && isInlineish(node)) {
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

function processTokenList(tokens: Token[], state: ProcessState): Node[] {
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

    const handler = processors[token.type]
    if (handler) {
      const depthBefore = state.htmlStack.length
      const { nextIndex, node } = handler(tokens, i, state)

      // Frames that were open before or opened during this block and remain open
      // are block-spanning after we leave the token.
      if (state.htmlStack.length > 0 && (depthBefore > 0 || state.htmlStack.length >= depthBefore)) {
        for (const frame of state.htmlStack) frame.block = true
      }

      if (node !== undefined) {
        if (state.preservePositions) {
          preserveLineNumber(tokens, node, i, nextIndex, state)
        }
        const free = deliverBlock(state, node)
        if (free !== undefined) nodes.push(free)
      }
      i = nextIndex
    } else {
      const componentName = token.tag || 'component'
      const attrs = processAttributes(token.attrs, { handleJSON: false })
      nodes.push([componentName, attrs])
      i += 1
    }
  }

  // EOF — close remaining unclosed HTML tags (outermost last)
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

/**
 * Walk inline tokens. HTML open/close tags drive `state.htmlStack`.
 * Finished free nodes bubble out when the stack is empty.
 */
/**
 * Walk inline tokens.
 * @param nestHtml When true (free paragraph / top-level), free nodes nest into
 *   the open HTML stack. When false (nested markdown containers like strong/li),
 *   free nodes return to the parent container — the container itself later lands
 *   on the HTML stack as a whole unit via deliverBlock.
 */
function processInline(inlineTokens: Token[], state: ProcessState, nestHtml = true): Node[] {
  const nodes: Node[] = []
  let i = 0

  while (i < inlineTokens.length) {
    const token = inlineTokens[i]
    const handler = processors[token.type]

    if (handler) {
      const { nextIndex, node } = handler(inlineTokens, i, state)
      if (nestHtml) {
        const free = deliverInline(state, node)
        if (free !== undefined) nodes.push(free)
      } else if (node !== undefined) {
        nodes.push(node)
      }
      i = nextIndex
    } else {
      // console.log('===> inline token.type', token.type)
      i += 1
    }
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

/**
 * Walk children of an open/close token pair.
 * Nested containers (strong, li, …) keep their children — deliver only for
 * free HTML roots that closed mid-stream.
 */
function processChildren(
  tokens: Token[],
  start: number,
  closeType: string,
  state: ProcessState
): { children: Node[]; nextIndex: number } {
  const children: Node[] = []
  let i = start + 1

  while (i < tokens.length) {
    const token = tokens[i]
    if (token.type === closeType) {
      return { children, nextIndex: i + 1 }
    }

    if (token.type === 'inline') {
      // Nested containers own free inline nodes — don't nest into HTML stack.
      children.push(...processInline(token.children ?? [], state, false))
      i += 1
      continue
    }

    const handler = processors[token.type]
    if (handler) {
      const { nextIndex, node } = handler(tokens, i, state)
      // Nested containers own their children — push directly, no block deliver.
      if (node !== undefined) children.push(node)
      i = nextIndex
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

function createTokenProcessor(closeType: string, tag: string = '', nest = false) {
  return (tokens: Token[], start: number, state: ProcessState) => {
    const open = tokens[start]
    if (nest) state.insideMarkdownContainer += 1
    const { children, nextIndex } = processChildren(tokens, start, closeType, state)
    if (nest) state.insideMarkdownContainer -= 1
    const attrs = processAttributes(open.attrs)
    return processPossibleAttributesSyntax(tokens, {
      nextIndex,
      node: [tag || open.tag, attrs, ...mergeAdjacentTextNodes(children)],
    })
  }
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
    if (!currentSlot) return
    nodes.push([currentSlot.tag, currentSlot.attrs, ...mergeAdjacentTextNodes(currentSlot.children)] as ElementNode)
    currentSlot = null
  }

  const pushChild = (node: Node | undefined) => {
    if (node === undefined) return
    if (currentSlot) currentSlot.children.push(node)
    else nodes.push(node)
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

    const handler = processors[token.type]
    if (handler) {
      const { nextIndex, node } = handler(tokens, i, state)
      // Nested block (paragraph, list, …) may have been opened while HTML stack is
      // active; top-level processTokenList delivers such nodes. Here inside an mdc
      // block the paragraph is a sibling of slots — push as-is.
      pushChild(node)
      i = nextIndex
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
  state.insideMarkdownContainer += 1
  const { children, nextIndex } = processBlockChildrenWithSlots(tokens, start, 'mdc_block_close', state)
  state.insideMarkdownContainer -= 1
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

  const preAttrs: Record<string, unknown> = {}
  const codeAttrs: Record<string, unknown> = {}
  if (parsed.language && parsed.language.trim()) {
    preAttrs.language = parsed.language
    codeAttrs['class'] = `language-${parsed.language}`
  }
  if (parsed.filename) preAttrs.filename = parsed.filename
  if (parsed.highlights) preAttrs.highlights = parsed.highlights
  if (parsed.meta) preAttrs.meta = parsed.meta

  const codeContentWithoutLastNewline = content.endsWith('\n') ? content.slice(0, -1) : content
  return {
    nextIndex: start + 1,
    node: ['pre', preAttrs, ['code', codeAttrs, codeContentWithoutLastNewline]],
  }
}

function uniqueSlug(slug: string, level: number, state: ProcessState): string {
  while (state.headingStack.length > 0 && state.headingStack[state.headingStack.length - 1].level >= level) {
    state.headingStack.pop()
  }
  if (state.headingStack.length > 0) {
    const parent = state.headingStack[state.headingStack.length - 1]
    if (parent.level >= 2) {
      slug = parent.id + '-' + slug
    }
  }

  state.headingStack.push({ level, id: slug })

  const count = state.headingSlugCounts.get(slug) ?? 0
  state.headingSlugCounts.set(slug, count + 1)
  return count === 0 ? slug : `${slug}-${count}`
}

const processors: Record<string, Processor> = {
  mdc_block_slot_open: createTokenProcessor('mdc_block_slot_close'),
  mdc_block_open: processMdcBlock,
  mdc_inline_span_open: createTokenProcessor('mdc_inline_span_close'),
  mdc_block_shorthand_open: createTokenProcessor('mdc_block_shorthand_close'),
  mdc_inline_component_open: createTokenProcessor('mdc_inline_component_close'),
  mdc_block_shorthand(tokens, start) {
    const token = tokens[start]
    return {
      nextIndex: start + 1,
      node: [token.tag, processAttributes(token.attrs)] as ElementNode,
    }
  },
  heading_open(tokens, start, state) {
    const { nextIndex, node } = createTokenProcessor('heading_close')(tokens, start, state)
    if (node.length === 2) {
      return { node: undefined, nextIndex }
    }

    if (state.headingIds) {
      const level = Number.parseInt((tokens[start].tag || 'h1').replace('h', ''), 10) || 1
      const _textContent = textContent(node)
      const headingId = uniqueSlug(slugify(_textContent), level, state)
      ;(node as ElementNode)[1] = { id: headingId, ...(node[1] as Record<string, unknown>) }
    }

    return { nextIndex, node }
  },
  blockquote_open: createTokenProcessor('blockquote_close', '', true),

  paragraph_open(tokens, start, state) {
    const inline = tokens[start + 1]
    const depthBefore = state.htmlStack.length

    // Paragraph body walks with nestHtml=true so free content nests into open
    // HTML frames. Nested markdown containers (lists etc.) call processChildren
    // with nestHtml=false so they keep ownership of their own paragraphs.
    // Detect nesting via: was stack already open AND are we being called from
    // processChildren of another container? We approximate: if stack open before
    // and paragraph has no html_inline children, treat as free body paragraph
    // that should nest — which is correct for ai-thinking body. For list items
    // stack is open but paragraph goes through list's processChildren...
    //
    // list → processChildren → paragraph_open. We need nestHtml=false here when
    // paragraph is owned by a nested container. Signal via state flag.
    const nestHtml = state.insideMarkdownContainer === 0

    // Manual paragraph walk so we can pass nestHtml
    let i = start + 1
    const freeChildren: Node[] = []
    while (i < tokens.length && tokens[i].type !== 'paragraph_close') {
      const token = tokens[i]
      if (token.type === 'inline') {
        freeChildren.push(...processInline(token.children ?? [], state, nestHtml))
        i += 1
        continue
      }
      const handler = processors[token.type]
      if (handler) {
        const result = handler(tokens, i, state)
        if (result.node !== undefined) freeChildren.push(result.node)
        i = result.nextIndex
      } else {
        i += 1
      }
    }
    const nextIndex = i < tokens.length && tokens[i].type === 'paragraph_close' ? i + 1 : i

    // Stack fully emptied during this paragraph → free children are closed HTML roots
    if (depthBefore > 0 && state.htmlStack.length === 0) {
      if (freeChildren.length === 1 && Array.isArray(freeChildren[0])) {
        return { nextIndex, node: freeChildren[0] as ElementNode }
      }
      if (freeChildren.length === 0) return { nextIndex, node: undefined }
      return {
        nextIndex,
        node: ['p', processAttributes(tokens[start].attrs), ...mergeAdjacentTextNodes(freeChildren)],
      }
    }

    // Stack still open after this paragraph — content already nestled via deliverInline.
    if (state.htmlStack.length > 0) {
      if (nestHtml) {
        for (const frame of state.htmlStack) flushPendingInline(frame)
        return { nextIndex, node: undefined }
      }
      // Owned by nested markdown container — keep free <p> for the container
      if (freeChildren.length === 0) return { nextIndex, node: undefined }
      return {
        nextIndex,
        node: ['p', processAttributes(tokens[start].attrs), ...mergeAdjacentTextNodes(freeChildren)],
      }
    }

    // Normal paragraph
    if (freeChildren.length === 0) return { nextIndex, node: undefined }

    const node = ['p', processAttributes(tokens[start].attrs), ...mergeAdjacentTextNodes(freeChildren)] as ElementNode
    const result = processPossibleAttributesSyntax(tokens, { nextIndex, node })

    // Unwrap <p> when it wraps a single HTML root (complete tag, void, or comment)
    const final = result.node
    const canUnwrap =
      Array.isArray(final) &&
      final.length === 3 &&
      inline?.type === 'inline' &&
      inline.children?.[0]?.type === 'html_inline' &&
      (!inlineTags.has((final[2] as ElementNode)?.[0] as string) || (node[2][1] as ElementNodeAttributes)?.$!.block)

    if (canUnwrap) {
      const node = final[2]
      if ((node[1] as ElementNodeAttributes).$) {
        ;(node[1] as ElementNodeAttributes)!.$!.block = 1
      }
      return { nextIndex: result.nextIndex, node: final[2] as ElementNode }
    }

    return result
  },

  // nest=true: containers that own child paragraphs/inlines (so free HTML stack
  // doesn't steal their content while a block-level HTML tag is open above them).
  bullet_list_open: createTokenProcessor('bullet_list_close', '', true),
  ordered_list_open: createTokenProcessor('ordered_list_close', '', true),
  list_item_open: createTokenProcessor('list_item_close', '', true),
  strong_open: createTokenProcessor('strong_close'),
  link_open: createTokenProcessor('link_close'),
  em_open: createTokenProcessor('em_close'),
  table_open: createTokenProcessor('table_close', '', true),
  thead_open: createTokenProcessor('thead_close', '', true),
  tbody_open: createTokenProcessor('tbody_close', '', true),
  tr_open: createTokenProcessor('tr_close', '', true),
  th_open: createTokenProcessor('th_close', '', true),
  td_open: createTokenProcessor('td_close', '', true),
  sub_open: createTokenProcessor('sub_close'),
  sup_open: createTokenProcessor('sup_close'),
  s_open: createTokenProcessor('s_close', 'del'),
  mdc_inline_component(tokens, start) {
    const token = tokens[start]
    const tokenAttrs = processAttributes(token.attrs)
    const { attrs, nextIndex } = extractAttributes(tokens, start + 1, false)
    return { node: [token.tag, { ...tokenAttrs, ...attrs }] as Node, nextIndex }
  },

  code_inline: contentNodes((t) => ['code', {}, t.content]),
  math_inline: contentNodes((t) => ['math', { class: 'math inline', content: t.content }, t.content]),
  math_block: contentNodes((t) => ['math', { class: 'math block', content: t.content }, t.content]),
  emoji: contentNodes((t) => t.content),
  hr: contentNodes(() => ['hr', {}]),
  hardbreak: contentNodes(() => ['br', {}]),
  softbreak(_tokens, start, state) {
    // Softbreaks inside open HTML are paragraph separators, not text content
    if (state.htmlStack.length > 0) {
      return { nextIndex: start + 1, node: undefined }
    }
    return { nextIndex: start + 1, node: '\n' }
  },

  code_block: codeBlockProcessor,
  fenced_code_block: codeBlockProcessor,
  fence: codeBlockProcessor,

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
    const comment = tryCommentTag(content, state)
    if (comment) return { nextIndex: start + 1, node: comment.node }

    return { nextIndex: start + 1, node: content }
  },
  /**
   * html_inline drives the document-wide HTML open stack.
   * - self-closing / void → single element
   * - open → push frame (siblings / later blocks fill children)
   * - matching close → pop frame and emit completed element
   */
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
      const top = state.htmlStack[state.htmlStack.length - 1]
      if (top && top.tag === parsed.tag) {
        return { nextIndex: start + 1, node: frameToNode(state.htmlStack.pop()!) }
      }
      return { nextIndex: start + 1, node: undefined }
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
    })
    return { nextIndex: start + 1, node: undefined }
  },
}

function contentNodes(fn: (token: Token) => Node) {
  return (tokens: Token[], start: number): ProcessorResult =>
    processPossibleAttributesSyntax(tokens, { nextIndex: start + 1, node: fn(tokens[start]) })
}

export function tokenListToTree(tokens: Token[], options: ProcessorOptions = {}): Node[] {
  const state: ProcessState = {
    preservePositions: options.preservePositions ?? false,
    headingIds: options.headingIds ?? true,
    startLine: options.startLine ?? 0,
    headingSlugCounts: new Map(),
    headingStack: [],
    htmlStack: [],
    insideMarkdownContainer: 0,
  }
  return processTokenList(tokens, state)
}
