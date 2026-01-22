import type { MDCElement, MDCNode, MDCText } from '../types/tree'
import Slugger from 'github-slugger'
import { validateProps } from '../security/props'

interface MarkdownItToken {
  type: string
  tag: string
  attrs: Array<[string, string]> | null
  children?: MarkdownItToken[]
  content?: string
  info?: string
  markup?: string
  nesting?: number
  meta?: any
}

// Helper: Convert attrs array to props object, filtering out ':' prefixed attributes
function attrsToProps(attrs: Array<[string, string]> | null, filterColon = false): Record<string, any> {
  const props: Record<string, any> = {}
  if (!attrs)
    return props
  for (const [name, value] of attrs) {
    if (!filterColon || !name.startsWith(':')) {
      props[name] = value
    }
  }
  return props
}

// Helper: Merge props from a token
function mergePropsFromToken(props: Record<string, any>, token: MarkdownItToken, filterColon = false): void {
  if (token.attrs) {
    for (const [name, value] of token.attrs) {
      if (!filterColon || !name.startsWith(':')) {
        props[name] = value
      }
    }
  }
}

// Helper: Check if text is valid (not empty or newline-only)
function isValidText(text: string | undefined): boolean {
  return !!(text && text.trim() && !/^\n+$/.test(text))
}

// Helper: Create text node
function createTextNode(value: string): MDCText {
  return { type: 'text', value }
}

// Helper: Create code element
function createCodeElement(content?: string): MDCElement {
  return {
    type: 'element',
    tag: 'code',
    props: {},
    children: content ? [createTextNode(content)] : [],
  }
}

// Helper: Filter empty text nodes
function filterEmptyTextNodes(children: MDCNode[]): MDCNode[] {
  return children.filter(child => child.type !== 'text' || isValidText(child.value))
}

// Helper: Find children between matching open/close tokens
function findChildrenBetweenTokens(
  tokens: MarkdownItToken[],
  startIndex: number,
  openType: string,
  closeType: string,
  skipIndices: Set<number>,
): { children: MDCNode[], endIndex: number } {
  const children: MDCNode[] = []
  let depth = 1
  let j = startIndex + 1

  while (j < tokens.length && depth > 0) {
    const childToken = tokens[j]

    if (childToken.type === openType) {
      depth++
    }
    else if (childToken.type === closeType) {
      depth--
      if (depth === 0)
        break
    }
    else if (depth === 1) {
      // Process direct children
      if (childToken.type === 'inline' && childToken.children) {
        children.push(...convertMarkdownItTokensToMDC(childToken.children as MarkdownItToken[], skipIndices))
      }
      else if (childToken.type === 'text' && isValidText(childToken.content)) {
        children.push(createTextNode(childToken.content!))
      }
      else if (childToken.type === 'code_inline') {
        children.push(createCodeElement(childToken.content))
      }
    }
    j++
  }

  return { children, endIndex: j }
}

// Helper: Find children for nesting-based tokens (mdc_inline_span, mdc_inline_component, mdc_block)
function findNestedChildren(
  tokens: MarkdownItToken[],
  startIndex: number,
  tokenType: string,
  skipIndices: Set<number>,
): { children: MDCNode[], endIndex: number } {
  const children: MDCNode[] = []
  let depth = 1
  let j = startIndex + 1

  while (j < tokens.length && depth > 0) {
    const childToken = tokens[j]

    if (childToken.type === tokenType) {
      if (childToken.nesting === 1) {
        depth++
      }
      else if (childToken.nesting === -1) {
        depth--
        if (depth === 0)
          break
      }
    }
    else if (depth === 1) {
      // Process direct children
      if (childToken.type === 'inline' && childToken.children) {
        children.push(...convertMarkdownItTokensToMDC(childToken.children as MarkdownItToken[], skipIndices))
      }
      else if (childToken.type === 'text' && isValidText(childToken.content)) {
        children.push(createTextNode(childToken.content!))
      }
      else if (childToken.type === 'code_inline') {
        children.push(createCodeElement(childToken.content))
      }
      else if (childToken.type === 'mdc_inline_component' && childToken.nesting === 1) {
        // Handle nested inline component
        const nested = processInlineComponent(tokens, j, skipIndices)
        children.push(nested.element)
        j = nested.endIndex - 1 // -1 because j++ will happen
      }
    }
    j++
  }

  return { children, endIndex: j }
}

