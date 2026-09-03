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
  // Any non-inline child (markdown p/ul or nested HTML) needs multi-line wrapping.
  const hasBlockChildren = children.some(
    (child) => Array.isArray(child) && child[0] !== null && !inlineTags.has(String(child[0]))
  )
  // Blank line after the open tag only when the body *starts* with markdown
  // (`<tag>\n\n**bold**…`), so it re-parses as markdown. HTML-first bodies
  // (`<details>\n<summary>…`) stay flush; the sibling join path adds the gap
  // before a later markdown block.
  const firstMeaningfulChild = children.find((child) => typeof child !== 'string' || (child && child.trim()))
  const bodyStartsWithMarkdown =
    Array.isArray(firstMeaningfulChild) &&
    firstMeaningfulChild[0] !== null &&
    !inlineTags.has(String(firstMeaningfulChild[0])) &&
    !(firstMeaningfulChild[1] as Record<string, any> | undefined)?.$?.html

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
  // Block wrappers with real block children stay multi-line.
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
    } else if (bodyStartsWithMarkdown) {
      // Markdown-first body: blank line after open so the body re-parses as
      // markdown; blank line before close so a trailing closer is its own
      // html_block (not absorbed into a list item / paragraph).
      content = '\n\n' + content.trimEnd() + '\n\n'
    } else {
      // Raw HTML / HTML-first body — keep content flush after the open tag so
      // reparse matches CommonMark html_block runs.
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
