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

import type { PluginSimple, Renderer } from 'markdown-exit/core'
import { Token } from 'markdown-exit/core'
import type { MarkdownItPlugin } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { searchProps } from '../internal/parse/syntax/props.ts'

const TEXT_TOKENS = new Set(['text', 'text_special', 'softbreak', 'hardbreak'])

const markdownItInlineProps: PluginSimple = (md) => {
  // End of the last brace group rejected as text, per inline state. A later `{`
  // after text inside it would be rejected too, so it is skipped without
  // rescanning the same suffix (keeps O(n)).
  const rejectedUntil = new WeakMap<object, number>()
  // Set while re-tokenizing a restored brace group: the end of that source is
  // not the end of the line, since text followed the group in the original.
  let restoring = false

  md.inline.ruler.after('entity', 'comark_inline_props', (state, silent) => {
    const start = state.pos
    if (state.src[start] !== '{') return false

    // Skip Vue mustache `{{ }}` and template `${ }` syntax
    if (state.src[start + 1] === '{' || state.src[start - 1] === '{' || state.src[start - 1] === '$') return false

    // region -- Ignore attributes if (not follows a syntax && have some text after in same line)
    const last = state.tokens[state.tokens.length - 1]
    const afterText = state.pending !== '' || !last || TEXT_TOKENS.has(last.type)
    const lastDelimiter = state.delimiters[state.delimiters.length - 1]
    // Never while restoring: a restored group is re-tokenized from source, so an
    // unpaired closer inside it would restore again, recursing once per level.
    const afterCloser =
      !restoring &&
      state.pending === '' &&
      lastDelimiter?.close === true &&
      lastDelimiter.token === state.tokens.length - 1
    if (afterText && !afterCloser && start < (rejectedUntil.get(state) ?? -1)) return false

    const search = searchProps(state.src, start)
    if (!search) return false

    const { props, index: end } = search
    if (end === start) return false

    if (afterText && !afterCloser) {
      let searchEnd = end
      while (state.src[searchEnd] === ' ' || state.src[searchEnd] === '\t') searchEnd++
      // Check for linebreak or end of file
      if (restoring || (state.src[searchEnd] !== '\n' && state.src[searchEnd] !== undefined)) {
        rejectedUntil.set(state, end)
        return false
      }
    }
    // endregion

    state.pos = end

    if (silent) return true

    // Hidden token holding the props; later applied to the previous token
    const token = state.push('mdc_inline_props', 'span', 0)
    token.attrs = props
    token.hidden = true
    // Delimiters are paired only after tokenizing, so whether this closer has an
    // opener is decided in `comark_inline_props_unpaired` below.
    if (afterText && afterCloser) {
      token.content = state.src.slice(start, end)
      token.meta = { afterDelimiter: true }
    }

    return true
  })

  // A closer left unpaired by emphasis/strikethrough stays a non-empty `text`
  // token (paired `**` leaves its second marker as an empty one); its brace
  // group was never attributes, so re-tokenize it as regular inline content
  // (escapes, entities, code spans, …).
  md.inline.ruler2.before('fragments_join', 'comark_inline_props_unpaired', (state) => {
    const tokens = state.tokens
    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i]!
      if (token.type !== 'mdc_inline_props' || !token.meta?.afterDelimiter) continue
      const prev = tokens[i - 1]!
      if (prev.type !== 'text' || prev.content === '') continue
      const children: Token[] = []
      const wasRestoring = restoring
      restoring = true
      try {
        state.md.inline.parse(token.content, state.md, state.env, children)
      } finally {
        restoring = wasRestoring
      }
      tokens.splice(i, 1, ...children)
      i += children.length - 1
    }
    return false
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
