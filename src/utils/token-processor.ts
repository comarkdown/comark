import type { MinimarkNode } from 'minimark'
import MarkdownIt from 'markdown-it'
// @ts-expect-error - No declaration file
import markdownItSub from 'markdown-it-sub'
import markdownItMDC from 'markdown-it-mdc'

const md = new MarkdownIt()
  .use(markdownItSub)
  .use(markdownItMDC)

// Mapping from token types to tag names
const BLOCK_TAG_MAP: Record<string, string> = {
  blockquote_open: 'blockquote',
  ordered_list_open: 'ol',
  bullet_list_open: 'ul',
  list_item_open: 'li',
  paragraph_open: 'p',
  table_open: 'table',
  thead_open: 'thead',
  tbody_open: 'tbody',
  tr_open: 'tr',
  th_open: 'th',
  td_open: 'td',
}

const INLINE_TAG_MAP: Record<string, string> = {
  strong_open: 'strong',
  em_open: 'em',
  s_open: 'del',
  sub_open: 'del',
}

/**
 * Extract and process attributes from a token's attrs array
 */
function processAttributes(
  attrsArray: any[] | null | undefined,
  options: {
    handleBoolean?: boolean
    handleJSON?: boolean
    filterEmpty?: boolean
  } = {},
): Record<string, unknown> {
  const { handleBoolean = true, handleJSON = true, filterEmpty = false } = options
  const attrs: Record<string, unknown> = {}

  if (!attrsArray || !Array.isArray(attrsArray)) {
    return attrs
  }

  for (const attr of attrsArray) {
    if (Array.isArray(attr) && attr.length >= 2) {
      let [key, value] = attr

      // Filter empty values if requested
      if (filterEmpty && (value === '' || value === null || value === undefined)) {
        continue
      }

      // Handle boolean attributes: {bool} -> {":bool": "true"}
      if (handleBoolean && !key.startsWith(':') && !key.startsWith('#') && !key.startsWith('.') && (!value || value === 'true' || value === '')) {
        key = `:${key}`
        value = 'true'
      }

      // Handle JSON values
      if (handleJSON && typeof value === 'string') {
        if (value.startsWith('{') && value.endsWith('}')) {
          try {
            value = JSON.parse(value)
          }
          catch {
            // Keep original value if parsing fails
          }
        }
        else if (value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value)
          }
          catch {
            // Keep original value if parsing fails
          }
        }
      }

      attrs[key] = value
    }
  }

  return attrs
}

/**
 * Extract MDC attributes from mdc_inline_props token
 * @param tokens - Array of tokens
 * @param startIndex - Index to start searching from (after the element token)
 * @param skipEmptyText - Whether to skip empty text tokens before props token
 * @returns Object with attrs and nextIndex
 */
function extractMDCAttributes(
  tokens: any[],
  startIndex: number,
  skipEmptyText: boolean = true,
): { attrs: Record<string, unknown>, nextIndex: number } {
  let propsIndex = startIndex

  // Skip empty text tokens if requested
  if (skipEmptyText) {
    while (propsIndex < tokens.length && tokens[propsIndex].type === 'text' && !tokens[propsIndex].content?.trim()) {
      propsIndex++
    }
  }

  // Check for props token
  if (propsIndex < tokens.length && tokens[propsIndex].type === 'mdc_inline_props') {
    const propsToken = tokens[propsIndex]
    const attrs = processAttributes(propsToken.attrs)
    return { attrs, nextIndex: propsIndex + 1 }
  }

  return { attrs: {}, nextIndex: startIndex }
}

export function parseTokens(tokens: any[]): MinimarkNode[] {
  const nodes: MinimarkNode[] = []

  let i = 0
  while (i < tokens.length) {
    const result = processBlockToken(tokens, i)
    i = result.nextIndex
    if (result.node) {
      nodes.push(result.node)
    }
  }

  return nodes
}

export function getMarkdownIt() {
  return md
}

