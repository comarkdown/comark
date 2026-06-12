import type { MarkdownExit, PluginSimple, Renderer } from 'markdown-exit'
import { Token } from 'markdown-exit'
import type { MarkdownItPlugin, MarkdownItPluginWithOptions } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { parseBracketContent } from '../internal/parse/syntax/brackets.ts'
import { searchProps } from '../internal/parse/syntax/props.ts'
import { parseBlockParams } from '../internal/parse/syntax/block-params.ts'
import { parseYaml } from '../internal/yaml.ts'

export interface SyntaxOptions {
  /**
   * Enable block component syntax.
   *
   * @see https://comark.dev/syntax/components#block
   * @default true
   */
  blockComponent?: boolean
  /**
   * Enable inline props syntax.
   *
   * @see https://comark.dev/syntax/attributes
   * @default true
   */
  inlineProps?: boolean
  /**
   * Enable inline span syntax.
   *
   * @see https://comark.dev/syntax/attributes#span-attributes
   * @default true
   */
  inlineSpan?: boolean
  /**
   * Enable inline component syntax.
   *
   * @see https://comark.dev/syntax/components#inline
   * @default true
   */
  inlineComponent?: boolean
  /**
   * Enable inline binding syntax (`{{ value }}` and `{{ value || default }}`).
   *
   * Off by default — opt in here, or use the standalone `plugins/binding.ts` plugin.
   *
   * @see https://comark.dev/syntax/components#data-binding
   * @default false
   */
  inlineBinding?: boolean
  /**
   * The tag name used to render an inline binding.
   *
   * @default 'binding'
   */
  bindingTag?: string
}

/**
 * A component name must start with a letter or `$`, followed by word chars,
 * `$` or `-`. Mirrors the block name grammar (`RE_BLOCK_NAME = /^[a-z$]/i`).
 */
const RE_COMPONENT_NAME = /^[a-z$][\w$-]*/i

/**
 * Whether `name` begins with a syntactically valid component name.
 *
 * This prevents sequences such as `:8100` or `::30` from being treated as
 * components — a purely numeric name is not a valid component and would
 * otherwise produce invalid output like `createElement('8100')` (inline) or
 * throw `Invalid block params` (block).
 */
function isValidComponentName(name: string): boolean {
  return RE_COMPONENT_NAME.test(name)
}

// #region Block component plugin (`::name` and `::name ... ::`)

const blockYamlLines: Record<string, string> = {
  '---': '---',
  '```yaml [props]': '```',
  '~~~yaml [props]': '~~~',
  '```yml [props]': '```',
  '~~~yml [props]': '~~~',
}

