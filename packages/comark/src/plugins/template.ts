import type { PluginSimple } from 'markdown-exit'
import type { ElementNode, MarkdownItPlugin, Node } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { compileExpression, compileIterable } from '../internal/template/expression.ts'

export { resolveTemplates } from '../internal/template/resolve.ts'
export type { TemplateOptions } from '../internal/template/resolve.ts'

interface Delimiter {
  content: string
  end: number
  kind: string
  left: boolean
  right: boolean
}

function delimiter(source: string, start: number): Delimiter | undefined {
  if (source[start] !== '{' || !['{', '%', '#'].includes(source[start + 1])) return undefined
  const kind = source[start + 1]
  const closing = kind === '{' ? '}' : kind
  const left = source[start + 2] === '-'
  const contentStart = start + (left ? 3 : 2)
  let position = contentStart
  let quote = ''
  let brackets = 0
  while (position < source.length - 1) {
    const char = source[position]
    if (quote) {
      if (char === '\\') position++
      else if (char === quote) quote = ''
      position++
      continue
    }
    if (char === closing && source[position + 1] === '}' && brackets === 0) {
      const right = source[position - 1] === '-'
      return {
        kind,
        content: source.slice(contentStart, right ? position - 1 : position).trim(),
        end: position + 2,
        left,
        right,
      }
    }
    if (kind !== '#' && (char === '"' || char === "'")) quote = char
    if (kind !== '#' && '[({'.includes(char)) brackets++
    if (kind !== '#' && '])}'.includes(char)) brackets--
    position++
  }
  throw new SyntaxError('Unclosed template delimiter')
}

const markdownItTemplate: PluginSimple = (md) => {
  md.inline.ruler.before('text', 'comark_template', (state, silent) => {
    const match = delimiter(state.src, state.pos)
    if (!match) return false
    if (!silent) {
      const token = state.push('mdc_inline_component', match.kind === '{' ? 'comark-expression' : 'comark-directive', 0)
      token.attrSet('source', match.kind === '#' ? 'comment' : match.content)
      token.attrSet('trimLeft', match.left ? 'true' : '')
      token.attrSet('trimRight', match.right ? 'true' : '')
    }
    state.pos = match.end
    return true
  })
  md.block.ruler.before(
    'paragraph',
    'comark_template',
    (state, startLine, _endLine, silent) => {
      const start = state.bMarks[startLine] + state.tShift[startLine]
      if (state.sCount[startLine] - state.blkIndent >= 4) return false
      if (!['%', '#'].includes(state.src[start + 1]) || state.src[start] !== '{') return false
      const match = delimiter(state.src, start)
      if (!match) return false
      let lastLine = startLine
      while (state.eMarks[lastLine] < match.end) lastLine++
      if (state.src.slice(match.end, state.eMarks[lastLine]).trim()) return false
      if (silent) return true
      const token = state.push('comark_template', 'comark-directive', 0)
      token.block = true
      token.map = [startLine, lastLine + 1]
      token.attrSet('source', match.kind === '#' ? 'comment' : match.content)
      token.attrSet('block', 'true')
      state.line = lastLine + 1
      return true
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
  )
}

function loopHeader(source: string): { names: string[]; expression: string } {
  const match = /^for\s+([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s+in\s+([\s\S]+)$/.exec(source)
  if (!match) throw new SyntaxError('Expected for name in expression')
  const names = match[1].split(',').map((name) => name.trim())
  if (
    new Set(names).size !== names.length ||
    names.some((name) =>
      [
        'loop',
        'data',
        'meta',
        'frontmatter',
        'props',
        'Object',
        'Array',
        'true',
        'false',
        'null',
        'undefined',
        '__proto__',
        'constructor',
        'prototype',
      ].includes(name)
    )
  )
    throw new SyntaxError('Invalid template loop variable')
  compileIterable(match[2])
  return { names, expression: match[2] }
}

function group(nodes: Node[], depth = 0): Node[] {
  if (depth > 64) throw new Error('Template nesting limit exceeded')
  const result: Node[] = []
  const stack: { node: ElementNode; target: Node[]; hasElse: boolean }[] = []
  let target = result
  let trimNext = false
  for (const original of nodes) {
    let node = original
    if (typeof node === 'string') {
      target.push(trimNext ? node.trimStart() : node)
      trimNext = false
      continue
    }
    if (node[0] === null) {
      target.push(node)
      continue
    }
    const [tag, attrs, ...children] = node
    if (attrs.trimLeft === 'true' && typeof target[target.length - 1] === 'string')
      target[target.length - 1] = (target[target.length - 1] as string).trimEnd()
    if (attrs.trimRight === 'true') trimNext = true
    if (tag === 'comark-expression') {
      compileExpression(String(attrs.source))
      target.push(node)
      continue
    }
    if (tag !== 'comark-directive') {
      node = [tag, attrs, ...group(children, depth + 1)]
      target.push(node)
      continue
    }
    const source = String(attrs.source)
    if (source === 'comment') continue
    const keyword = source.split(/\s/, 1)[0]
    if (keyword === 'if' || keyword === 'for') {
      if (stack.length + depth >= 64) throw new Error('Template nesting limit exceeded')
      const attributes = {
        ...(keyword === 'if' ? { test: source.slice(2).trim() } : loopHeader(source)),
        block: attrs.block === 'true',
      }
      if ('test' in attributes) compileExpression(attributes.test)
      const branch: ElementNode = ['comark-branch', {}]
      const control: ElementNode = [`comark-${keyword}`, attributes, branch]
      target.push(control)
      stack.push({ node: control, target, hasElse: false })
      target = branch as unknown as Node[]
      continue
    }
    const frame = stack[stack.length - 1]
    if (!frame) throw new SyntaxError(`Orphan or unsupported template directive: ${source}`)
    if (keyword === 'else' || keyword === 'elif') {
      if (frame.hasElse || (keyword === 'elif' && frame.node[0] !== 'comark-if'))
        throw new SyntaxError(`Unexpected ${keyword}`)
      if (keyword === 'else' && source !== 'else') throw new SyntaxError('Unexpected content after else')
      const attributes = keyword === 'elif' ? { test: source.slice(4).trim() } : {}
      if ('test' in attributes) compileExpression(attributes.test as string)
      const branch: ElementNode = ['comark-branch', attributes]
      frame.node.push(branch)
      frame.hasElse = keyword === 'else'
      target = branch as unknown as Node[]
      continue
    }
    if (source !== (frame.node[0] === 'comark-if' ? 'endif' : 'endfor'))
      throw new SyntaxError(`Unexpected template directive: ${source}`)
    target = frame.target
    stack.pop()
  }
  if (stack.length) throw new SyntaxError('Unclosed template control block or crossed Markdown boundary')
  return result
}

export default defineComarkPlugin(() => ({
  name: 'template',
  markdownItPlugins: [markdownItTemplate as unknown as MarkdownItPlugin],
  pre(state) {
    if (state.options.plugins?.some((plugin) => plugin.name === 'binding'))
      throw new Error('template and binding plugins cannot be combined')
  },
  post(state) {
    state.tree.nodes = group(state.tree.nodes)
    state.tree.meta.comarkTemplate = true
  },
}))