function processBlockToken(tokens: any[], startIndex: number): { node: MinimarkNode | null, nextIndex: number } {
  const token = tokens[startIndex]

  if (token.type === 'hr') {
    return { node: ['hr', {}] as MinimarkNode, nextIndex: startIndex + 1 }
  }

  // Handle MDC block components (e.g., ::component ... ::)
  if (token.type === 'mdc_block_open') {
    const componentName = token.tag || 'component'
    const attrs = processAttributes(token.attrs, { handleBoolean: false })
    // Process children until mdc_block_close, handling slots (#slotname)
    const children = processBlockChildrenWithSlots(tokens, startIndex + 1, 'mdc_block_close')
    // Return the component even if it has no children (empty component like ::component\n::)
    return { node: [componentName, attrs, ...children.nodes] as MinimarkNode, nextIndex: children.nextIndex + 1 }
  }

  // Handle MDC block shorthand components (e.g., standalone :inline-component)
  // These should be wrapped in a paragraph
  if (token.type === 'mdc_block_shorthand') {
    const componentName = token.tag || 'component'
    const attrs = processAttributes(token.attrs, { handleBoolean: false, handleJSON: false })
    const component: MinimarkNode = [componentName, attrs] as MinimarkNode
    const paragraph: MinimarkNode = ['p', {}, component] as MinimarkNode
    return { node: paragraph, nextIndex: startIndex + 1 }
  }

  if (token.type === 'fence' || token.type === 'fenced_code_block' || token.type === 'code_block') {
    const attrs: Record<string, unknown> = {}
    const content = token.content || ''
    const language = token.info || token.params || ''
    if (language) {
      attrs['class'] = `language-${language.trim()}`
    }
    const code: MinimarkNode = ['code', attrs, content] as MinimarkNode
    const pre: MinimarkNode = ['pre', {}, code] as MinimarkNode
    return { node: pre, nextIndex: startIndex + 1 }
  }

  if (token.type === 'heading_open') {
    const level = token.tag.replace('h', '')
    const headingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    // Process heading children with inHeading flag for MDC component handling
    const children = processBlockChildren(tokens, startIndex + 1, 'heading_close', true, true)
    if (children.nodes.length > 0) {
      return { node: [headingTag, {}, ...children.nodes] as MinimarkNode, nextIndex: children.nextIndex + 1 }
    }
    return { node: null, nextIndex: children.nextIndex + 1 }
  }

  // Handle list items - paragraphs should be unwrapped
  if (token.type === 'list_item_open') {
    const children = processBlockChildren(tokens, startIndex + 1, 'list_item_close', false)
    // Unwrap paragraphs in list items
    const unwrapped: MinimarkNode[] = []
    for (const child of children.nodes) {
      if (Array.isArray(child) && child[0] === 'p') {
        // Unwrap paragraph, add its children directly
        unwrapped.push(...(child.slice(2) as MinimarkNode[]))
      }
      else {
        unwrapped.push(child)
      }
    }
    if (unwrapped.length > 0) {
      return { node: ['li', {}, ...unwrapped] as MinimarkNode, nextIndex: children.nextIndex + 1 }
    }
    return { node: null, nextIndex: children.nextIndex + 1 }
  }

  // Handle generic block-level open/close pairs
  const tagName = BLOCK_TAG_MAP[token.type]
  if (tagName) {
    const attrs = processAttributes(token.attrs, { handleBoolean: false, handleJSON: false })
    const closeType = token.type.replace('_open', '_close')
    const children = processBlockChildren(tokens, startIndex + 1, closeType, false)
    if (children.nodes.length > 0) {
      return { node: [tagName, attrs, ...children.nodes] as MinimarkNode, nextIndex: children.nextIndex + 1 }
    }
    return { node: null, nextIndex: children.nextIndex + 1 }
  }

  return { node: null, nextIndex: startIndex + 1 }
}

function processBlockChildrenWithSlots(
  tokens: any[],
  startIndex: number,
  closeType: string,
): { nodes: MinimarkNode[], nextIndex: number } {
  const nodes: MinimarkNode[] = []
  let i = startIndex
  let currentSlotName: string | null = null
  let currentSlotChildren: MinimarkNode[] = []

  while (i < tokens.length && tokens[i].type !== closeType) {
    const token = tokens[i]

    // Check for slot marker: #slotname creates mdc_block_slot tokens
    if (token.type === 'mdc_block_slot') {
      // Extract slot name from token.attrs
      // The attrs array contains [["#slotname", ""]] for open, and null/empty for close
      if (token.attrs && Array.isArray(token.attrs) && token.attrs.length > 0) {
        const firstAttr = token.attrs[0]
        if (Array.isArray(firstAttr) && firstAttr.length > 0) {
          const slotKey = firstAttr[0] as string
          // Remove the # prefix to get the slot name
          if (slotKey.startsWith('#')) {
            const slotName = slotKey.substring(1)

            // Save previous slot if any
            if (currentSlotName !== null && currentSlotChildren.length > 0) {
              nodes.push(['template', { name: currentSlotName }, ...currentSlotChildren] as MinimarkNode)
              currentSlotChildren = []
            }

            currentSlotName = slotName
            i++
            continue
          }
        }
      }

      // If attrs is null/empty, this is a slot close token - just skip it
      i++
      continue
    }

    // Process other block tokens
    const result = processBlockToken(tokens, i)
    i = result.nextIndex
    if (result.node) {
      if (currentSlotName !== null) {
        // Add to current slot
        currentSlotChildren.push(result.node)
      }
      else {
        // Add directly to component
        nodes.push(result.node)
      }
    }
  }

  // Save last slot if any
  if (currentSlotName !== null && currentSlotChildren.length > 0) {
    nodes.push(['template', { name: currentSlotName }, ...currentSlotChildren] as MinimarkNode)
  }

  return { nodes, nextIndex: i }
}

