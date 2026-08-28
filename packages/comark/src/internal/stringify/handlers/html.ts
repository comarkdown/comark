import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { htmlAttributes } from '../attributes.ts'
import { indent } from '../../../utils/index.ts'

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
  // Incomplete HTML openers (streaming) store markdown/HTML block children under
  // `$.block === 0`; those still need multi-line wrapping, not one-liner inline.
  const hasBlockChildren = children.some(
    (child) => Array.isArray(child) && child[0] !== null && !inlineTags.has(String(child[0]))
  )

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

  // Inline HTML (`block: 0` with only text/inline children) collapses to one line.
  // Incomplete block wrappers with real markdown block children stay multi-line.
  if ($.block === 0 && !hasBlockChildren) {
    oneLiner = true
  }

  const isSelfClose = selfCloseTags.has(String(tag))

  // Do not modify context if we are already in html mode
  const revert = state.applyContext({ inline: oneLiner })

  const childrenContent: string[] = []
  for (const child of children) {
    childrenContent.push(await state.one(child, state, node))
  }

  // In markdown mode, block children already append their own blockSeparator, so
  // we must not inject extra newlines between *markdown* siblings. HTML element
  // closers (`</summary>`) do not carry a trailing separator, so a following
  // markdown body would otherwise glue on (`</summary>Nested content`). Insert
  // a blank line when the previous render ends with an HTML closer and the next
  // is not itself an HTML open tag. In HTML mode use the pretty-print gap.
  const childSeparator = state.context.html ? state.context.blockSeparator : ''

  let content = ''
  let isPrevBlock = true
  for (let i = 0; i < children.length; i++) {
    const childContent = childrenContent[i]
    const child = children[i]
    const childIsBlock =
      typeof child !== 'string' &&
      (blockTags.has(String(child?.[0])) || (!inlineTags.has(String(child?.[0])) && !hasTextSibling))

    if (i > 0 && !isPrevBlock && childIsBlock) {
      content += childSeparator
    }

    if (i > 0 && !state.context.html) {
      const prevContent = childrenContent[i - 1]
      // `…</summary>` + `Nested content` → blank line so the body re-parses as
      // a separate markdown block. Keep HTML→HTML tight (`</summary><details>`).
      if (
        prevContent.endsWith('>') &&
        childContent &&
        !childContent.startsWith('<') &&
        !childContent.startsWith('\n')
      ) {
        content += state.context.blockSeparator
      }
    }

    content += childContent
    isPrevBlock = childIsBlock

    if (childIsBlock && i < children.length - 1) {
      content += childSeparator
    }
  }

  // Revert, only if we modified the context
  if (revert) {
    state.applyContext(revert)
  }

  const attrs = Object.keys(attributes).length > 0 ? ` ${htmlAttributes(attributes)}` : ''

  if (isSelfClose) {
    return `<${tag}${attrs} />` + (!parent && !isInline ? state.context.blockSeparator : '')
  }

  if (!oneLiner && content) {
    if (state.context.html) {
      content = '\n' + paddNoneHtmlContent(content, state, String(tag)).trimEnd() + '\n'
    } else if ($.block === 0 && hasBlockChildren) {
      // Incomplete HTML openers with markdown body: blank line after open tag so
      // the body re-parses as markdown, children's own blockSeparators between
      // blocks, single newline before close.
      content = '\n\n' + content.trimEnd() + '\n'
    } else {
      // Raw HTML block body (block:1) — keep content flush after the open tag
      // so reparse matches CommonMark html_block runs.
      content = '\n' + paddNoneHtmlContent(content, state, String(tag)).trimEnd() + '\n'
    }
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
