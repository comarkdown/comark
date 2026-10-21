import type { ComarkPlugin } from '../types.ts'
import type { SourceAttribute, SourceElement, SourceRange } from '../source.ts'
import type { PluginSimple, StateInline, Token } from 'markdown-exit'
import { parseBlockParams } from './parse/syntax/block-params.ts'

interface SourceContext {
  source: string
  lines: number[]
  elements: Map<Token, SourceElement>
  inline: number[] | undefined
  cursor: number
}

interface AttributeRange {
  name: string
  start?: number
  end?: number
}

interface SourceMetadata {
  sourceText: string
  sourceElements: SourceElement[]
}

function element(context: SourceContext, token: Token): SourceElement {
  let entry = context.elements.get(token)
  if (!entry) {
    entry = { tag: token.tag, attributes: [] }
    context.elements.set(token, entry)
  }
  return entry
}

function inlineRange(context: SourceContext, start: number, end: number): SourceRange | undefined {
  const positions = context.inline
  if (!positions || start > end || positions[end - 1] === undefined) return
  if (start === end) return { start: positions[start], end: positions[start] }
  for (let i = start + 1; i < end; i++) {
    if (positions[i] !== positions[i - 1] + 1) return
  }
  return { start: positions[start], end: positions[end - 1] + 1 }
}

function inlinePositions(
  context: SourceContext,
  content: string,
  lines: [number, number],
  table: boolean
): number[] | undefined {
  const positions: number[] = []
  const limit = context.lines[lines[1]] ?? context.source.length
  let cursor = Math.max(context.lines[lines[0]], context.cursor)
  context.cursor = limit
  if (table && context.source.slice(context.lines[lines[0]], limit).includes('\\|')) return
  const parts = content.split('\n')
  for (let i = 0; i < parts.length; i++) {
    const index = context.source.slice(cursor, limit).indexOf(parts[i])
    const found = index < 0 ? -1 : cursor + index
    if (found < 0 || found + parts[i].length > limit) return
    for (let j = 0; j < parts[i].length; j++) positions.push(found + j)
    cursor = found + parts[i].length
    if (i < parts.length - 1) {
      cursor = context.source.indexOf('\n', cursor)
      if (cursor < 0 || cursor >= limit) return
      positions.push(cursor++)
    }
  }
  context.cursor = cursor
  return positions
}

function precedingElement(tokens: Token[]): Token | undefined {
  let index = tokens.length - 2
  while (index >= 0 && tokens[index].type === 'text' && !tokens[index].content.trim()) index--
  const previous = tokens[index]
  if (!previous || previous.type === 'text') return
  if (previous.nesting !== -1) return previous
  for (let i = index - 1; i >= 0; i--) {
    const token = tokens[i]
    if (token.nesting === 1 && token.tag === previous.tag && token.level === previous.level) return token
  }
}

function linkRange(state: StateInline, context: SourceContext): SourceRange | undefined {
  let start = state.posMax + 1
  if (state.src[start] !== '(') return
  start++
  while (/\s/.test(state.src[start] ?? '') && start < state.src.length) start++
  const destination = state.md.helpers.parseLinkDestination(state.src, start, state.src.length)
  if (!destination.ok) return
  const angled = state.src[start] === '<'
  return inlineRange(context, start + (angled ? 1 : 0), destination.pos - (angled ? 1 : 0))
}

export function sourceRangesPlugin(): ComarkPlugin<SourceMetadata> {
  const environments = new WeakMap<object, SourceContext>()
  const documents = new WeakMap<Token[], SourceContext>()
  const track: PluginSimple = (md) => {
    md.core.ruler.after('block', 'comark_source_ranges', (state) => {
      const lines = [0]
      for (let i = 0; i < state.src.length; i++) if (state.src[i] === '\n') lines.push(i + 1)
      const context: SourceContext = { source: state.src, lines, elements: new Map(), inline: undefined, cursor: 0 }
      environments.set(state.env, context)
      documents.set(state.tokens, context)
      state.env.comarkSourceAttributes = (inline: StateInline, ranges: AttributeRange[]) => {
        const owner = precedingElement(inline.tokens)
        if (!owner) return
        for (const attribute of ranges) {
          const range =
            attribute.start === undefined || attribute.end === undefined
              ? undefined
              : inlineRange(context, attribute.start, attribute.end)
          element(context, owner).attributes.push({ name: attribute.name, range })
        }
      }
      for (const token of state.tokens) {
        if (!token.type.startsWith('mdc_block') || token.nesting === -1 || !token.map) continue
        const start = lines[token.map[0]]
        const end = state.src.indexOf('\n', start)
        const line = state.src.slice(start, end < 0 ? undefined : end)
        const marker = line.indexOf(':')
        if (marker < 0) continue
        let nameStart = marker
        while (line[nameStart] === ':') nameStart++
        while (line[nameStart] === ' ' || line[nameStart] === '\t') nameStart++
        const params = parseBlockParams(line.slice(nameStart), true)
        const attributes: SourceAttribute[] = (params.sourceRanges ?? []).map((range) => ({
          name: range.name,
          range:
            range.start === undefined || range.end === undefined
              ? undefined
              : { start: start + nameStart + range.start, end: start + nameStart + range.end },
        }))
        if (attributes.length) element(context, token).attributes.push(...attributes)
      }
    })

    md.core.ruler.at('inline', (state) => {
      const context = environments.get(state.env)!
      let lines: [number, number] = [0, context.lines.length]
      let tableDepth = 0
      for (const token of state.tokens) {
        if (token.tag === 'table') tableDepth += token.nesting
        if (token.map && token.nesting !== -1) lines = token.map
        if (token.type !== 'inline') continue
        context.inline = inlinePositions(context, token.content, lines, tableDepth > 0)
        md.inline.parse(token.content, md, state.env, token.children!)
      }
    })

    const active = new WeakSet<StateInline>()
    const tokenize = md.inline.tokenize
    md.inline.tokenize = (state) => {
      if (active.has(state)) return tokenize.call(md.inline, state)
      active.add(state)
      const context = environments.get(state.env)!
      const push = state.push
      state.push = function (type, tag, nesting) {
        const token = push.call(this, type, tag, nesting)
        if (type === 'link_open') {
          const range = linkRange(this, context)
          if (range) element(context, token).attributes.push({ name: 'href', range })
        }
        return token
      }
      try {
        tokenize.call(md.inline, state)
      } finally {
        state.push = push
        active.delete(state)
      }
    }
  }

  return {
    name: 'source-ranges',
    markdownItPlugins: [track],
    post(state) {
      const context = documents.get(state.tokens)!
      const elements: SourceElement[] = []
      function collect(tokens: Token[]): void {
        for (const token of tokens) {
          const entry = context.elements.get(token)
          if (entry) elements.push(entry)
          if (token.children && token.type !== 'image') collect(token.children)
        }
      }
      collect(state.tokens)
      state.tree.meta.sourceText = context.source
      state.tree.meta.sourceElements = elements
    },
  }
}
