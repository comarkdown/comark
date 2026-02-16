import type { State } from '../types'
import type { ComarkElement } from '../../../ast/types'
import { htmlAttributes } from '../attributes'
import { indent } from '../indent'

const textBlocks = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th'])
const selfCloseTags = new Set(['br', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const fullHtmlTags = new Set<string>([])
const inlineTags = new Set(['strong', 'em', 'code', 'a', 'br', 'span', 'img'])
const blockTags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol', 'blockquote', 'hr', 'table', 'td', 'th'])

export function html(node: ComarkElement, state: State, parent?: ComarkElement) {
  const [tag, attributes, ...children] = node

  const hasOnlyTextChildren = children.every(child => typeof child === 'string' || inlineTags.has(String(child?.[0])))
  const hasTextSibling = children.some(child => typeof child === 'string')
  const isBlock = textBlocks.has(String(tag))
  const isInline = inlineTags.has(String(tag))

  let oneLiner = isBlock && hasOnlyTextChildren

  if (!oneLiner && inlineTags.has(String(tag)) && hasOnlyTextChildren) {
    oneLiner = true
  }
  if (tag === 'pre') {
    oneLiner = true
  }

  const isSelfClose = selfCloseTags.has(String(tag))

  // Do not modify context if we are already in html mode
  const revert = !state.context.html && fullHtmlTags.has(String(tag)) ? state.applyContext({ html: true }) : null

  const childrenContent = children.map(child => state.one(child, state, node))

  let content = ''
  let isPrevBlock = true
  for (let i = 0; i < children.length; i++) {
    const childContent = childrenContent[i]
    const child = children[i]
    const isBlock = blockTags.has(String(child?.[0])) || (!inlineTags.has(String(child?.[0])) && !hasTextSibling)
    if (child?.[0] === 'in') {
      console.log('parent', parent, isBlock, child?.[0])
    }
    if (i > 0 && !isPrevBlock && isBlock) {
      content += state.context.blockSeparator
    }
    content += childContent
    isPrevBlock = isBlock

    if (isBlock && i < children.length - 1) {
      content += state.context.blockSeparator
    }
  }

  // Revert, only if we modified the context
  if (revert) {
    state.applyContext(revert)
  }

  const attrs = Object.keys(attributes).length > 0
    ? ` ${htmlAttributes(attributes)}`
    : ''

  if (isSelfClose) {
    return `<${tag}${attrs} />` + (!parent && !isInline ? state.context.blockSeparator : '')
  }

  if (!oneLiner && content) {
    content = '\n' + paddNoneHtmlContent(content, state) + '\n'
  }

  return `<${tag}${attrs}>${content}</${tag}>`
    + (!parent && !isInline ? state.context.blockSeparator : '')
}

function paddNoneHtmlContent(content: string, state: State) {
  if (state.context.html) {
    return indent(content)
  }

  return (
    (content.trim().startsWith('<') ? '' : '\n')
    + content
    + (content.trim().endsWith('>') ? '' : '\n')
  )
}