function processBlockChildren(
  tokens: any[],
  startIndex: number,
  closeType: string,
  inlineOnly: boolean,
  inHeading: boolean = false,
): { nodes: MinimarkNode[], nextIndex: number } {
  const nodes: MinimarkNode[] = []
  let i = startIndex

  while (i < tokens.length && tokens[i].type !== closeType) {
    const token = tokens[i]

    if (token.type === 'inline') {
      const inlineNodes = processInlineTokens(token.children || [], inHeading)
      nodes.push(...inlineNodes)
      i++
    }
    else if (token.type === 'hard_break') {
      nodes.push(['br', {}] as MinimarkNode)
      i++
    }
    else if (inlineOnly && (token.type === 'text' || token.type === 'code_inline')) {
      if (token.content) {
        nodes.push(token.content)
      }
      i++
    }
    else {
      const result = processBlockToken(tokens, i)
      i = result.nextIndex
      if (result.node) {
        nodes.push(result.node)
      }
    }
  }

  return { nodes, nextIndex: i }
}

function processInlineTokens(tokens: any[], inHeading: boolean = false): MinimarkNode[] {
  const nodes: MinimarkNode[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    // Skip hidden mdc_inline_props tokens (they're handled by the parent element)
    // These appear after elements like **strong**{attr} and should be attached to the parent
    if (token.type === 'mdc_inline_props' && token.hidden) {
      // Props tokens are handled by the parent element that processes them
      // We should not process them here as separate nodes
      i++
      continue
    }

    const result = processInlineToken(tokens, i, inHeading)
    i = result.nextIndex
    if (result.node) {
      nodes.push(result.node)
    }
  }

  return nodes
}

