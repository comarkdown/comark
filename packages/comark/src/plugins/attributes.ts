/**
 * Inline attributes syntax plugin for Comark.
 *
 * Enables `{props}` after a token (paragraphs, headings, emphasis, links,
 * components, …). Span wrappers (`[text]`) live in the components plugin;
 * this plugin still attaches `{attrs}` onto those spans when both are active.
 * On by default via `registerDefaultPlugins`.
 *
 * @see https://comark.dev/syntax/attributes
 */

import type { PluginSimple, Renderer } from 'markdown-exit'
import { Token } from 'markdown-exit'
import type { MarkdownItPlugin } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { searchProps } from '../internal/parse/syntax/props.ts'

const markdownItInlineProps: PluginSimple = (md) => {
  md.inline.ruler.after('entity', 'comark_inline_props', (state, silent) => {
    const start = state.pos
    if (state.src[start] !== '{') return false

    // Skip Vue mustache `{{ }}` and template `${ }` syntax
    if (state.src[start + 1] === '{' || state.src[start - 1] === '{' || state.src[start - 1] === '$') return false

    const search = searchProps(state.src, start)
    if (!search) return false

    const { props, index: end } = search
    if (end === start) return false

    state.pos = end

    if (silent) return true

    // Hidden token holding the props; later applied to the previous token
    const token = state.push('mdc_inline_props', 'span', 0)
    token.attrs = props
    token.hidden = true

    return true
  })

  md.renderer.rules.mdc_inline_props = () => ''

  const _parse = md.parse
  md.parse = function (src, env) {
    const tokens = _parse.call(this, src, env)

    // When the trailing inline child is a props token directly after a text
    // node, lift the props onto the surrounding heading/paragraph/list_item.
    // (If the props follow a closing tag, they belong to that inline tag, not
    // the parent — leave them alone.)
    tokens.forEach((token, index) => {
      const prev = tokens[index - 1]
      const next = tokens[index + 1]
      if (!prev || !['heading_open', 'paragraph_open', 'list_item_open'].includes(prev.type) || prev.hidden) return

      // Tight-list paragraph: the inline lives one slot ahead
      if (token.hidden && next?.type === 'inline') token = next

      if (token.type !== 'inline' || !token.children?.length) return

      const last = token.children[token.children.length - 1]
      if (last.type !== 'mdc_inline_props') return

      // Find the previous non-empty child. Markdown-it's emphasis tokenizer
      // can leave an empty text token between the closing delimiter and the
      // props — skipping it lets us distinguish "props on the parent" from
      // "props on the preceding inline tag".
      let beforeIdx = token.children.length - 2
      while (beforeIdx >= 0) {
        const child = token.children[beforeIdx]
        if (child.type === 'text' && !child.content) {
          beforeIdx--
          continue
        }
        break
      }
      const beforeProps = beforeIdx >= 0 ? token.children[beforeIdx] : undefined
      if (!beforeProps || beforeProps.type !== 'text') return

      // Strip the trailing space the text picked up before the `{...}` token.
      if (typeof beforeProps.content === 'string') {
        beforeProps.content = beforeProps.content.replace(/[ \t]+$/, '')
      }

      const props = last.attrs
      // Drop the props token (last) plus any empty text tokens it left behind.
      token.children.length = beforeProps.content ? beforeIdx + 1 : beforeIdx
      props?.forEach(([key, value]) => {
        if (key === 'class') prev.attrJoin('class', value)
        else prev.attrSet(key, value)
      })
    })

    return tokens
  }

  md.renderer.renderInline = wrapRenderInline(md.renderer.renderInline)
  // Support markdown-exit's async inline renderer
  if ('renderInlineAsync' in md.renderer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors the sync wrapper for the async overload
    ;(md.renderer as any).renderInlineAsync = wrapRenderInline((md.renderer as any).renderInlineAsync)
  }
}

function wrapRenderInline(renderInline: Renderer['renderInline']): Renderer['renderInline'] {
  return function (this: Renderer, tokens, options, env) {
    tokens = [...tokens]
    tokens.forEach((token, index) => {
      if (token.type !== 'mdc_inline_props') return

      let prevIndex = index - 1
      let prev = tokens[prevIndex]
      // Skip whitespace-only text tokens
      while (prevIndex >= 0) {
        if (prev.type === 'text' && !prev.content.trim()) {
          prevIndex--
          prev = tokens[prevIndex]
        } else {
          break
        }
      }

      // Wrap a bare text token in a span so we can attach attrs to it
      if (!prev.tag && prev.type === 'text') {
        prev = new Token('mdc_inline_span', 'span', 1)
        tokens.splice(index - 1, 0, prev)
        const close = new Token('mdc_inline_span', 'span', -1)
        tokens.splice(index + 2, 0, close)
      } else if (prev.nesting === -1) {
        // Resolve a closing tag back to its matching opening tag
        let searchIndex = index - 1
        while (searchIndex >= 0) {
          const searchToken = tokens[searchIndex]
          if (searchToken.nesting === 1 && searchToken.tag === prev.tag && searchToken.level === prev.level) {
            prev = searchToken
            break
          }
          searchIndex--
        }
      }

      if (prev.nesting === -1) throw new Error(`No matching opening tag found for ${JSON.stringify(prev)}`)

      token.attrs?.forEach(([key, value]) => {
        if (key === 'class') prev.attrJoin('class', value)
        else prev.attrSet(key, value)
      })
    })
    return renderInline.call(this, tokens, options, env)
  }
}

/** markdown-it / markdown-exit adapter for Comark inline attributes (`{props}`). */
export const markdownItAttributes: PluginSimple = markdownItInlineProps

export default defineComarkPlugin(() => ({
  name: 'attributes',
  markdownItPlugins: [markdownItAttributes as unknown as MarkdownItPlugin],
}))