const markdownItComarkBlock: PluginSimple = (md) => {
  const min_markers = 2
  const marker_str = ':'
  const marker_char = marker_str.charCodeAt(0)

  md.block.ruler.before(
    'fence',
    'comark_block_shorthand',
    function comark_block_shorthand(state, startLine, _endLine, silent) {
      const line = state.src.slice(state.bMarks[startLine] + state.tShift[startLine], state.eMarks[startLine])

      if (line[0] !== ':' || !isValidComponentName(line.slice(1))) return false

      const { name, content, props, remaining } = parseBlockParams(line.slice(1))

      // If there's unparsed remaining content, treat it as inline component in a paragraph
      if (remaining) return false

      state.lineMax = startLine + 1

      if (!silent) {
        if (content !== undefined) {
          const tokenOpen = state.push('mdc_block_shorthand', name, 1)
          props?.forEach(([key, value]) => {
            if (key === 'class') tokenOpen.attrJoin(key, value)
            else tokenOpen.attrSet(key, value)
          })
          tokenOpen.map = [startLine, startLine + 1]

          const inline = state.push('inline', '', 0)
          inline.content = content
          inline.children = []

          const tokenClose = state.push('mdc_block_shorthand', name, -1)
          tokenClose.map = [startLine, startLine + 1]
        } else {
          const token = state.push('mdc_block_shorthand', name, 0)
          token.map = [startLine, startLine + 1]
          props?.forEach(([key, value]) => {
            if (key === 'class') token.attrJoin(key, value)
            else token.attrSet(key, value)
          })
        }
      }

      state.line = startLine + 1
      return true
    }
  )

  md.block.ruler.before(
    'fence',
    'comark_block',
    function comark_block(state, startLine, endLine, silent) {
      let pos: number
      let nextLine: number
      let auto_closed = false
      let start = state.bMarks[startLine] + state.tShift[startLine]
      let max = state.eMarks[startLine]
      const indent = state.sCount[startLine]

      // Track code fences (``` or ~~~) so we don't match closing :: inside them
      let inCodeFence = false
      let codeFenceCharCode = 0
      let codeFenceCount = 0

      // Track nesting depth for blocks with the same marker count
      let nestingDepth = 0

      if (state.src[start] !== ':') return false

      for (pos = start + 1; pos <= max; pos++) {
        if (marker_str !== state.src[pos]) break
      }

      const marker_count = Math.floor(pos - start)
      if (marker_count < min_markers) return false

      const markup = state.src.slice(start, pos)

      // Bail out (plain text) on an invalid name instead of letting
      // parseBlockParams throw on e.g. `::8100`.
      const nameStart = state.skipSpaces(pos)
      if (nameStart < max && !isValidComponentName(state.src.slice(nameStart, max))) return false

      const params = parseBlockParams(state.src.slice(pos, max))

      if (!params.name) return false

      if (silent) return true

      nextLine = startLine

      for (;;) {
        nextLine++
        if (nextLine >= endLine) break

        start = state.bMarks[nextLine] + state.tShift[nextLine]
        max = state.eMarks[nextLine]

        if (start < max && state.sCount[nextLine] < state.blkIndent) break

        const lineCharCode = state.src.charCodeAt(start)

        // Detect closing code fence (``` or ~~~)
        if (inCodeFence) {
          if (lineCharCode === codeFenceCharCode) {
            let fencePos = start + 1
            while (fencePos < max && state.src.charCodeAt(fencePos) === codeFenceCharCode) fencePos++
            if (fencePos - start >= codeFenceCount) {
              const afterFence = state.skipSpaces(fencePos)
              if (afterFence >= max) inCodeFence = false
            }
          }
          continue
        }

        // Detect opening code fence (``` or ~~~)
        if (lineCharCode === 0x60 /* ` */ || lineCharCode === 0x7e /* ~ */) {
          let fencePos = start + 1
          while (fencePos < max && state.src.charCodeAt(fencePos) === lineCharCode) fencePos++
          if (fencePos - start >= 3) {
            inCodeFence = true
            codeFenceCharCode = lineCharCode
            codeFenceCount = fencePos - start
            continue
          }
        }

        if (marker_char !== lineCharCode) continue

        for (pos = start + 1; pos <= max; pos++) {
          if (marker_str !== state.src[pos]) break
        }

        // Closing fence must match the opening fence length
        if (pos - start !== marker_count) continue

        pos = state.skipSpaces(pos)

        if (pos < max) {
          // A new nested block opens with same marker count
          nestingDepth++
          continue
        }

        if (nestingDepth > 0) {
          nestingDepth--
          continue
        }

        auto_closed = true
        break
      }

      const old_parent = state.parentType
      const old_line_max = state.lineMax
      state.parentType = 'comark_block'

      // Prevent lazy continuations from going past our end marker
      state.lineMax = nextLine

      const tokenOpen = state.push('mdc_block_open', params.name, 1)
      tokenOpen.markup = markup
      tokenOpen.block = true
      tokenOpen.info = params.name
      tokenOpen.map = [startLine, nextLine]

      params.props?.forEach(([key, value]) => {
        if (key === 'class') tokenOpen.attrJoin(key, value)
        else tokenOpen.attrSet(key, value)
      })

      // Render bracket content as the first paragraph: `::block[Content]\n::`
      if (params.content !== undefined) {
        const pOpen = state.push('paragraph_open', 'p', 1)
        pOpen.map = [startLine, startLine + 1]
        const inline = state.push('inline', '', 0)
        inline.content = params.content
        inline.children = []
        state.push('paragraph_close', 'p', -1)
      }

      const blkIndent = state.blkIndent
      state.blkIndent = indent
      state.env.comarkBlockTokens ||= [] as Token[]
      state.env.comarkBlockTokens.unshift(tokenOpen)
      state.md.block.tokenize(state, startLine + 1, nextLine)
      state.blkIndent = blkIndent
      state.env.comarkBlockTokens.shift()

      const tokenClose = state.push('mdc_block_close', params.name, -1)
      tokenClose.map = [startLine, nextLine]
      tokenClose.markup = state.src.slice(start, pos)
      tokenClose.block = true

      // Hide the wrapper paragraph for single-paragraph blocks
      state.tokens
        .slice(state.tokens.indexOf(tokenOpen) + 1, state.tokens.indexOf(tokenClose))
        .filter((i) => i.level === tokenOpen.level + 1)
        .forEach((i, _, arr) => {
          if (arr.length <= 2 && i.tag === 'p') i.hidden = true
        })

      state.parentType = old_parent
      state.lineMax = old_line_max
      state.line = nextLine + (auto_closed ? 1 : 0)

      return true
    },
    {
      alt: ['paragraph', 'reference', 'blockquote', 'list'],
    }
  )

  md.block.ruler.after('code', 'comark_block_yaml', function comark_block_yaml(state, startLine, endLine, silent) {
    if (!state.env.comarkBlockTokens?.length) return false

    const start = state.bMarks[startLine] + state.tShift[startLine]
    const end = state.eMarks[startLine]

    const line = state.src.slice(start, end)
    const blockAttributesClosingFence = blockYamlLines[line] || ''

    if (!blockAttributesClosingFence) return false

    // The `---` fence is only valid on the line immediately after the component opener. Any other `---` is a thematic break.
    if (line === '---') {
      const parentOpenLine = state.env.comarkBlockTokens[0].map?.[0]
      if (parentOpenLine === undefined || startLine !== parentOpenLine + 1) return false
    }

    let lineEnd = startLine + 1
    let found = false
    while (lineEnd < endLine) {
      const inner = state.src.slice(state.bMarks[lineEnd] + state.tShift[startLine], state.eMarks[lineEnd])
      if (inner === blockAttributesClosingFence) {
        found = true
        break
      }
      lineEnd += 1
    }

    if (!found) return false

    if (!silent) {
      const yaml = state.src.slice(state.bMarks[startLine + 1], state.eMarks[lineEnd - 1])
      const data = parseYaml(yaml)
      const token = state.env.comarkBlockTokens[0]
      Object.entries(data || {}).forEach(([key, value]) => {
        if (key === 'class') token.attrJoin(key, value as string)
        else token.attrSet(key, typeof value === 'string' ? value : JSON.stringify(value))
      })
    }

    state.line = lineEnd + 1
    state.lineMax = lineEnd + 1
    return true
  })

  md.block.ruler.after('code', 'comark_block_slots', function comark_block_slots(state, startLine, endLine, silent) {
    if (!state.env.comarkBlockTokens?.length) return false

    const start = state.bMarks[startLine] + state.tShift[startLine]

    if (!(state.src[start] === '#' && state.src[start + 1] !== ' ' && state.src[start + 1] !== '#')) return false

    const line = state.src.slice(start, state.eMarks[startLine])

    const { name, props } = parseBlockParams(line.slice(1))

    let lineEnd = startLine + 1
    let inCodeFence = false
    let codeFenceChar = ''
    let codeFenceCount = 0
    while (lineEnd < endLine) {
      const inner = state.src.slice(state.bMarks[lineEnd] + state.tShift[startLine], state.eMarks[lineEnd])

      if (inCodeFence) {
        // Look for matching closing fence (same char, >= opening count, nothing but spaces after)
        if (inner[0] === codeFenceChar) {
          let fencePos = 1
          while (fencePos < inner.length && inner[fencePos] === codeFenceChar) fencePos++
          if (fencePos >= codeFenceCount && inner.slice(fencePos).trim() === '') {
            inCodeFence = false
          }
        }
        lineEnd += 1
        continue
      }

      // Detect opening code fence (``` or ~~~, length >= 3)
      if (inner[0] === '`' || inner[0] === '~') {
        const ch = inner[0]
        let fencePos = 1
        while (fencePos < inner.length && inner[fencePos] === ch) fencePos++
        if (fencePos >= 3) {
          inCodeFence = true
          codeFenceChar = ch
          codeFenceCount = fencePos
          lineEnd += 1
          continue
        }
      }

      if (/^#\w+/.test(inner) || inner.startsWith('::')) break
      lineEnd += 1
    }

    if (silent) {
      state.line = lineEnd
      state.lineMax = lineEnd
      return true
    }

    state.lineMax = startLine + 1
    const slot = state.push('mdc_block_slot', 'template', 1)
    slot.attrSet(`#${name}`, '')
    props?.forEach(([key, value]) => {
      if (key === 'class') slot.attrJoin(key, value)
      else slot.attrSet(key, value)
    })

    state.line = startLine + 1
    state.lineMax = lineEnd

    state.md.block.tokenize(state, startLine + 1, lineEnd)

    state.push('mdc_block_slot', 'template', -1)

    state.line = lineEnd
    state.lineMax = lineEnd

    return true
  })
}

// #endregion

// #region Inline span plugin (`[text]`)

const markdownItInlineSpan: PluginSimple = (md) => {
  md.inline.ruler.before('link', 'comark_inline_span', (state, silent) => {
    const start = state.pos
    if (state.src[start] !== '[') return false

    let index = start + 1
    let depth = 0
    while (index < state.src.length) {
      if (state.src[index] === '\\') {
        index += 2
        continue
      }
      if (state.src[index] === '[') {
        depth++
      } else if (state.src[index] === ']') {
        if (depth === 0) break
        depth--
      }
      index += 1
    }

    if (index === start) return false

    // Don't match `[text](url)` or `[text][ref]` — let the link parser handle those
    const nextChar = state.src[index + 1]
    if (nextChar === '(' || nextChar === '[') return false

    if (silent) return true

    state.push('mdc_inline_span', 'span', 1)

    const oldPos = state.pos
    const oldPosMax = state.posMax
    state.pos = start + 1
    state.posMax = index
    state.md.inline.tokenize(state)
    state.pos = oldPos
    state.posMax = oldPosMax

    state.push('mdc_inline_span', 'span', -1)

    state.pos = index + 1

    return true
  })
}

// #endregion

// #region Inline component plugin (`:name[content]{props}`)

const ALLOWED_PREV_CHARS = new Set([' ', '\t', '\n', '*', '_', '['])

const markdownItInlineComponent: PluginSimple = (md) => {
  md.inline.ruler.after('entity', 'comark_inline_component', (state, silent) => {
    const start = state.pos
    if (state.src[start] !== ':') return false

    const prevChar = state.src[start - 1]
    if (start > 0 && !ALLOWED_PREV_CHARS.has(prevChar)) return false

    let index = start + 1
    let nameEnd = -1
    let contentStart = -1
    let contentEnd = -1

    while (index < state.src.length) {
      const char = state.src[index]
      if (char === '[') {
        nameEnd = index
        const result = parseBracketContent(state.src, index)
        if (result) {
          contentStart = index + 1
          contentEnd = result.endIndex - 1
          index = result.endIndex
        }
        break
      }
      if (!/[\w$-]/.test(char)) break
      index += 1
    }

    if (nameEnd === -1) nameEnd = index

    // Empty name
    if (nameEnd <= start + 1) return false

    const name = state.src.slice(start + 1, nameEnd)
    if (!isValidComponentName(name)) return false

    state.pos = index

    if (silent) return true

    if (contentStart !== -1) {
      state.push('mdc_inline_component', name, 1)

      const oldPos = state.pos
      const oldPosMax = state.posMax
      state.pos = contentStart
      state.posMax = contentEnd
      state.md.inline.tokenize(state)
      state.pos = oldPos
      state.posMax = oldPosMax

      state.push('mdc_inline_component', name, -1)
    } else {
      state.push('mdc_inline_component', name, 0)
    }

    return true
  })
}

// #endregion

// #region Inline props plugin (`{class="foo"}` after a token)

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

// #endregion

function applySyntax(md: MarkdownExit, options: SyntaxOptions = {}) {
  const { blockComponent = true, inlineProps = true, inlineSpan = true, inlineComponent = true } = options

  if (blockComponent) md.use(markdownItComarkBlock)
  if (inlineProps) md.use(markdownItInlineProps)
  if (inlineSpan) md.use(markdownItInlineSpan)
  if (inlineComponent) md.use(markdownItInlineComponent)
}

export default defineComarkPlugin((options: SyntaxOptions = {}) => ({
  name: 'syntax',
  markdownItPlugins: [((md: MarkdownExit) => applySyntax(md, options)) as unknown as MarkdownItPlugin],
}))

export const markdownItComark = applySyntax as unknown as MarkdownItPluginWithOptions<SyntaxOptions>
