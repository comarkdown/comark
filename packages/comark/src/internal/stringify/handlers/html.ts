import type { State } from 'comark/render'
import type { ElementNode, Node } from 'comark'
import { htmlAttributes } from '../html-attributes.ts'
import { indent, toNativeAttributes } from '../../../utils/index.ts'

const textBlocks = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th'])
const selfCloseTags = new Set(['br', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const inlineTags = new Set(['strong', 'em', 'del', 'code', 'a', 'br', 'span', 'img'])
const blockTags = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'ul',
  'ol',
  'blockquote',
  'hr',
  'table',
  'td',
  'th',
])

export async function html(node: ElementNode, state: State, parent?: ElementNode) {
  const [tag, attr, ...children] = node
  const { $ = {}, ...rawAttributes } = attr
  // A `rel` or `target` added by `external-links` isn't part of the source
  if (!state.context.html) {
    if ($.autoRel !== undefined && rawAttributes.rel === $.autoRel) delete rawAttributes.rel
    if ($.autoTarget !== undefined && rawAttributes.target === $.autoTarget) delete rawAttributes.target
  }

  // In text/html mode, `one()` has already resolved this element's `:prefix`
  // bindings against the parent's render context and stored the result in
  // `state.renderData.props` — but only when the element has its own attrs.
  // If it doesn't, `state.renderData.props` still holds the enclosing scope
  // (so that `{{ props.* }}` in nested children keeps working), so we fall
  // back to the raw (empty) attrs to avoid leaking parent props onto native
  // wrappers like `<p>` or `<ul>`.
  const rawHasAttrs = Object.keys(rawAttributes).length > 0
  const attributes = state.context.html ? (rawHasAttrs ? state.renderData.props : rawAttributes) : rawAttributes

  const hasOnlyTextChildren = children.every((child) => typeof child === 'string' || inlineTags.has(String(child?.[0])))
  const hasTextSibling = children.some((child) => typeof child === 'string')
  const isBlock = textBlocks.has(String(tag))
  const isInline = inlineTags.has(String(tag)) && $.block === 0

  let oneLiner = isBlock && hasOnlyTextChildren

  if (!oneLiner && inlineTags.has(String(tag)) && hasOnlyTextChildren) {
    oneLiner = true
  }
  if (tag === 'pre') {
    oneLiner = true
  }

  // If parent is a paragraph or an inline element, it is inline
  if (parent?.[0] === 'p' || inlineTags.has(String(parent?.[0])) || state.context.inline) {
    oneLiner = true
  }

  // Next to text, a component is inline even without a `p` around it (tight list item, blockquote, unwrapped component).
  if (!state.context.html && $.html !== 1 && parent?.some((child, index) => index > 1 && typeof child === 'string')) {
    oneLiner = true
  }

  if ($.block === 0) {
    oneLiner = true
  }

  const isSelfClose = selfCloseTags.has(String(tag))

  // Do not modify context if we are already in html mode
  const revert = state.applyContext({ inline: oneLiner })

  const isBlockChild = (child: Node) =>
    typeof child !== 'string' &&
    (blockTags.has(String(child?.[0])) || (!inlineTags.has(String(child?.[0])) && !hasTextSibling))

  // A component written as a tag needs blank lines around its markdown, or CommonMark keeps it in the HTML block.
  const markdownBody = !state.context.html && !oneLiner && $.html !== 1

  const childrenContent: string[] = []
  for (let i = 0; i < children.length; i++) {
    const atLineStart = markdownBody && (i === 0 || isBlockChild(children[i - 1]))
    childrenContent.push(await state.one(children[i], state, node, atLineStart))
  }

  // A blank line inside a raw-HTML element would terminate it on reparse
  const childSeparator = state.context.html
    ? state.context.blockSeparator
    : markdownBody
      ? '\n\n'
      : oneLiner
        ? ''
        : '\n'

  let content = ''
  let isPrevBlock = true
  for (let i = 0; i < children.length; i++) {
    const childContent = childrenContent[i]
    const isBlock = isBlockChild(children[i])

    if (i > 0 && !isPrevBlock && isBlock) {
      content += childSeparator
    }
    // Block handlers end with their own separator, which `childSeparator` replaces.
    content += markdownBody && isBlock ? trimTrailingNewlines(childContent) : childContent
    isPrevBlock = isBlock

    if (isBlock && i < children.length - 1) {
      content += childSeparator
    }
  }

  // Revert, only if we modified the context
  if (revert) {
    state.applyContext(revert)
  }

  const nativeAttributes = toNativeAttributes(String(tag), node, attributes)
  const attrs =
    Object.keys(nativeAttributes).length > 0
      ? ` ${htmlAttributes(nativeAttributes, {
          verbatim: !state.context.html && $.html === 1,
          encodeNewlines: !state.context.html,
        })}`
      : ''

  if (isSelfClose) {
    return `<${tag}${attrs}>` + (!parent && !isInline ? state.context.blockSeparator : '')
  }

  if (!oneLiner && content) {
    const padding = markdownBody ? '\n\n' : '\n'
    content = padding + paddNoneHtmlContent(content, state, String(tag)).trimEnd() + padding
  }

  return `<${tag}${attrs}>${content}</${tag}>` + (!parent && !isInline ? state.context.blockSeparator : '')
}

// Literal-content tags whose body must be rendered verbatim (no indentation
// re-flow). Matches the parser-side set so `<style>` / `<script>` etc. stay
// flush-left in the output, the way they were authored.
const LITERAL_CONTENT_TAGS = new Set(['code', 'kbd', 'pre', 'samp', 'script', 'style', 'textarea', 'var'])

function paddNoneHtmlContent(content: string, state: State, tag: string) {
  if (state.context.html) {
    if (LITERAL_CONTENT_TAGS.has(tag.toLowerCase())) return content
    return indent(content)
  }

  return (content.trim().startsWith('<') ? '' : '') + content + (content.trim().endsWith('>') ? '' : '')
}

// A loop, since `/\n+$/` backtracks quadratically on long runs of newlines.
function trimTrailingNewlines(content: string): string {
  let end = content.length
  while (end > 0 && content.charCodeAt(end - 1) === 10) end--
  return content.slice(0, end)
}
