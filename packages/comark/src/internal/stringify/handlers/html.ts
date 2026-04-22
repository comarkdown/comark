import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { htmlAttributes } from '../attributes.ts'
import { indent } from '../indent.ts'

const textBlocks = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th'])
const selfCloseTags = new Set(['br', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const inlineTags = new Set(['strong', 'em', 'code', 'a', 'br', 'span', 'img'])
const blockTags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol', 'blockquote', 'hr', 'table', 'td', 'th'])

export async function html(node: ComarkElement, state: State, parent?: ComarkElement) {
  const [tag, attr, ...children] = node
  const { $ = {}, ...rawAttributes } = attr

  // In text/html mode, `one()` has already resolved this element's `:prefix`
  // bindings against the parent's render context and stored the result in
  // `state.renderData.props` — but only when the element has its own attrs.
  // If it doesn't, `state.renderData.props` still holds the enclosing scope
  // (so that `{{ props.* }}` in nested children keeps working), so we fall
  // back to the raw (empty) attrs to avoid leaking parent props onto native
  // wrappers like `<p>` or `<ul>`.
  const rawHasAttrs = Object.keys(rawAttributes).length > 0
  const attributes = state.context.html
    ? (rawHasAttrs ? state.renderData.props : rawAttributes)
    : rawAttributes

  const hasOnlyTextChildren = children.every(child => typeof child === 'string' || inlineTags.has(String(child?.[0])))
  const hasTextSibling = children.some(child => typeof child === 'string')
  const isBlock = textBlocks.has(String(tag))
  const isInline = inlineTags.has(String(tag)) && $.block === 0

  let oneLiner = isBlock && hasOnlyTextChildren

  if (!oneLiner && inlineTags.has(String(tag)) && hasOnlyTextChildren) {
    oneLiner = true
  }
  if (tag === 'pre') {
    oneLiner = true
  }

  // If parent is a paragraph, it is inline
  if (parent?.[0] === 'p' || state.context.inline) {
    oneLiner = true
  }

  if ($.block === 0) {
    oneLiner = true
  }

  const isSelfClose = selfCloseTags.has(String(tag))

  // Do not modify context if we are already in html mode
  const revert = state.applyContext({ inline: oneLiner })

  const childrenContent: string[] = []
  for (const child of children) {
    childrenContent.push(await state.one(child, state, node))
  }

  let content = ''
  let isPrevBlock = true
  for (let i = 0; i < children.length; i++) {
    const childContent = childrenContent[i]
    const child = children[i]
    const isBlock = typeof child !== 'string' && (blockTags.has(String(child?.[0])) || (!inlineTags.has(String(child?.[0])) && !hasTextSibling))

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
    content = '\n' + paddNoneHtmlContent(content, state).trimEnd() + '\n'
  }

  return `<${tag}${attrs}>${content}</${tag}>`
    + (!parent && !isInline ? state.context.blockSeparator : '')
}

function paddNoneHtmlContent(content: string, state: State) {
  if (state.context.html) {
    return indent(content)
  }

  return (
    (content.trim().startsWith('<') ? '' : '')
    + content
    + (content.trim().endsWith('>') ? '' : '')
  )
}