function processInlineToken(tokens: any[], startIndex: number, inHeading: boolean = false): { node: MinimarkNode | string | null, nextIndex: number } {
  const token = tokens[startIndex]

  if (token.type === 'text') {
    return { node: token.content || null, nextIndex: startIndex + 1 }
  }

  // Handle MDC inline span (e.g., [text]{attr})
  // markdown-it-mdc creates mdc_inline_span tokens, and props appear AFTER the close token
  if (token.type === 'mdc_inline_span' && token.nesting === 1) {
    const attrs: Record<string, unknown> = {}
    let i = startIndex + 1
    const nodes: MinimarkNode[] = []

    // Process children until span close
    while (i < tokens.length) {
      const childToken = tokens[i]

      // Check for span close
      if (childToken.type === 'mdc_inline_span' && childToken.nesting === -1) {
        break
      }

      // Skip empty text tokens
      if (childToken.type === 'text' && !childToken.content?.trim()) {
        i++
        continue
      }

      // Process other tokens
      const result = processInlineToken(tokens, i, inHeading)
      i = result.nextIndex
      if (result.node) {
        nodes.push(result.node as MinimarkNode)
      }
    }

    // Skip the close token and check for props token after it
    const { attrs: spanAttrs, nextIndex } = extractMDCAttributes(tokens, i + 1)
    Object.assign(attrs, spanAttrs)

    if (nodes.length > 0 || Object.keys(attrs).length > 0) {
      return { node: ['span', attrs, ...nodes] as MinimarkNode, nextIndex }
    }
    return { node: null, nextIndex }
  }

  // Skip mdc_inline_span close tokens
  if (token.type === 'mdc_inline_span' && token.nesting === -1) {
    return { node: null, nextIndex: startIndex + 1 }
  }

  if (token.type === 'code_inline') {
    const { attrs, nextIndex } = extractMDCAttributes(tokens, startIndex + 1)

    if (token.content) {
      return { node: ['code', attrs, token.content] as MinimarkNode, nextIndex }
    }
    return { node: null, nextIndex }
  }

  if (token.type === 'hard_break' || token.type === 'softbreak') {
    return { node: ['br', {}] as MinimarkNode, nextIndex: startIndex + 1 }
  }

  // Handle MDC inline components (e.g., :inline-component)
  if (token.type === 'mdc_inline_component') {
    const componentName = token.tag || 'component'
    const attrs: Record<string, unknown> = {}

    // markdown-it-mdc stores attributes in a separate mdc_inline_props token
    // that appears right after the component token
    const { attrs: componentAttrs, nextIndex: propsNextIndex } = extractMDCAttributes(tokens, startIndex + 1, false)
    Object.assign(attrs, componentAttrs)

    // Extract attributes from token.attrs (fallback, though markdown-it-mdc uses mdc_inline_props)
    const fallbackAttrs = processAttributes(token.attrs, { handleBoolean: false })
    Object.assign(attrs, fallbackAttrs)

    // Return the component without any text children
    // Text after the component will be processed as siblings by processInlineChildren
    const nextIndex = Object.keys(componentAttrs).length > 0 ? propsNextIndex : startIndex + 1
    return { node: [componentName, attrs] as MinimarkNode, nextIndex }
  }

  if (token.type === 'image') {
    const attrs = processAttributes(token.attrs, { handleBoolean: false, handleJSON: false, filterEmpty: true })
    // Override alt with token.content if available
    if (token.content) {
      attrs.alt = token.content
    }

    // Check if there's a props token right after the image token
    const { attrs: imageAttrs, nextIndex } = extractMDCAttributes(tokens, startIndex + 1)
    Object.assign(attrs, imageAttrs)

    return { node: ['img', attrs] as MinimarkNode, nextIndex }
  }

  if (token.type === 'link_open') {
    const attrs = processAttributes(token.attrs, { handleBoolean: false, handleJSON: false })
    const children = processInlineChildren(tokens, startIndex + 1, 'link_close', inHeading)

    // Check if there's a props token right after the link_close token
    const { attrs: linkAttrs, nextIndex } = extractMDCAttributes(tokens, children.nextIndex + 1)
    Object.assign(attrs, linkAttrs)

    if (children.nodes.length > 0) {
      return { node: ['a', attrs, ...children.nodes] as MinimarkNode, nextIndex }
    }
    return { node: null, nextIndex }
  }

  // Handle generic inline open/close pairs
  const tagName = INLINE_TAG_MAP[token.type]
  if (tagName) {
    const closeType = token.type.replace('_open', '_close')
    const children = processInlineChildren(tokens, startIndex + 1, closeType, inHeading)

    // Check if there's a props token right after the close token
    const { attrs, nextIndex } = extractMDCAttributes(tokens, children.nextIndex + 1)

    if (children.nodes.length > 0) {
      return { node: [tagName, attrs, ...children.nodes] as MinimarkNode, nextIndex }
    }
    return { node: null, nextIndex }
  }

  if (token.children) {
    const nestedNodes = processInlineTokens(token.children, inHeading)
    return { node: nestedNodes.length === 1 ? nestedNodes[0] : null, nextIndex: startIndex + 1 }
  }

  return { node: null, nextIndex: startIndex + 1 }
}

function processInlineChildren(
  tokens: any[],
  startIndex: number,
  closeType: string,
  inHeading: boolean = false,
): { nodes: MinimarkNode[], nextIndex: number } {
  const nodes: MinimarkNode[] = []
  let i = startIndex

  while (i < tokens.length) {
    const token = tokens[i]

    // Check for close token (either by type or by nesting for mdc_inline_span)
    if (token.type === closeType) {
      if (closeType === 'mdc_inline_span' && token.nesting === -1) {
        break
      }
      else if (closeType !== 'mdc_inline_span') {
        break
      }
    }

    // Skip hidden mdc_inline_props tokens inside children
    // These should not be processed here - they're handled by the parent
    if (token.type === 'mdc_inline_props' && token.hidden) {
      i++
      continue
    }

    // Special handling for MDC inline components in headings
    // In headings, text after components should be siblings, not children
    if (token.type === 'mdc_inline_component' && inHeading) {
      const componentName = token.tag || 'component'
      const attrs: Record<string, unknown> = {}

      // Check for mdc_inline_props token after the component
      const { attrs: componentAttrs, nextIndex: componentNextIndex } = extractMDCAttributes(tokens, i + 1, false)
      Object.assign(attrs, componentAttrs)
      if (Object.keys(componentAttrs).length > 0) {
        i = componentNextIndex // Skip both component and props tokens
      }
      else {
        i++
      }

      nodes.push([componentName, attrs] as MinimarkNode)
      // Continue processing subsequent tokens as siblings
      continue
    }

    const result = processInlineToken(tokens, i, inHeading)
    i = result.nextIndex
    if (result.node) {
      nodes.push(result.node as MinimarkNode)
    }
  }

  return { nodes, nextIndex: i }
}