// Helper: Process inline component
function processInlineComponent(
  tokens: MarkdownItToken[],
  startIndex: number,
  skipIndices: Set<number>,
): { element: MDCElement, endIndex: number } {
  const token = tokens[startIndex]
  const tagName = token.tag || 'span'
  const props = attrsToProps(token.attrs)

  // Find children
  const { children, endIndex } = findNestedChildren(tokens, startIndex, 'mdc_inline_component', skipIndices)

  // Check for props token after closing
  let finalEndIndex = endIndex
  if (endIndex + 1 < tokens.length && tokens[endIndex + 1].type === 'mdc_inline_props') {
    mergePropsFromToken(props, tokens[endIndex + 1])
    finalEndIndex = endIndex + 1
  }

  return {
    element: {
      type: 'element',
      tag: tagName,
      props: validateProps(tagName, props),
      children: filterEmptyTextNodes(children),
    },
    endIndex: finalEndIndex,
  }
}

// Helper: Process paragraph
function processParagraph(
  tokens: MarkdownItToken[],
  startIndex: number,
  skipIndices: Set<number>,
): { element: MDCElement, endIndex: number } {
  const { children, endIndex } = findChildrenBetweenTokens(
    tokens,
    startIndex,
    'paragraph_open',
    'paragraph_close',
    skipIndices,
  )
  return {
    element: {
      type: 'element',
      tag: 'p',
      props: {},
      children: filterEmptyTextNodes(children),
    },
    endIndex: endIndex + 1,
  }
}

// Helper: Process list item
function processListItem(
  tokens: MarkdownItToken[],
  startIndex: number,
  skipIndices: Set<number>,
): { element: MDCElement, endIndex: number } {
  const children: MDCNode[] = []
  let depth = 1
  let j = startIndex + 1

  while (j < tokens.length && depth > 0) {
    const token = tokens[j]
    if (token.type === 'list_item_open') {
      depth++
    }
    else if (token.type === 'list_item_close') {
      depth--
      if (depth === 0)
        break
    }
    else if (depth === 1) {
      if (token.type === 'paragraph_open') {
        // Unwrap paragraph in list item
        const para = processParagraph(tokens, j, skipIndices)
        children.push(...para.element.children)
        j = para.endIndex - 1
      }
      else if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
        // Handle nested lists - collect all tokens for this list
        const listType = token.type === 'bullet_list_open' ? 'bullet_list' : 'ordered_list'
        const collectedTokens: MarkdownItToken[] = [token]
        let listDepth = 1
        let k = j + 1

        while (k < tokens.length && listDepth > 0) {
          const listToken = tokens[k]
          if (!listToken)
            break
          collectedTokens.push(listToken)
          if (listToken.type === `${listType}_open`) {
            listDepth++
          }
          else if (listToken.type === `${listType}_close`) {
            listDepth--
            if (listDepth === 0)
              break
          }
          k++
        }

        // Process the nested list
        const nested = convertMarkdownItTokensToMDC(collectedTokens, skipIndices)
        if (nested.length > 0) {
          children.push(...nested)
        }
        j = k
      }
      else if (token.type === 'inline' && token.children) {
        children.push(...convertMarkdownItTokensToMDC(token.children as MarkdownItToken[], skipIndices))
      }
      else if (token.type === 'text' && isValidText(token.content)) {
        children.push(createTextNode(token.content!))
      }
    }
    j++
  }

  return {
    element: {
      type: 'element',
      tag: 'li',
      props: {},
      children: filterEmptyTextNodes(children),
    },
    endIndex: j + 1,
  }
}

export function convertMarkdownItTokensToMDC(tokens: MarkdownItToken[], skipIndices: Set<number> = new Set()): MDCNode[] {
  const slugs = new Slugger()
  const result: MDCNode[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    // Handle inline token - contains nested inline elements
    if (token.type === 'inline' && token.children) {
      result.push(...convertMarkdownItTokensToMDC(token.children as MarkdownItToken[], skipIndices))
      i++
      continue
    }

    // Handle mdc_inline_span tokens
    if (token.type === 'mdc_inline_span' && token.nesting === 1) {
      const tagName = token.tag || 'span'
      const props = attrsToProps(token.attrs, true)
      const { children, endIndex } = findNestedChildren(tokens, i, 'mdc_inline_span', skipIndices)

      // Check for props token after closing
      let finalEndIndex = endIndex
      if (endIndex + 1 < tokens.length && tokens[endIndex + 1].type === 'mdc_inline_props') {
        mergePropsFromToken(props, tokens[endIndex + 1])
        finalEndIndex = endIndex + 1
      }

      result.push({
        type: 'element',
        tag: tagName,
        props: validateProps(tagName, props),
        children: filterEmptyTextNodes(children),
      })
      i = finalEndIndex
      continue
    }

    // Skip mdc_inline_props tokens (handled with their parent tokens)
    if (token.type === 'mdc_inline_props') {
      i++
      continue
    }

    // Handle mdc_inline_component tokens
    if (token.type === 'mdc_inline_component') {
      if (token.nesting === 0) {
        // Self-closing component
        const tagName = token.tag || 'span'
        const props = attrsToProps(token.attrs)

        if (i + 1 < tokens.length && tokens[i + 1].type === 'mdc_inline_props') {
          mergePropsFromToken(props, tokens[i + 1])
          i++
        }

        result.push({
          type: 'element',
          tag: tagName,
          props: validateProps(tagName, props),
          children: [],
        })
        i++
        continue
      }
      else if (token.nesting === 1) {
        // Opening component with content
        const processed = processInlineComponent(tokens, i, skipIndices)
        result.push(processed.element)
        i = processed.endIndex + 1
        continue
      }
    }

    // Handle mdc_block_open tokens (block-level components)
    if (token.type === 'mdc_block_open' && token.nesting === 1) {
      const tagName = token.tag || 'div'
      const props = attrsToProps(token.attrs, true)

      // Collect child tokens, separating slot content
      const defaultSlotTokens: MarkdownItToken[] = []
      const slotTokens: Map<string, MarkdownItToken[]> = new Map()
      let depth = 1
      let j = i + 1
      let currentSlotName: string | null = null
      let currentSlotTokens: MarkdownItToken[] = defaultSlotTokens

      while (j < tokens.length && depth > 0) {
        const childToken = tokens[j]

        // Handle mdc_block_slot tokens
        if (childToken.type === 'mdc_block_slot') {
          if (childToken.nesting === 1) {
            // Opening slot tag - extract slot name
            const slotNameAttr = childToken.attrs?.find(([name]) => name.startsWith('#'))
            if (slotNameAttr) {
              currentSlotName = slotNameAttr[0].substring(1) // Remove # prefix
              currentSlotTokens = []
              slotTokens.set(currentSlotName, currentSlotTokens)
            }
          }
          else if (childToken.nesting === -1) {
            // Closing slot tag - return to default slot
            currentSlotName = null
            currentSlotTokens = defaultSlotTokens
          }
          j++
          continue
        }

        // Track component depth
        if (childToken.type === 'mdc_block_open' || childToken.type === 'mdc_block_close') {
          if (childToken.nesting === 1) {
            depth++
          }
          else if (childToken.nesting === -1) {
            depth--
            if (depth === 0)
              break
          }
        }

        // Add token to current slot
        if (depth > 0) {
          currentSlotTokens.push(childToken)
        }
        j++
      }

      // Process default slot content
      const defaultChildren = defaultSlotTokens.length > 0
        ? convertMarkdownItTokensToMDC(defaultSlotTokens, skipIndices)
        : []

      // Process named slots and add them as template elements
      const allChildren: MDCNode[] = [...defaultChildren]
      for (const [slotName, tokens] of slotTokens.entries()) {
        const slotChildren = tokens.length > 0
          ? convertMarkdownItTokensToMDC(tokens, skipIndices)
          : []

        allChildren.push({
          type: 'element',
          tag: 'template',
          props: { [`#${slotName}`]: '' },
          children: filterEmptyTextNodes(slotChildren),
        })
      }

      result.push({
        type: 'element',
        tag: tagName,
        props: validateProps(tagName, props),
        children: filterEmptyTextNodes(allChildren),
      })
      i = j + 1
      continue
    }

    // Handle opening tags (headings, paragraphs, lists, tables, etc.)
    if (token.type.endsWith('_open')) {
      // Map token type to tag name
      let tagName = token.tag
      if (token.type === 'blockquote_open')
        tagName = 'blockquote'
      else if (!tagName && token.type.startsWith('strong'))
        tagName = 'strong'
      else if (!tagName && token.type.startsWith('em'))
        tagName = 'em'
      else if (!tagName && token.type.startsWith('link'))
        tagName = 'a'

      const props = attrsToProps(token.attrs, true)
      const children: MDCNode[] = []
      const openType = token.type
      const closeType = openType.replace('_open', '_close')
      let depth = 1
      let j = i + 1

      while (j < tokens.length && depth > 0) {
        const childToken = tokens[j]
        if (!childToken) {
          j++
          continue
        }

        // Track depth only for matching open/close pairs
        if (childToken.type === openType) {
          depth++
        }
        else if (childToken.type === closeType) {
          depth--
          if (depth === 0)
            break
        }

        // Process children at depth 1 (direct children)
        if (depth === 1) {
          // Special handling for blockquote paragraphs
          if (tagName === 'blockquote' && childToken.type === 'paragraph_open') {
            const para = processParagraph(tokens, j, skipIndices)
            children.push(para.element)
            j = para.endIndex
            continue
          }
          // Special handling for list items
          if ((tagName === 'ul' || tagName === 'ol') && childToken.type === 'list_item_open') {
            const item = processListItem(tokens, j, skipIndices)
            children.push(item.element)
            j = item.endIndex
            continue
          }
          // Handle nested elements (table parts, etc.) recursively
          if (childToken.type.endsWith('_open')) {
            // Collect all tokens for this nested element
            const collectedTokens: MarkdownItToken[] = [childToken]
            let nestedDepth = 1
            let k = j + 1
            const nestedOpenType = childToken.type
            const nestedCloseType = nestedOpenType.replace('_open', '_close')

            while (k < tokens.length && nestedDepth > 0) {
              const nestedToken = tokens[k]
              if (nestedToken) {
                collectedTokens.push(nestedToken)
                if (nestedToken.type === nestedOpenType) {
                  nestedDepth++
                }
                else if (nestedToken.type === nestedCloseType) {
                  nestedDepth--
                  if (nestedDepth === 0) {
                    j = k
                    break
                  }
                }
              }
              k++
            }

            // Process collected tokens
            const nested = convertMarkdownItTokensToMDC(collectedTokens, skipIndices)
            if (nested.length > 0) {
              children.push(...nested)
            }
            j++
            continue
          }
        }

        if (depth === 1) {
          // Process direct children
          if (childToken.type === 'paragraph_open') {
            const para = processParagraph(tokens, j, skipIndices)
            children.push(para.element)
            j = para.endIndex
            continue
          }
          else if (childToken.type === 'inline' && childToken.children) {
            children.push(...convertMarkdownItTokensToMDC(childToken.children as MarkdownItToken[], skipIndices))
          }
          else if (childToken.type === 'mdc_inline_component' && childToken.nesting === 1) {
            const processed = processInlineComponent(tokens, j, skipIndices)
            children.push(processed.element)
            j = processed.endIndex
            continue
          }
          else if (childToken.type === 'text' && isValidText(childToken.content)) {
            children.push(createTextNode(childToken.content!))
          }
          else if (childToken.type === 'code_inline') {
            children.push(createCodeElement(childToken.content))
          }
          else if (childToken.type === 'fence') {
            const codeProps: Record<string, any> = {}
            if (childToken.info) {
              codeProps.class = `language-${childToken.info.trim()}`
            }
            children.push({
              type: 'element',
              tag: 'pre',
              props: codeProps,
              children: [{
                type: 'element',
                tag: 'code',
                props: codeProps,
                children: childToken.content ? [createTextNode(childToken.content)] : [],
              }],
            })
          }
          else if (childToken.type === 'hardbreak') {
            children.push({ type: 'element', tag: 'br', props: {}, children: [] })
          }
        }
        j++
      }

      // Generate id for headings
      if (tagName?.match(/^h\d$/)) {
        const headingContent = extractTextFromTokens(children)
        if (headingContent) {
          props.id = slugs.slug(headingContent)
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .replace(/^(\d)/, '_$1')
        }
      }

      // Unwrap paragraphs in list items
      if (tagName === 'li') {
        const unwrapped: MDCNode[] = []
        for (const child of children) {
          if (child.type === 'element' && child.tag === 'p') {
            unwrapped.push(...child.children)
          }
          else {
            unwrapped.push(child)
          }
        }
        children.length = 0
        children.push(...unwrapped)
      }

      // Skip empty paragraphs
      if (tagName === 'p' && children.every(child => child.type === 'text' && /^\s*$/.test(child.value))) {
        i = j + 1
        continue
      }

      result.push({
        type: 'element',
        tag: tagName,
        props: validateProps(tagName, props),
        children: filterEmptyTextNodes(children),
      })
      i = j + 1
    }
    else if (token.type === 'text') {
      if (!skipIndices.has(i) && isValidText(token.content)) {
        result.push(createTextNode(token.content!))
      }
      i++
    }
    else if (token.type === 'mdc_inline_props') {
      // Skip (handled with parent tokens)
      i++
    }
    else if (token.type === 'code_inline') {
      result.push(createCodeElement(token.content))
      i++
    }
    else if (token.type === 'fence') {
      const codeProps: Record<string, any> = {}
      if (token.info) {
        codeProps.class = `language-${token.info.trim()}`
      }
      result.push({
        type: 'element',
        tag: 'pre',
        props: codeProps,
        children: [{
          type: 'element',
          tag: 'code',
          props: codeProps,
          children: token.content ? [createTextNode(token.content)] : [],
        }],
      })
      i++
    }
    else if (token.type === 'image') {
      const props = attrsToProps(token.attrs)
      if (token.content && !props.alt) {
        props.alt = token.content
      }
      result.push({
        type: 'element',
        tag: 'img',
        props: validateProps('img', props),
        children: [],
      })
      i++
    }
    else if (token.type === 'hr') {
      result.push({ type: 'element', tag: 'hr', props: {}, children: [] })
      i++
    }
    else {
      // Skip other token types
      i++
    }
  }

  return result
}

function extractTextFromTokens(nodes: MDCNode[]): string {
  let text = ''
  for (const node of nodes) {
    if (node.type === 'text') {
      text += node.value
    }
    else if (node.type === 'element') {
      text += extractTextFromTokens(node.children)
    }
  }
  return text
}
